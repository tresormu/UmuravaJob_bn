import type { Request, Response } from "express";
import axios from "axios";
import { Types } from "mongoose";
import Applicant from "../Models/Applicant.model.js";
import Job from "../Models/Job.model.js";

interface RankedCandidate {
  rank: number;
  candidate_name: string;
  score: number;
  summary: string;
}

interface RankedCandidatesResponse {
  ranked_candidates: RankedCandidate[];
}

interface GeminiModelInfo {
  name?: string;
  supportedGenerationMethods?: string[];
}

const GEMINI_MODELS_TO_TRY = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
].filter((value, index, arr): value is string => {
  if (!value) return false;
  return arr.indexOf(value) === index;
});

const GEMINI_API_VERSIONS = ["v1beta", "v1"] as const;

const normalizeModelName = (value: string): string => value.replace(/^models\//, "");

const extractJsonFromGeminiText = (raw: string): string => {
  const cleaned = raw.trim();
  const codeFenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeFenceMatch?.[1]) {
    return codeFenceMatch[1].trim();
  }
  return cleaned;
};

const listGeminiModelsForVersion = async (
  apiVersion: (typeof GEMINI_API_VERSIONS)[number],
  apiKey: string,
): Promise<string[]> => {
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${apiKey}`,
    );

    const models = (response.data?.models ?? []) as GeminiModelInfo[];
    const candidates = models
      .filter((model) => {
        const modelName = model.name ?? "";
        const supportsGenerate = model.supportedGenerationMethods?.includes(
          "generateContent",
        );
        return Boolean(supportsGenerate) || modelName.includes("gemini");
      })
      .map((model) => normalizeModelName(model.name ?? ""))
      .filter(Boolean);

    return [...new Set(candidates)];
  } catch {
    return [];
  }
};

const rankApplicantsWithGemini = async (
  jobData: Record<string, unknown>,
  applicantsData: Array<Record<string, unknown>>,
): Promise<RankedCandidatesResponse> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required for candidate ranking");
  }

  const prompt = `You are an AI recruitment assistant.

You will receive:
- One job 
- Multiple candidate CVs

Task:
1. Score each candidate using the defined scoring system
2. Rank candidates from highest to lowest
3. Provide a short justification for ranking

Return output in JSON:

{
  "ranked_candidates": [
    {
      "rank": 1,
      "candidate_name": "",
      "score": ,
      "summary": ""
    }
  ]
}

Scoring system:
- Skills: 50
- Experience: 30
- Education: 10
- Relevance: 10

Be consistent across all candidates.

Job:
${JSON.stringify(jobData, null, 2)}

Candidates:
${JSON.stringify(applicantsData, null, 2)}`;

  let lastErrorMessage = "Gemini request failed";

  for (const apiVersion of GEMINI_API_VERSIONS) {
    const discoveredModels = await listGeminiModelsForVersion(apiVersion, apiKey);
    const modelsForVersion = [...new Set([...GEMINI_MODELS_TO_TRY, ...discoveredModels])];

    for (const modelName of modelsForVersion) {
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1 },
          },
        );

        const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (!rawText) {
          throw new Error("Gemini returned an empty response");
        }

        const jsonText = extractJsonFromGeminiText(String(rawText));
        const parsed = JSON.parse(jsonText) as RankedCandidatesResponse;
        if (!Array.isArray(parsed.ranked_candidates)) {
          throw new Error("Gemini response missing ranked_candidates array");
        }

        return parsed;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const statusCode = error.response?.status;
          const upstreamMessage =
            typeof error.response?.data === "string"
              ? error.response.data
              : JSON.stringify(error.response?.data ?? {});
          lastErrorMessage = `Gemini ${apiVersion}/${modelName} failed with status ${statusCode ?? "unknown"}: ${upstreamMessage}`;

          if (statusCode === 404) {
            continue;
          }
        } else {
          lastErrorMessage = error instanceof Error ? error.message : "Unknown Gemini error";
        }
      }
    }
  }

  throw new Error(
    `${lastErrorMessage}. Check GEMINI_API_KEY and optionally set GEMINI_MODEL in .env`,
  );
};

class ApplicantRankingController {
  static async rankApplicantsForJob(req: Request, res: Response): Promise<void> {
    try {
      const jobId = typeof req.query.jobId === "string" ? req.query.jobId : undefined;
      if (!jobId) {
        res.status(400).json({ message: "jobId query parameter is required" });
        return;
      }

      if (!Types.ObjectId.isValid(jobId)) {
        res.status(400).json({ message: "Invalid jobId" });
        return;
      }

      const job = await Job.findById(jobId).lean();
      if (!job) {
        res.status(404).json({ message: "Job not found" });
        return;
      }

      const applicants = await Applicant.find({ jobId: new Types.ObjectId(jobId) })
        .sort({ createdAt: -1 })
        .lean();

      if (applicants.length === 0) {
        res.status(404).json({ message: "No applicants found for this job" });
        return;
      }

      const jobPayload = {
        id: String(job._id),
        title: job.title,
        description: job.description ?? "",
        skills: job.skills ?? [],
        experience: job.experience ?? 0,
        education: job.education ?? "",
        location: job.location ?? "",
      };

      const candidatesPayload = applicants.map((applicant) => {
        const parsedData = applicant.parsedData ?? {};
        const structuredProfile = applicant.structuredProfile ?? {};

        return {
          applicant_id: String(applicant._id),
          candidate_name: applicant.fullName,
          email: applicant.email ?? "",
          location: applicant.location ?? "",
          skills: parsedData.skills ?? structuredProfile.skills ?? [],
          experience_years: parsedData.experienceYears ?? 0,
          education: parsedData.education ?? structuredProfile.education ?? [],
          resume_text: applicant.resumeText ?? "",
          applicant_profile: applicant.applicantProfile ?? {},
        };
      });

      const ranking = await rankApplicantsWithGemini(jobPayload, candidatesPayload);

      const topTen = ranking.ranked_candidates
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((candidate, index) => ({
          rank: index + 1,
          candidate_name: candidate.candidate_name,
          score: candidate.score,
          summary: candidate.summary,
        }));

      res.status(200).json({
        message: "Applicants ranked successfully",
        jobId,
        totalApplicants: applicants.length,
        ranked_candidates: topTen,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to rank applicants",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default ApplicantRankingController;
