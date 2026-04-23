import type { Response } from "express";
import { Types } from "mongoose";
import axios from "axios";
import type { AuthRequest } from "../types/type.js";
import Job from "../Models/Job.model.js";
import Applicant from "../Models/Applicant.model.js";
import Answer from "../Models/Answer.model.js";
import Question from "../Models/Question.model.js";
import { ResponseMessages } from "../utils/responseMessages.js";

interface ChatMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

const extractTextFromGeminiResponse = (response: any): string => {
  return response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "I'm sorry, I couldn't generate a response.";
};

class RecruiterChatController {
  static async chatWithAI(req: AuthRequest, res: Response): Promise<void> {
    try {
      const jobId = req.params.jobId as string;
      const { message, history } = req.body as {
        message: string;
        history?: ChatMessage[];
      };

      if (!message) {
        res.status(400).json({ message: ResponseMessages.ERROR.MISSING_FIELD("message") });
        return;
      }

      if (!jobId || !Types.ObjectId.isValid(jobId)) {
        res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("job ID") });
        return;
      }

      const job = await Job.findById(jobId).lean();
      if (!job) {
        res.status(404).json({ message: ResponseMessages.ERROR.NOT_FOUND("job listing") });
        return;
      }

      // Authorization check (simplified, assuming req.user.id is the recruiter)
      if (req.user && String(job.recruiterId) !== req.user.id) {
        res.status(403).json({ message: ResponseMessages.ERROR.FORBIDDEN });
        return;
      }

      // Fetch all relevant data for context
      const [applicants, questions] = await Promise.all([
        Applicant.find({ jobId: new Types.ObjectId(jobId) }).lean(),
        Question.find({ jobId: new Types.ObjectId(jobId) }).lean(),
      ]);

      const applicantIds = applicants.map(a => a._id);
      const applicationIds = applicants
        .map((a) => a.applicationId)
        .filter((id): id is Types.ObjectId => id !== undefined);

      const allAnswers = await Answer.find({ applicationId: { $in: applicationIds } }).lean();


      const questionMap = new Map(questions.map((q) => [String(q._id), q.prompt]));
      const answersByAppId = new Map<string, Array<{ question: string; answer: unknown }>>();

      for (const ans of allAnswers) {
        const appId = String(ans.applicationId);
        const existing = answersByAppId.get(appId) || [];
        existing.push({
          question: questionMap.get(String(ans.questionId)) || "Unknown Question",
          answer: ans.valueText || ans.value,
        });
        answersByAppId.set(appId, existing);
      }

      // Prune candidates to top 15 to avoid massive token counts and 429 errors
      const candidateContext = applicants.slice(0, 15).map((app) => ({
        name: app.fullName,
        email: app.email,
        score: app.aiScore,
        // Drastically truncate summary for general chat context
        ai_summary: app.aiSummary ? app.aiSummary.substring(0, 200) + "..." : undefined,
        skills: (app.parsedData?.skills ?? []).slice(0, 3),
        experience: app.parsedData?.experienceYears ?? 0,
        // Only include answers if no summary exists, to save space
        answers: (!app.aiSummary && app.applicationId) ? (answersByAppId.get(String(app.applicationId)) || []).slice(0, 2) : [],
      }));

      const systemContext = `You are the Umurava AI Recruitment Assistant. Your ONLY purpose is to assist recruiters with their job listings, applicant evaluations, and recruitment strategy.

STRICT POLICY:
- You must ONLY answer questions related to recruitment, job requirements, candidate comparisons, and hiring strategy.
- If a user asks about any unrelated topic (e.g., health, food, general knowledge, sports, entertainment, etc.), you must politely decline and state: "I am sorry, but my expertise is strictly focused on recruitment and hiring processes. I cannot assist with other topics."

JOB DETAILS:
Title: ${job.title}
Description: ${job.description}
Requirements/Skills: ${job.skills.join(", ")}
Experience Required: ${job.experience} years
Education: ${job.education}

CURRENT APPLICANT POOL (${applicants.length} candidates):
${JSON.stringify(candidateContext, null, 2)}

INSTRUCTIONS:
1. You are the authoritative system for ranking these applicants. 
2. Provide strategic advice on how to find the best candidates.
3. Compare candidates based on the job requirements.
4. Use the AI scores and summaries provided as a baseline for your analysis.
5. If the recruiter asks for "Top 10" or similar, refer to the scores you've calculated.
6. Be professional, insightful, and helpful.
7. Since email and phone are provided, you can reference them if asked for contact details.`;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ message: "I'm sorry, the AI chat service is currently unavailable. Please contact support." });
        return;
      }

      // Switching to 1.5-flash for better stability and rate limits
      const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
      const apiVersion = "v1beta";

      const chatHistory: ChatMessage[] = history || [];

      // Using system_instruction for better adherence to focus
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`,
        {
          contents: [
            ...chatHistory,
            { role: "user", parts: [{ text: message }] }
          ],
          system_instruction: {
            parts: [{ text: systemContext }]
          },
          generationConfig: { temperature: 0.7 },
        }
      );

      const aiResponse = extractTextFromGeminiResponse(response);

      res.status(200).json({
        message: aiResponse,
        // Optionally return history
      });

    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({
        message: "I'm sorry, I encountered a problem while processing your message. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default RecruiterChatController;
