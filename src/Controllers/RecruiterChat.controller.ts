import type { Response } from "express";
import { Types } from "mongoose";
import axios from "axios";
import { callGemini } from "../utils/gemini.js";
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

      const systemContext = `You are Umurava's AI recruitment assistant. You help recruiters hire better and faster.

OUTPUT RULES — follow these strictly, no exceptions:
- Write plain conversational text only. No markdown. No asterisks (*). No slashes (/). No hashes (#). No bold. No headers.
- Never show your thinking, planning, drafts, or reasoning. Just give the final answer.
- Keep responses to 1-3 sentences unless the user explicitly asks for more detail.
- Ask at most one follow-up question per response.
- Use a simple numbered or plain list only when comparing 3+ items side by side.

What you help with:
- Candidate evaluation and comparison using the applicant pool below
- Drafting job descriptions
- Screening strategy and interview questions
- Navigating the Umurava platform

Navigation: If the user wants to go somewhere ("take me to...", "open...", "go to..."), reply with only: "Taking you there now!" — nothing else.

If a question is unrelated to recruitment, respond naturally like a human would — something like "Ha, I wish I could help with that! I'm only good with recruitment stuff though. Anything hiring-related I can help you with?" — keep it light and friendly, then redirect.

Job: ${job.title}
Skills needed: ${job.skills.join(", ")}
Experience: ${job.experience} years

Applicants (${applicants.length} total):
${JSON.stringify(candidateContext, null, 2)}`;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ message: "I'm sorry, the AI chat service is currently unavailable. Please contact support." });
        return;
      }

      // Switching to 1.5-flash for better stability and rate limits
      const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
      const apiVersion = "v1beta";

      const chatHistory: ChatMessage[] = history || [];

      // Using callGemini utility for robust model/version fallback
      const aiResponse = await callGemini({
        contents: [
          ...chatHistory,
          { role: "user", parts: [{ text: message }] }
        ],
        system_instruction: {
          parts: [{ text: systemContext }]
        },
        generationConfig: { temperature: 0.3 },
      }, {
        preferredModel: modelName
      });

      // Strip markdown artifacts that Gemini sometimes leaks
      const cleanResponse = aiResponse
        .replace(/\*\*?/g, "")       // remove * and **
        .replace(/#{1,6}\s?/g, "")   // remove # headers
        .replace(/^[-*]\s/gm, "")    // remove leading bullet dashes
        .replace(/\n{3,}/g, "\n\n")  // collapse excess newlines
        .trim();

      // Detect navigation intent from AI response and return a route
      const navigationMap: Record<string, string> = {
        "/screening": "/screening",
        "screening page": "/screening",
        "/jobs/create": "/jobs/create",
        "post a job": "/jobs/create",
        "create a job": "/jobs/create",
        "/jobs": "/jobs",
        "jobs page": "/jobs",
        "/applicants": "/applicants",
        "applicants page": "/applicants",
        "/shortlists": "/shortlists",
        "shortlists page": "/shortlists",
        "/notifications": "/notifications",
        "notifications page": "/notifications",
        "/profile": "/profile",
        "profile page": "/profile",
        "/settings": "/settings",
        "settings page": "/settings",
      };

      const lowerMessage = message.toLowerCase();
      let navigateTo: string | undefined;
      for (const [keyword, route] of Object.entries(navigationMap)) {
        if (lowerMessage.includes(keyword)) {
          navigateTo = route;
          break;
        }
      }

      res.status(200).json({
        message: cleanResponse,
        ...(navigateTo && { navigate: navigateTo }),
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
