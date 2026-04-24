import axios from "axios";

export interface GeminiContentPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiContent {
  role?: "user" | "model";
  parts: GeminiContentPart[];
}

export interface GeminiGenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

export interface GeminiRequest {
  contents: GeminiContent[];
  system_instruction?: {
    parts: GeminiContentPart[];
  };
  generationConfig?: GeminiGenerationConfig;
}

interface GeminiModelInfo {
  name?: string;
  supportedGenerationMethods?: string[];
}

const GEMINI_API_VERSIONS = ["v1beta", "v1"] as const;
const DEFAULT_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
  "gemini-1.5-pro-latest",
  "gemini-1.5-pro",
];

const normalizeModelName = (name: string): string => name.replace(/^models\//, "");

/**
 * Lists available Gemini models for a specific API version
 */
export const listGeminiModels = async (
  apiVersion: string,
  apiKey: string
): Promise<string[]> => {
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${apiKey}`,
      { timeout: 10000 }
    );

    const models = (response.data?.models ?? []) as GeminiModelInfo[];
    return models
      .filter((m) => {
        const supportsGenerate = m.supportedGenerationMethods?.includes("generateContent");
        return Boolean(supportsGenerate) || (m.name ?? "").includes("gemini");
      })
      .map((m) => normalizeModelName(m.name ?? ""))
      .filter(Boolean);
  } catch (error) {
    console.error(`[Gemini] Failed to list models for ${apiVersion}:`, error instanceof Error ? error.message : error);
    return [];
  }
};

/**
 * Calls Gemini API with robust model/version fallback logic
 */
export const callGemini = async (
  request: GeminiRequest,
  options: {
    apiKey?: string;
    preferredModel?: string;
    timeout?: number;
  } = {}
): Promise<string> => {
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const timeout = options.timeout || 40000;
  const envModel = process.env.GEMINI_MODEL;
  
  let lastError: any = null;

  for (const apiVersion of GEMINI_API_VERSIONS) {
    // Dynamically discover models available for this key/version
    const discoveredModels = await listGeminiModels(apiVersion, apiKey);
    if (discoveredModels.length > 0) {
      console.log(`[Gemini] Discovered models for ${apiVersion}: ${discoveredModels.join(", ")}`);
    }
    
    // Build a prioritized list of models to try for this specific API version
    const modelsToTry = [
      ...(options.preferredModel ? [normalizeModelName(options.preferredModel)] : []),
      ...(envModel ? [normalizeModelName(envModel)] : []),
      ...discoveredModels,
      ...DEFAULT_MODELS,
    ].filter((v, i, a) => a.indexOf(v) === i); // Deduplicate

    console.log(`[Gemini] Trying ${apiVersion} with models: ${modelsToTry.slice(0, 5).join(", ")}...`);

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;
        
        const response = await axios.post(url, request, { timeout });

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log(`[Gemini] Success with ${apiVersion}/${modelName}`);
          return text;
        }
        
        throw new Error("Empty response from Gemini");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const upstreamMessage = typeof error.response?.data === "object" 
            ? JSON.stringify(error.response?.data) 
            : String(error.response?.data ?? "Unknown error");
            
          lastError = `Gemini ${apiVersion}/${modelName} failed (${status}): ${upstreamMessage}`;
          
          if (status === 404) {
            // Model not found in this version, try next model
            continue;
          }
          
          if (status === 429) {
            console.warn(`[Gemini] Rate limit hit for ${modelName} (${apiVersion}), trying next...`);
            continue;
          }

          // For other errors (400, 401, 500), we might want to log and continue too
          console.warn(`[Gemini] ${modelName} (${apiVersion}) failed with ${status}, trying next...`);
        } else {
          lastError = error instanceof Error ? error.message : "Unknown error";
          console.warn(`[Gemini] Internal error for ${modelName}:`, lastError);
        }
      }
    }
  }

  throw new Error(`All Gemini API attempts failed. Please check your API key and quota. Last error: ${lastError}`);
};
