import type { Request, Response } from "express";
import axios from "axios";
import { callGemini } from "../utils/gemini.js";
import { Types } from "mongoose";
import Applicant from "../Models/Applicant.model.js";
import Job from "../Models/Job.model.js";
import Answer from "../Models/Answer.model.js";
import Question from "../Models/Question.model.js";
import { ResponseMessages } from "../utils/responseMessages.js";

interface RankedCandidate {
  applicant_id: string;
  candidate_name: string;
  score: number;
  summary: string;
}

interface RankedCandidatesResponse {
  ranked_candidates: RankedCandidate[];
}

const extractJsonFromGeminiText = (raw: string): string => {
  const cleaned = raw.trim();
  const codeFenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeFenceMatch?.[1]) {
    return codeFenceMatch[1].trim();
  }
  return cleaned;
};

const rankApplicantsWithGemini = async (
  jobData: Record<string, unknown>,
  applicantsData: Array<Record<string, unknown>>,
  hasQuestions: boolean,
  userPrompt?: string,
): Promise<RankedCandidatesResponse> => {
  const prompt = `You are an AI recruitment assistant.

You will receive:
- One job description and requirements
- Multiple candidate profiles (including CV text and answers to application questions)

Task:
1. Score each candidate (0-100) based on how well they match the job requirements.
2. Provide a detailed reasoning/explanation for the score, highlighting strengths and missing qualifications.
${hasQuestions ? "3. Pay special attention to the answers provided to the job-specific questions." : "3. Note: No additional application questions were asked for this role."}
${userPrompt ? `4. IMPORTANT USER INSTRUCTION: ${userPrompt}` : ""}

Return output in JSON format with this exact structure:
{
  "ranked_candidates": [
    {
      "applicant_id": "string",
      "candidate_name": "string",
      "score": number,
      "summary": "detailed reasoning here"
    }
  ]
}

Scoring criteria:
- Skills Match: 50 points
- Relevant Experience: 30 points
- Education: 10 points
- Quality of Answers: 10 points
${userPrompt ? `- Custom Recruiter Instruction Impact: High priority` : ""}

Job:
${JSON.stringify(jobData, null, 2)}

Candidates:
${JSON.stringify(applicantsData, null, 2)}`;

  try {
    const rawText = await callGemini({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1 },
    });

    const jsonText = extractJsonFromGeminiText(String(rawText));
    const parsed = JSON.parse(jsonText) as RankedCandidatesResponse;
    if (!Array.isArray(parsed.ranked_candidates)) {
      throw new Error("Gemini response missing ranked_candidates array");
    }

    return parsed;
  } catch (error) {
    console.error("[AI-Ranking] Gemini call failed:", error instanceof Error ? error.message : error);
    throw new Error(error instanceof Error ? error.message : "Candidate ranking failed");
  }
};

class ApplicantRankingController {
  static async rankApplicantsForJob(req: Request, res: Response): Promise<void> {
    try {
      const jobId = typeof req.query.jobId === "string" ? req.query.jobId : undefined;
      const prompt = typeof req.query.prompt === "string" ? req.query.prompt : undefined;
      const topN = typeof req.query.topN === "string" ? parseInt(req.query.topN, 10) : 10;
      const batchSize = 20;

      if (!jobId) {
        res.status(400).json({ message: ResponseMessages.ERROR.MISSING_FIELD("job ID") });
        return;
      }

      if (!Types.ObjectId.isValid(jobId)) {
        res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("job ID") });
        return;
      }

      const job = await Job.findById(jobId).lean();
      if (!job) {
        res.status(404).json({ message: ResponseMessages.ERROR.NOT_FOUND("job listing") });
        return;
      }

      const applicants = await Applicant.find({ jobId: new Types.ObjectId(jobId) })
        .sort({ createdAt: -1 })
        .lean();

      if (applicants.length === 0) {
        res.status(404).json({ message: "I'm sorry, but we couldn't find any applicants for this job pool yet." });
        return;
      }

      const questions = await Question.find({ jobId: job._id }).lean();
      const questionMap = new Map(questions.map((q) => [String(q._id), q.prompt]));

      const applicationIds = applicants
        .map((a) => a.applicationId)
        .filter((id): id is Types.ObjectId => id !== undefined);

      const allAnswers = await Answer.find({ applicationId: { $in: applicationIds } }).lean();
      const answersByApplicationId = new Map<string, Array<{ question: string; answer: unknown }>>();

      for (const ans of allAnswers) {
        const appId = String(ans.applicationId);
        const existing = answersByApplicationId.get(appId) || [];
        existing.push({
          question: questionMap.get(String(ans.questionId)) || "Unknown Question",
          answer: ans.valueText || ans.value,
        });
        answersByApplicationId.set(appId, existing);
      }

      const jobPayload = {
        title: job.title,
        description: job.description ?? "",
        skills: job.skills ?? [],
        experience: job.experience ?? 0,
        education: job.education ?? "",
      };

      const results: RankedCandidate[] = [];

      for (let i = 0; i < applicants.length; i += batchSize) {
        const batch = applicants.slice(i, i + batchSize);
        const candidatesPayload = batch.map((applicant) => {
          const parsedData = applicant.parsedData ?? {};
          return {
            applicant_id: String(applicant._id),
            candidate_name: applicant.fullName,
            email: applicant.email ?? "",
            phone: applicant.phone ?? "",
            location: applicant.location ?? "",
            skills: parsedData.skills ?? [],
            experience_years: parsedData.experienceYears ?? 0,
            education: parsedData.education ?? [],
            resume_text: applicant.resumeText ?? "",
            answers: applicant.applicationId ? (answersByApplicationId.get(String(applicant.applicationId)) || []) : [],
          };
        });

        const batchRanking = await rankApplicantsWithGemini(
          jobPayload,
          candidatesPayload,
          questions.length > 0,
          prompt
        );
        results.push(...batchRanking.ranked_candidates);
      }

      // Bulk update applicants with AI scores and summaries
      const bulkOps = results.map((res) => ({
        updateOne: {
          filter: { _id: new Types.ObjectId(res.applicant_id) },
          update: { $set: { aiScore: res.score, aiSummary: res.summary } },
        },
      }));

      await Applicant.bulkWrite(bulkOps);

      const topCandidates = results
        .sort((a, b) => b.score - a.score)
        .slice(0, topN)
        .map((candidate, index) => ({
          rank: index + 1,
          ...candidate,
        }));

      res.status(200).json({
        success: true,
        message: "The application pool has been successfully ranked by our AI assistant.",
        jobId,
        totalApplicants: applicants.length,
        ranked_candidates: topCandidates,
      });
    } catch (error) {
      res.status(500).json({
        message: "I'm sorry, we encountered a problem while ranking the applicants. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default ApplicantRankingController;

