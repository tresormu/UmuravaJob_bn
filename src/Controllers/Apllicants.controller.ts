import type { Request, Response } from "express";
import axios from "axios";
import { PDFParse } from "pdf-parse";

type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";
type LanguageProficiency = "Basic" | "Conversational" | "Fluent" | "Native";
type AvailabilityStatus = "Available" | "Open to Opportunities" | "Not Available";
type AvailabilityType = "Full-time" | "Part-time" | "Contract";

interface PersonaInfo {
	firstName: string;
	lastName: string;
	email: string;
	headline: string;
	location: string;
}

interface SkillItem {
	name: string;
	level: SkillLevel;
	yearsOfExperience: number;
}

interface LanguageItem {
	name: string;
	proficiency: LanguageProficiency;
}

interface WorkExperienceItem {
	company: string;
	role: string;
	startDate: string;
	endDate: string;
	description: string;
	technologies: string[];
	isCurrent: boolean;
}

interface EducationItem {
	institution: string;
	degree: string;
	fieldOfStudy: string;
	startYear: number;
	endYear: number;
}

interface CertificationItem {
	name: string;
	issuer: string;
	issueDate: string;
}

interface ProjectItem {
	name: string;
	description: string;
	technologies: string[];
	role: string;
	link: string;
	startDate: string;
	endDate: string;
}

interface SocialLinks {
	linkedin: string;
	github: string;
	portfolio: string;
}

interface Availability {
	status: AvailabilityStatus;
	type: AvailabilityType;
	startDate?: string;
}

interface ApplicantScreeningProfile {
	personaInfo: PersonaInfo;
	skills: SkillItem[];
	languages: LanguageItem[];
	workExperience: WorkExperienceItem[];
	education: EducationItem[];
	certifications: CertificationItem[];
	projects: ProjectItem[];
	socialLinks: SocialLinks;
	availability: Availability;
}

const APPLICANT_SCREENING_SCHEMA_EXAMPLE: ApplicantScreeningProfile = {
	personaInfo: {
		firstName: "John",
		lastName: "Doe",
		email: "john.doe@example.com",
		headline: "Backend Engineer with 3+ years building Node.js APIs",
		location: "Kigali, Rwanda",
	},
	skills: [
		{
			name: "Node.js",
			level: "Advanced",
			yearsOfExperience: 3,
		},
	],
	languages: [
		{
			name: "English",
			proficiency: "Fluent",
		},
	],
	workExperience: [
		{
			company: "Example Company",
			role: "Backend Engineer",
			startDate: "2022-01",
			endDate: "Present",
			description: "Built scalable APIs and background workers",
			technologies: ["Node.js", "PostgreSQL"],
			isCurrent: true,
		},
	],
	education: [
		{
			institution: "University Name",
			degree: "Bachelor's",
			fieldOfStudy: "Computer Science",
			startYear: 2020,
			endYear: 2024,
		},
	],
	certifications: [
		{
			name: "AWS Certified Developer",
			issuer: "Amazon",
			issueDate: "2024-07",
		},
	],
	projects: [
		{
			name: "AI Recruitment System",
			description: "AI-powered candidate screening platform",
			technologies: ["Next.js", "Node.js", "Gemini API"],
			role: "Backend Engineer",
			link: "https://example.com",
			startDate: "2024-01",
			endDate: "2024-06",
		},
	],
	socialLinks: {
		linkedin: "https://linkedin.com/in/example",
		github: "https://github.com/example",
		portfolio: "https://example.dev",
	},
	availability: {
		status: "Open to Opportunities",
		type: "Full-time",
		startDate: "2026-05-01",
	},
};

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

interface GeminiModelInfo {
	name?: string;
	supportedGenerationMethods?: string[];
}

const extractJsonFromGeminiText = (raw: string): string => {
	const cleaned = raw.trim();
	const codeFenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
	if (codeFenceMatch?.[1]) {
		return codeFenceMatch[1].trim();
	}
	return cleaned;
};

const normalizeModelName = (value: string): string => {
	return value.replace(/^models\//, "");
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

const extractApplicantProfileWithGemini = async (
	resumeText: string,
): Promise<ApplicantScreeningProfile> => {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error("GEMINI_API_KEY is required for applicant screening");
	}

	const prompt = `You are an applicant screening assistant.\n\nExtract the candidate profile from the resume text and return ONLY valid JSON with this exact shape and keys:\n{\n  "personaInfo": {\n    "firstName": "",\n    "lastName": "",\n    "email": "",\n    "headline": "",\n    "location": ""\n  },\n  "skills": [{ "name": "", "level": "Beginner|Intermediate|Advanced|Expert", "yearsOfExperience": 0 }],\n  "languages": [{ "name": "", "proficiency": "Basic|Conversational|Fluent|Native" }],\n  "workExperience": [{ "company": "", "role": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM|Present", "description": "", "technologies": [""], "isCurrent": false }],\n  "education": [{ "institution": "", "degree": "", "fieldOfStudy": "", "startYear": 0, "endYear": 0 }],\n  "certifications": [{ "name": "", "issuer": "", "issueDate": "YYYY-MM" }],\n  "projects": [{ "name": "", "description": "", "technologies": [""], "role": "", "link": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM" }],\n  "socialLinks": { "linkedin": "", "github": "", "portfolio": "" },\n  "availability": { "status": "Available|Open to Opportunities|Not Available", "type": "Full-time|Part-time|Contract", "startDate": "YYYY-MM-DD" }\n}\n\nRules:\n- Use empty string for unknown scalar fields and empty array for unknown lists.\n- Keep enums strictly within allowed values.\n- Do not include markdown or explanations.\n\nResume text:\n${resumeText}`;

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
						generationConfig: {
							temperature: 0.1,
						},
					},
				);

				const rawText =
					response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
				if (!rawText) {
					throw new Error("Gemini returned an empty response");
				}

				const jsonText = extractJsonFromGeminiText(String(rawText));
				const parsed = JSON.parse(jsonText) as ApplicantScreeningProfile;
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

class ApplicantScreeningController {
	static async getApplicantScreeningSchema(
		_req: Request,
		res: Response,
	): Promise<void> {
		res.status(200).json({
			message: "Applicant screening schema",
			schema: APPLICANT_SCREENING_SCHEMA_EXAMPLE,
		});
	}

	static async parseApplicantScreeningPdf(
		req: Request,
		res: Response,
	): Promise<void> {
		try {
			const requestWithFile = req as Request & {
				file?: Express.Multer.File | undefined;
			};

			if (!requestWithFile.file) {
				res.status(400).json({ message: "PDF file is required" });
				return;
			}

			const parser = new PDFParse({ data: requestWithFile.file.buffer });
			const parsed = await parser.getText();
			await parser.destroy();

			const extractedText = parsed.text?.trim() ?? "";

			if (!extractedText) {
				res.status(422).json({ message: "No readable text found in PDF" });
				return;
			}

      const applicantProfile = await extractApplicantProfileWithGemini(
        extractedText,
      );

			res.status(200).json({
				message: "Applicant screening completed",
				screening: {
					fileName: requestWithFile.file.originalname,
					pages: parsed.pages?.length ?? 0,
					extractedText,
					applicantProfile,
				},
			});
		} catch (error) {
			res.status(500).json({
				message: "Failed to complete applicant screening",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}
}

export default ApplicantScreeningController;
