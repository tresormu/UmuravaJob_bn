import type { Response } from "express";
import { Types } from "mongoose";
import { ResponseMessages } from "../utils/responseMessages.js";
import type { AuthRequest } from "../types/type.js";
import Job from "../Models/Job.model.js";
import Question from "../Models/Question.model.js";

const isChoiceType = (type?: string) =>
  type === "single_choice" || type === "multi_choice";

class QuestionController {
  static async createQuestion(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: ResponseMessages.ERROR.UNAUTHORIZED });
      }

      const { jobId } = req.params;
      if (typeof jobId !== "string" || !Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("job ID") });
      }

      const { prompt, type, required, options, order } = req.body as {
        prompt?: string;
        type?: string;
        required?: boolean;
        options?: string[];
        order?: number;
      };

      if (!prompt) {
        return res.status(400).json({ message: ResponseMessages.ERROR.MISSING_FIELD("prompt") });
      }

      if (
        type &&
        !["text", "single_choice", "multi_choice", "number", "date", "boolean"].includes(type)
      ) {
        return res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("question type") });
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
        return res.status(404).json({ message: ResponseMessages.ERROR.NOT_FOUND("job listing") });
      }
      if (String(job.recruiterId) !== req.user.id) {
        return res.status(403).json({ message: ResponseMessages.ERROR.FORBIDDEN });
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
      return res.status(500).json({ message: "I'm sorry, we couldn't create the question at this time. Please try again." });
    }
  }

  static async listJobQuestions(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { jobId } = req.params;
      if (typeof jobId !== "string" || !Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("job ID") });
      }

      const questions = await Question.find({ jobId }).sort({ order: 1, createdAt: 1 });
      return res.status(200).json({ questions });
    } catch (error) {
      return res.status(500).json({ message: "We apologize, but we couldn't fetch the questions for this job." });
    }
  }

  static async updateQuestion(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: ResponseMessages.ERROR.UNAUTHORIZED });
      }
      const { id } = req.params;
      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("question ID") });
      }

      const question = await Question.findById(id);
      if (!question) {
        return res.status(404).json({ message: ResponseMessages.ERROR.NOT_FOUND("question") });
      }

      const job = await Job.findById(question.jobId);
      if (!job) {
        return res.status(404).json({ message: ResponseMessages.ERROR.NOT_FOUND("job listing") });
      }
      if (String(job.recruiterId) !== req.user.id) {
        return res.status(403).json({ message: ResponseMessages.ERROR.FORBIDDEN });
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
        return res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("question type") });
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
        return res.status(404).json({ message: ResponseMessages.ERROR.NOT_FOUND("question") });
      }

      return res.status(200).json({ question: updated });
    } catch (error) {
      return res.status(500).json({ message: "We encountered a problem while updating the question. Please try again." });
    }
  }

  static async deleteQuestion(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: ResponseMessages.ERROR.UNAUTHORIZED });
      }
      const { id } = req.params;
      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("question ID") });
      }

      const question = await Question.findById(id);
      if (!question) {
        return res.status(404).json({ message: ResponseMessages.ERROR.NOT_FOUND("question") });
      }

      const job = await Job.findById(question.jobId);
      if (!job) {
        return res.status(404).json({ message: ResponseMessages.ERROR.NOT_FOUND("job listing") });
      }
      if (String(job.recruiterId) !== req.user.id) {
        return res.status(403).json({ message: ResponseMessages.ERROR.FORBIDDEN });
      }

      await Question.findByIdAndDelete(id);
      return res.status(200).json({ message: ResponseMessages.SUCCESS.DELETED("question") });
    } catch (error) {
      return res.status(500).json({ message: "I'm sorry, we couldn't delete the question at this time." });
    }
  }
}

export default QuestionController;
