import type { Response } from "express";
import { Types } from "mongoose";
import type { AuthRequest } from "../types/type.js";
import Job from "../Models/Job.model.js";
import Question from "../Models/Question.model.js";

const isChoiceType = (type?: string) =>
  type === "single_choice" || type === "multi_choice";

class QuestionController {
  static async createQuestion(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { jobId } = req.params;
      if (typeof jobId !== "string" || !Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: "Invalid jobId" });
      }

      const { prompt, type, required, options, order } = req.body as {
        prompt?: string;
        type?: string;
        required?: boolean;
        options?: string[];
        order?: number;
      };

      if (!prompt) {
        return res.status(400).json({ message: "prompt is required" });
      }

      if (
        type &&
        !["text", "single_choice", "multi_choice", "number", "date", "boolean"].includes(type)
      ) {
        return res.status(400).json({ message: "Invalid question type" });
      }

      if (isChoiceType(type)) {
        if (!Array.isArray(options) || options.length < 2) {
          return res.status(400).json({
            message: "options must be provided for choice questions",
          });
        }
      }

      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      if (String(job.recruiterId) !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const createData: Record<string, unknown> = {
        jobId,
        prompt,
        type: type ?? "text",
        required: Boolean(required),
        order: typeof order === "number" ? order : 0,
      };
      if (isChoiceType(type)) {
        createData.options = options;
      }

      const question = await Question.create(createData);

      return res.status(201).json({ data: question, question });
    } catch (error) {
      return res.status(500).json({ message: "Failed to create question" });
    }
  }

  static async listJobQuestions(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { jobId } = req.params;
      if (typeof jobId !== "string" || !Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: "Invalid jobId" });
      }

      const questions = await Question.find({ jobId }).sort({ order: 1, createdAt: 1 });
      return res.status(200).json({ questions });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch questions" });
    }
  }

  static async updateQuestion(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { id } = req.params;
      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid question id" });
      }

      const question = await Question.findById(id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const job = await Job.findById(question.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      if (String(job.recruiterId) !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { prompt, type, required, options, order } = req.body as {
        prompt?: string;
        type?: string;
        required?: boolean;
        options?: string[];
        order?: number;
      };

      if (
        type &&
        !["text", "single_choice", "multi_choice", "number", "date", "boolean"].includes(type)
      ) {
        return res.status(400).json({ message: "Invalid question type" });
      }

      if (type && isChoiceType(type) && (!Array.isArray(options) || options.length < 2)) {
        return res.status(400).json({
          message: "options must be provided for choice questions",
        });
      }

      const updateData: Record<string, unknown> = {};
      if (prompt !== undefined) updateData.prompt = prompt;
      if (type !== undefined) updateData.type = type;
      if (required !== undefined) updateData.required = Boolean(required);
      if (order !== undefined) updateData.order = order;
      if (type !== undefined) {
        updateData.options = isChoiceType(type) ? options : undefined;
      } else if (options !== undefined) {
        updateData.options = options;
      }

      const updated = await Question.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        return res.status(404).json({ message: "Question not found" });
      }

      return res.status(200).json({ question: updated });
    } catch (error) {
      return res.status(500).json({ message: "Failed to update question" });
    }
  }

  static async deleteQuestion(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { id } = req.params;
      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid question id" });
      }

      const question = await Question.findById(id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const job = await Job.findById(question.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      if (String(job.recruiterId) !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await Question.findByIdAndDelete(id);
      return res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete question" });
    }
  }
}

export default QuestionController;
