import type { Request, Response } from "express";
import axios from "axios";
import * as xlsx from "xlsx";
import { Types } from "mongoose";
import { PDFParse } from "pdf-parse";
import Applicant from "../Models/Applicant.model.js";
import Application from "../Models/Application.model.js";
import Job from "../Models/Job.model.js";
import { ResponseMessages } from "../utils/responseMessages.js";
import type { AuthRequest } from "../types/type.js";

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

const extractJsonFromGeminiText = (raw: string): string => {
	const cleaned = raw.trim();
	const codeFenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
	if (codeFenceMatch?.[1]) {
		return codeFenceMatch[1].trim();
	}
	return cleaned;
};

const extractApplicantProfileWithGemini = async (
	resumeText: string,
): Promise<ApplicantScreeningProfile> => {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error("GEMINI_API_KEY is required for applicant screening");
	}

	const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";
	const apiVersion = "v1beta";

	console.log(`[AI-Screening] Triggering Gemini extraction: model=${modelName}, version=${apiVersion}`);

	const prompt = `You are an applicant screening assistant.\n\nExtract the candidate profile from the resume text and return ONLY valid JSON with this exact shape and keys:\n{\n  "personaInfo": {\n    "firstName": "",\n    "lastName": "",\n    "email": "",\n    "headline": "",\n    "location": ""\n  },\n  "skills": [{ "name": "", "level": "Beginner|Intermediate|Advanced|Expert", "yearsOfExperience": 0 }],\n  "languages": [{ "name": "", "proficiency": "Basic|Conversational|Fluent|Native" }],\n  "workExperience": [{ "company": "", "role": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM|Present", "description": "", "technologies": [""], "isCurrent": false }],\n  "education": [{ "institution": "", "degree": "", "fieldOfStudy": "", "startYear": 0, "endYear": 0 }],\n  "certifications": [{ "name": "", "issuer": "", "issueDate": "YYYY-MM" }],\n  "projects": [{ "name": "", "description": "", "technologies": [""], "role": "", "link": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM" }],\n  "socialLinks": { "linkedin": "", "github": "", "portfolio": "" },\n  "availability": { "status": "Available|Open to Opportunities|Not Available", "type": "Full-time|Part-time|Contract", "startDate": "YYYY-MM-DD" }\n}\n\nRules:\n- Use empty string for unknown scalar fields and empty array for unknown lists.\n- Keep enums strictly within allowed values.\n- Do not include markdown or explanations.\n\nResume text:\n${resumeText}`;

	try {
		const response = await axios.post(
			`https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`,
			{
				contents: [{ parts: [{ text: prompt }] }],
				generationConfig: {
					temperature: 0.1,
				},
			},
			{
				timeout: 40000, // 40 seconds timeout
			},
		);

		const rawText =
			response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
		if (!rawText) {
			console.error("[AI-Screening] Empty response from Gemini");
			throw new Error("Gemini returned an empty response");
		}

		console.log("[AI-Screening] Successfully extracted profile from Gemini");
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
			console.error(`[AI-Screening] Gemini call failed (${statusCode}):`, upstreamMessage);
			throw new Error(`Gemini Error: ${upstreamMessage}`);
		} else {
			console.error("[AI-Screening] Processing error:", error);
			throw error instanceof Error ? error : new Error("Unknown error in AI screening");
		}
	}
};

const normalizeOptionalString = (value: unknown): string | undefined => {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

const buildApplicantFullName = (profile: ApplicantScreeningProfile): string => {
	const first = normalizeOptionalString(profile.personaInfo.firstName) ?? "";
	const last = normalizeOptionalString(profile.personaInfo.lastName) ?? "";
	const fullName = `${first} ${last}`.trim();
	return fullName || "Unknown Applicant";
};

class ApplicantScreeningController {
	private static async processSingleCv(
		file: Express.Multer.File,
		jobId: string | Types.ObjectId,
		recruiterId: string | Types.ObjectId,
	): Promise<{
		applicantId: Types.ObjectId;
		fileName: string;
		pages: number;
		extractedText: string;
		applicantProfile: ApplicantScreeningProfile;
		savedApplicant: unknown;
	}> {
		const finalJobId = new Types.ObjectId(jobId);
		const finalRecruiterId = new Types.ObjectId(recruiterId);

		console.log(`[Screening] STEP 1: Initializing Parser - ${file.originalname}`);
		const uint8Array = new Uint8Array(file.buffer.buffer, file.buffer.byteOffset, file.buffer.byteLength);
		const parser = new PDFParse({ data: uint8Array });

		console.log(`[Screening] STEP 2: Extracting Text - ${file.originalname}`);
		const parsed = await parser.getText();
		await parser.destroy();

		const extractedText = parsed.text?.trim() ?? "";
		if (!extractedText) {
			console.error(`[Screening] FAILED: No text found in ${file.originalname}`);
			throw new Error("No readable text found in PDF. Is this document a secure or scanned image?");
		}
		console.log(`[Screening] STEP 3: Text Extracted (${extractedText.length} chars) - ${file.originalname}`);

		console.log(`[Screening] Text extracted (${extractedText.length} chars). Sending to AI...`);
		const applicantProfile = await extractApplicantProfileWithGemini(extractedText);

		const applicantDoc = await new Applicant({
			jobId: finalJobId,
			recruiterId: finalRecruiterId,
			fullName: buildApplicantFullName(applicantProfile),
			email: normalizeOptionalString(applicantProfile.personaInfo.email),
			location: normalizeOptionalString(applicantProfile.personaInfo.location),
			resumeText: extractedText,
			resumeFileName: file.originalname,
			applicantProfile: applicantProfile as unknown as Record<string, unknown>,
			linkedInUrl: normalizeOptionalString(applicantProfile.socialLinks.linkedin),
			portfolioUrl: normalizeOptionalString(applicantProfile.socialLinks.portfolio),
			status: "applied",
			source: "pdf",
			isParsed: true,
			parsedAt: new Date(),
			tags: [
				...applicantProfile.languages.map((language) => language.name),
				applicantProfile.availability.status,
				applicantProfile.availability.type,
			].filter(Boolean),
		}).save();

		const savedApplicant = await Applicant.findById(applicantDoc._id).lean();

		return {
			applicantId: applicantDoc._id,
			fileName: file.originalname,
			pages: parsed.pages.length,
			extractedText,
			applicantProfile,
			savedApplicant,
		};
	}

	static async getApplicantScreeningSchema(
		_req: Request,
		res: Response,
	): Promise<void> {
		res.status(200).json({
			message: "Here is the applicant screening schema you requested.",
			schema: APPLICANT_SCREENING_SCHEMA_EXAMPLE,
		});
	}

	static async parseApplicantScreeningPdf(
		req: AuthRequest,
		res: Response,
	): Promise<void> {
		try {
			if (!req.user) {
				res.status(401).json({ message: ResponseMessages.ERROR.UNAUTHORIZED });
				return;
			}

			const recruiterId = req.user.id;
			const jobId = req.query.jobId as string;

			if (!jobId || !Types.ObjectId.isValid(jobId)) {
				res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("jobId") });
				return;
			}

			const requestWithFiles = req as Request & {
				files?: Express.Multer.File[] | undefined;
			};
			const files = requestWithFiles.files ?? [];

			if (files.length === 0) {
				res.status(400).json({ message: "I'm sorry, but at least one PDF file is required for this process." });
				return;
			}

			console.log(`[Screening] Received ${files.length} resumes for batch processing.`);

			// Process all files in parallel to reduce total latency
			const results = await Promise.allSettled(
				files.map((file) => ApplicantScreeningController.processSingleCv(file, jobId, recruiterId))
			);

			const processed: any[] = [];
			const failed: Array<{ fileName: string; error: string }> = [];

			results.forEach((result, index) => {
				const file = files[index];
				const fileName = file ? file.originalname : `file-${index}`;

				if (result.status === "fulfilled") {
					processed.push(result.value);
				} else {
					console.error(`[Screening] Failed to process ${fileName}:`, result.reason);
					failed.push({
						fileName,
						error: result.reason instanceof Error ? result.reason.message : "Processing failed",
					});
				}
			});

			if (processed.length === 0) {
				const firstError = failed.length > 0 ? failed[0]?.error : "Unknown processing error";
				console.error(`[Screening] Batch failed. First error: ${firstError}`);

				res.status(422).json({
					success: false,
					message: `None of the uploaded CVs could be processed. Error: ${firstError}`,
					failed,
				});
				return;
			}

			res.status(200).json({
				success: true,
				message: `Great! ${processed.length} applicant(s) data has been successfully extracted and saved.`,
				totalUploaded: files.length,
				totalSaved: processed.length,
				totalFailed: failed.length,
				results: processed,
				failed,
			});
		} catch (error) {
			console.error("[Screening] Critical error in batch processing:", error);
			res.status(500).json({
				message: "I'm sorry, we encountered a problem while completing the applicant screening process.",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	static async parseApplicantScreeningSpreadsheet(req: Request, res: Response): Promise<void> {
		try {
			const jobId = req.query.jobId as string;
			const recruiterId = (req as any).user?.id;
			if (recruiterId === undefined) {
				res.status(401).json({ message: "Unauthorized. Recruiter ID not found." });
				return;
			}

			if (!jobId || !Types.ObjectId.isValid(jobId)) {
				res.status(400).json({ message: "Valid Job ID is required for spreadsheet import." });
				return;
			}

			const file = req.file;
			if (!file) {
				res.status(400).json({ message: "Please upload a spreadsheet file (.csv or .xlsx)." });
				return;
			}

			console.log(`[Spreadsheet] Starting import for ${file.originalname}`);

			const workbook = xlsx.read(file.buffer, { type: "buffer" });
			const sheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[sheetName!];
			const data = xlsx.utils.sheet_to_json(worksheet!);

			if (data.length === 0) {
				res.status(400).json({ message: "The uploaded spreadsheet is empty." });
				return;
			}

			const applicants: any[] = [];
			const finalJobId = new Types.ObjectId(jobId);
			const finalRecruiterId = new Types.ObjectId(recruiterId);

			// Helper to find column regardless of case
			const getVal = (row: any, ...keys: string[]) => {
				for (const key of keys) {
					const foundKey = Object.keys(row).find(k => k.toLowerCase().replace(/[\s_]/g, '') === key.toLowerCase().replace(/[\s_]/g, ''));
					if (foundKey) return row[foundKey];
				}
				return "";
			};

			for (const row of data as any[]) {
				const fullName = getVal(row, "FullName", "Name", "CandidateName", "Candidate");
				const email = getVal(row, "Email", "EmailAddress", "Mail");
				if (!fullName) continue;

				const applicantData = {
					jobId: finalJobId,
					recruiterId: finalRecruiterId,
					fullName,
					email: email?.toLowerCase(),
					phone: getVal(row, "Phone", "PhoneNumber", "Mobile", "Tel"),
					location: getVal(row, "Location", "Address", "City"),
					status: "applied",
					source: "csv",
					isParsed: true,
					parsedAt: new Date(),
					parsedData: {
						skills: (getVal(row, "Skills", "Expertise", "Technologies") as string)?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
						experienceYears: parseInt(getVal(row, "Experience", "Years", "Exp") as string) || 0
					}
				};

				// create applicant and application records
				const savedApplicants: any = await (Applicant as any).create([applicantData]);
				const savedApplicant: any = savedApplicants[0];
				if (savedApplicant) {
					const createdApplications: any = await (Application as any).create([
						{
							jobId: finalJobId,
							candidateId: undefined,
							recruiterId: finalRecruiterId,
							status: "applied",
							source: "manual",
						}
					]);
					const application: any = createdApplications[0];
					if (application) {
						await Applicant.findByIdAndUpdate(savedApplicant._id, { applicationId: application._id });
						applicants.push(savedApplicant);
					}
				}
			}

			res.status(200).json({
				success: true,
				message: `Successfully imported ${applicants.length} applicant(s) from ${file.originalname}.`,
				count: applicants.length,
				results: applicants
			});

		} catch (error) {
			console.error("[Spreadsheet] Error:", error);
			res.status(500).json({
				message: "We encountered a problem while processing the spreadsheet.",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}
}

export default ApplicantScreeningController;
