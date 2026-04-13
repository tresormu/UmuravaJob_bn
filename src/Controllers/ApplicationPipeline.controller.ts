import type { Request, Response } from "express";
import { Types } from "mongoose";
import mongoose from "mongoose";
import type { AuthRequest } from "../types/type.js";
import Job from "../Models/Job.model.js";
import Candidate from "../Models/Candidate.model.js";
import Application from "../Models/Application.model.js";
import Answer from "../Models/Answer.model.js";
import Question from "../Models/Question.model.js";
import FileUpload from "../Models/FileUpload.model.js";
import xlsx from "xlsx";
import {
  sendApplicationReceivedEmail,
  sendShortlistedEmail,
} from "../utils/email.js";

type IncomingAnswer = {
  questionId: string;
  value: unknown;
};

type ParsedAnswer = {
  questionId: string;
  value: unknown;
  valueText?: string;
};

const addIfDefined = (target: Record<string, unknown>, key: string, value: unknown): void => {
  if (value !== undefined) {
    target[key] = value;
  }
};

const toOptionalTrimmedString = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim();
  return text ? text : undefined;
};

const parsePagination = (value: unknown, fallback: number): number => {
  if (typeof value !== "string") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeHeader = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const coerceAnswerValue = (
  type: string,
  value: unknown,
  options?: string[],
): { ok: boolean; value?: unknown; valueText?: string } => {
  if (value === undefined || value === null || value === "") {
    return { ok: false };
  }

  switch (type) {
    case "text": {
      const text = String(value).trim();
      return text ? { ok: true, value: text, valueText: text } : { ok: false };
    }
    case "number": {
      const num = typeof value === "number" ? value : Number(value);
      return Number.isFinite(num) ? { ok: true, value: num, valueText: String(num) } : { ok: false };
    }
    case "boolean": {
      if (typeof value === "boolean") {
        return { ok: true, value, valueText: String(value) };
      }
      const text = String(value).trim().toLowerCase();
      if (text === "true" || text === "false") {
        return { ok: true, value: text === "true", valueText: text };
      }
      return { ok: false };
    }
    case "date": {
      const date = new Date(String(value));
      return Number.isNaN(date.getTime())
        ? { ok: false }
        : { ok: true, value: date.toISOString(), valueText: date.toISOString() };
    }
    case "single_choice": {
      const text = String(value).trim();
      if (!text) return { ok: false };
      if (Array.isArray(options) && options.length > 0 && !options.includes(text)) {
        return { ok: false };
      }
      return { ok: true, value: text, valueText: text };
    }
    case "multi_choice": {
      const values = Array.isArray(value)
        ? value.map((item) => String(item).trim()).filter(Boolean)
        : String(value)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
      if (values.length === 0) return { ok: false };
      if (Array.isArray(options) && options.length > 0) {
        const invalid = values.find((item) => !options.includes(item));
        if (invalid) return { ok: false };
      }
      return { ok: true, value: values, valueText: values.join(", ") };
    }
    default:
      return { ok: false };
  }
};

class ApplicationPipelineController {
  static async createApplication(req: Request, res: Response): Promise<Response> {
    try {
      const { jobId } = req.params;
      if (typeof jobId !== "string" || !Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: "Invalid jobId" });
      }

      const {
        fullName,
        email,
        phone,
        location,
        resumeUrl,
        resumeFileName,
        resumeText,
        linkedInUrl,
        portfolioUrl,
        answers,
      } = req.body as {
        fullName?: string;
        email?: string;
        phone?: string;
        location?: string;
        resumeUrl?: string;
        resumeFileName?: string;
        resumeText?: string;
        linkedInUrl?: string;
        portfolioUrl?: string;
        answers?: IncomingAnswer[];
      };

      if (!fullName) {
        return res.status(400).json({ message: "fullName is required" });
      }
      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ message: "Invalid email" });
      }

      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const questions = await Question.find({ jobId });
      const questionById = new Map(questions.map((q) => [String(q._id), q]));

      const providedAnswers = Array.isArray(answers) ? answers : [];
      const invalidAnswer = providedAnswers.find(
        (a) => !a.questionId || !questionById.has(a.questionId),
      );
      if (invalidAnswer) {
        return res.status(400).json({ message: "Invalid question in answers" });
      }

      const answersByQuestion = new Map<string, IncomingAnswer>();
      for (const answer of providedAnswers) {
        if (answer.questionId) {
          answersByQuestion.set(answer.questionId, answer);
        }
      }

      const parsedAnswers: ParsedAnswer[] = [];
      for (const question of questions) {
        const incoming = answersByQuestion.get(String(question._id));
        if (!incoming) {
          if (question.required) {
            return res.status(400).json({ message: `Missing answer for: ${question.prompt}` });
          }
          continue;
        }
        const coerced = coerceAnswerValue(question.type, incoming.value, question.options);
        if (!coerced.ok) {
          return res.status(400).json({ message: `Invalid answer for: ${question.prompt}` });
        }
        const parsed: ParsedAnswer = {
          questionId: String(question._id),
          value: coerced.value,
        };
        if (coerced.valueText !== undefined) {
          parsed.valueText = coerced.valueText;
        }
        parsedAnswers.push(parsed);
      }

      const session = await mongoose.startSession();
      let applicationId: mongoose.Types.ObjectId | null = null;

      try {
        await session.withTransaction(async () => {
          let candidate = email ? await Candidate.findOne({ email }).session(session) : null;
          if (!candidate) {
            const candidateData: Record<string, unknown> = { fullName };
            addIfDefined(candidateData, "email", email);
            addIfDefined(candidateData, "phone", phone);
            addIfDefined(candidateData, "location", location);
            addIfDefined(candidateData, "resumeUrl", resumeUrl);
            addIfDefined(candidateData, "resumeFileName", resumeFileName);
            addIfDefined(candidateData, "resumeText", resumeText);
            addIfDefined(candidateData, "linkedInUrl", linkedInUrl);
            addIfDefined(candidateData, "portfolioUrl", portfolioUrl);

            const createdCandidates = await Candidate.create([candidateData], { session });
            const createdCandidate = createdCandidates[0];
            if (!createdCandidate) {
              throw new Error("CANDIDATE_CREATE_FAILED");
            }
            candidate = createdCandidate;
          } else {
            const updates: Record<string, unknown> = {};
            if (fullName && !candidate.fullName) updates.fullName = fullName;
            if (phone && !candidate.phone) updates.phone = phone;
            if (location && !candidate.location) updates.location = location;
            if (resumeUrl && !candidate.resumeUrl) updates.resumeUrl = resumeUrl;
            if (resumeFileName && !candidate.resumeFileName) updates.resumeFileName = resumeFileName;
            if (resumeText && !candidate.resumeText) updates.resumeText = resumeText;
            if (linkedInUrl && !candidate.linkedInUrl) updates.linkedInUrl = linkedInUrl;
            if (portfolioUrl && !candidate.portfolioUrl) updates.portfolioUrl = portfolioUrl;
            if (Object.keys(updates).length > 0) {
              await Candidate.updateOne({ _id: candidate._id }, { $set: updates }, { session });
            }
          }

          if (!candidate) {
            throw new Error("CANDIDATE_CREATE_FAILED");
          }

          const existingApplication = await Application.findOne({
            jobId,
            candidateId: candidate._id,
          }).session(session);
          if (existingApplication) {
            throw new Error("DUPLICATE_APPLICATION");
          }

          const application = await Application.create(
            [
              {
                jobId,
                candidateId: candidate._id,
                recruiterId: job.recruiterId,
                status: "applied",
                source: "direct",
              },
            ],
            { session },
          );
          const createdApplication = application[0];
          if (!createdApplication) {
            throw new Error("APPLICATION_CREATE_FAILED");
          }

          applicationId = createdApplication._id;

          if (parsedAnswers.length > 0) {
            const answerDocs = parsedAnswers.map((a) => ({
              applicationId: createdApplication._id,
              questionId: a.questionId,
              value: a.value,
              valueText: a.valueText,
            }));
            await Answer.insertMany(answerDocs, { session });
          }
        });
      } finally {
        session.endSession();
      }

      if (!applicationId) {
        return res.status(500).json({ message: "Failed to submit application" });
      }

      if (email) {
        try {
          await sendApplicationReceivedEmail(email, job.title, fullName);
        } catch (emailError) {
          console.error("Failed to send application received email", emailError);
        }
      }

      return res.status(201).json({ applicationId });
    } catch (error) {
      if (error instanceof Error && error.message === "DUPLICATE_APPLICATION") {
        return res.status(409).json({ message: "Application already exists" });
      }
      return res.status(500).json({ message: "Failed to submit application" });
    }
  }

  static async listJobApplications(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { jobId } = req.params;
      if (typeof jobId !== "string" || !Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: "Invalid jobId" });
      }

      const page = parsePagination(req.query.page, 1);
      const limit = parsePagination(req.query.limit, 20);
      const status =
        typeof req.query.status === "string" ? req.query.status : undefined;

      const query: Record<string, unknown> = {
        jobId,
        recruiterId: req.user.id,
      };
      if (status && ["applied", "screened", "shortlisted", "rejected"].includes(status)) {
        query.status = status;
      }

      const [total, applications] = await Promise.all([
        Application.countDocuments(query),
        Application.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate("candidateId")
          .lean(),
      ]);

      const applicationIds = applications.map((app) => String(app._id));
      const [answers, questions] = await Promise.all([
        Answer.find({ applicationId: { $in: applicationIds } }).lean(),
        Question.find({ jobId }).lean(),
      ]);
      const questionById = new Map(questions.map((q) => [String(q._id), q]));
      const answersByApplication = new Map<string, Array<Record<string, unknown>>>();
      for (const answer of answers) {
        const appId = String(answer.applicationId);
        const list = answersByApplication.get(appId) ?? [];
        const question = questionById.get(String(answer.questionId));
        list.push({
          ...answer,
          question,
        });
        answersByApplication.set(appId, list);
      }

      const normalized = applications.map((app) => ({
        ...app,
        candidate: app.candidateId,
        answers: answersByApplication.get(String(app._id)) ?? [],
      }));

      return res.status(200).json({
        applications: normalized,
        pagination: { page, limit, total },
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch applications" });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      const { status } = req.body as { status?: string };

      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid application id" });
      }
      if (!status || !["applied", "screened", "shortlisted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updated = await Application.findOneAndUpdate(
        { _id: id, recruiterId: req.user.id },
        { $set: { status } },
        { new: true, runValidators: true },
      ).populate("candidateId");

      if (!updated) {
        return res.status(404).json({ message: "Application not found" });
      }

      if (status === "shortlisted") {
        const candidate = updated.candidateId as { email?: string; fullName?: string } | null;
        if (candidate?.email) {
          const job = await Job.findById(updated.jobId);
          if (job) {
            try {
              await sendShortlistedEmail(candidate.email, job.title, candidate.fullName);
            } catch (emailError) {
              console.error("Failed to send shortlisted email", emailError);
            }
          }
        }
      }

      return res.status(200).json({ application: updated });
    } catch (error) {
      return res.status(500).json({ message: "Failed to update status" });
    }
  }

  static async uploadExcel(_req: AuthRequest, res: Response): Promise<Response> {
    try {
      const req = _req as AuthRequest & { file?: Express.Multer.File };
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { jobId } = req.params;
      if (typeof jobId !== "string" || !Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: "Invalid jobId" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Excel file is required" });
      }

      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      if (String(job.recruiterId) !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const fileUpload = await FileUpload.create({
        jobId,
        recruiterId: req.user.id,
        filename: req.file.originalname,
        status: "processing",
      });

      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        await FileUpload.findByIdAndUpdate(fileUpload._id, {
          status: "failed",
          errorCount: 1,
          errors: ["No worksheet found"],
        });
        return res.status(400).json({ message: "No worksheet found in file" });
      }

      const sheet = workbook.Sheets[sheetName];
      if (!sheet) {
        await FileUpload.findByIdAndUpdate(fileUpload._id, {
          status: "failed",
          errorCount: 1,
          errors: ["Worksheet is missing"],
        });
        return res.status(400).json({ message: "Worksheet is missing in file" });
      }
      const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });

      const questions = await Question.find({ jobId });
      const questionHeaderMap = new Map<string, string>();
      for (const question of questions) {
        const id = String(question._id);
        const prompt = normalizeHeader(question.prompt);
        questionHeaderMap.set(normalizeHeader(`questionid:${id}`), id);
        questionHeaderMap.set(normalizeHeader(`q:${id}`), id);
        if (prompt) {
          questionHeaderMap.set(prompt, id);
          questionHeaderMap.set(normalizeHeader(`question:${question.prompt}`), id);
        }
      }

      const errors: string[] = [];
      let createdCount = 0;

      for (let index = 0; index < rows.length; index += 1) {
        const rowIndex = index + 2; // header row + 1
        const row = rows[index];
        if (!row) {
          errors.push(`Row ${rowIndex}: empty row`);
          continue;
        }

        const fullName = String(row.fullName ?? row["Full Name"] ?? row["full name"] ?? "").trim();
        const email = String(row.email ?? row.Email ?? "").trim().toLowerCase();
        if (!fullName) {
          errors.push(`Row ${rowIndex}: fullName is required`);
          continue;
        }
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
          errors.push(`Row ${rowIndex}: invalid email`);
          continue;
        }

        const status = String(row.status ?? "").trim().toLowerCase();
        if (status && !["applied", "screened", "shortlisted", "rejected"].includes(status)) {
          errors.push(`Row ${rowIndex}: invalid status`);
          continue;
        }

        const answersByQuestion = new Map<string, unknown>();
        for (const [key, value] of Object.entries(row)) {
          const normalizedKey = normalizeHeader(key);
          const questionId = questionHeaderMap.get(normalizedKey);
          if (questionId) {
            answersByQuestion.set(questionId, value);
          }
        }

        const parsedAnswers: ParsedAnswer[] = [];
        let rowValid = true;
        for (const question of questions) {
          const incoming = answersByQuestion.get(String(question._id));
          if (incoming === undefined || incoming === null || incoming === "") {
            if (question.required) {
              errors.push(`Row ${rowIndex}: missing answer for ${question.prompt}`);
              rowValid = false;
              break;
            }
            continue;
          }
          const coerced = coerceAnswerValue(question.type, incoming, question.options);
          if (!coerced.ok) {
            errors.push(`Row ${rowIndex}: invalid answer for ${question.prompt}`);
            rowValid = false;
            break;
          }
          const parsed: ParsedAnswer = {
            questionId: String(question._id),
            value: coerced.value,
          };
          if (coerced.valueText !== undefined) {
            parsed.valueText = coerced.valueText;
          }
          parsedAnswers.push(parsed);
        }

        if (!rowValid) {
          continue;
        }

        const session = await mongoose.startSession();
        try {
          await session.withTransaction(async () => {
            let candidate = email ? await Candidate.findOne({ email }).session(session) : null;
            if (!candidate) {
              const candidateData: Record<string, unknown> = { fullName };
              addIfDefined(candidateData, "email", email || undefined);
              addIfDefined(candidateData, "phone", toOptionalTrimmedString(row.phone ?? row.Phone));
              addIfDefined(
                candidateData,
                "location",
                toOptionalTrimmedString(row.location ?? row.Location),
              );
              addIfDefined(
                candidateData,
                "resumeUrl",
                toOptionalTrimmedString(row.resumeUrl ?? row["resume url"]),
              );
              addIfDefined(
                candidateData,
                "resumeFileName",
                toOptionalTrimmedString(row.resumeFileName ?? row["resume file name"]),
              );
              addIfDefined(
                candidateData,
                "resumeText",
                toOptionalTrimmedString(row.resumeText ?? row["resume text"]),
              );
              addIfDefined(
                candidateData,
                "linkedInUrl",
                toOptionalTrimmedString(row.linkedInUrl ?? row["linkedin url"]),
              );
              addIfDefined(
                candidateData,
                "portfolioUrl",
                toOptionalTrimmedString(row.portfolioUrl ?? row["portfolio url"]),
              );

              const createdCandidates = await Candidate.create([candidateData], { session });
              const createdCandidate = createdCandidates[0];
              if (!createdCandidate) {
                throw new Error("CANDIDATE_CREATE_FAILED");
              }
              candidate = createdCandidate;
            }

            if (!candidate) {
              throw new Error("CANDIDATE_CREATE_FAILED");
            }

            const existingApplication = await Application.findOne({
              jobId,
              candidateId: candidate._id,
            }).session(session);
            if (existingApplication) {
              throw new Error("DUPLICATE_APPLICATION");
            }

            const application = await Application.create(
              [
                {
                  jobId,
                  candidateId: candidate._id,
                  recruiterId: job.recruiterId,
                  status: status || "applied",
                  source: "excel",
                },
              ],
              { session },
            );
            const createdApplication = application[0];
            if (!createdApplication) {
              throw new Error("APPLICATION_CREATE_FAILED");
            }

            if (parsedAnswers.length > 0) {
              const answerDocs = parsedAnswers.map((a) => ({
                applicationId: createdApplication._id,
                questionId: a.questionId,
                value: a.value,
                valueText: a.valueText,
              }));
              await Answer.insertMany(answerDocs, { session });
            }
          });
          createdCount += 1;
        } catch (error) {
          if (error instanceof Error && error.message === "DUPLICATE_APPLICATION") {
            errors.push(`Row ${rowIndex}: application already exists`);
          } else {
            errors.push(`Row ${rowIndex}: failed to import`);
          }
        } finally {
          session.endSession();
        }
      }

      const status = createdCount > 0 ? "completed" : "failed";
      await FileUpload.findByIdAndUpdate(fileUpload._id, {
        status,
        rowCount: rows.length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors.slice(0, 200) : undefined,
      });

      return res.status(200).json({
        message: "Upload processed",
        created: createdCount,
        errors,
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to process Excel upload" });
    }
  }
}

export default ApplicationPipelineController;
