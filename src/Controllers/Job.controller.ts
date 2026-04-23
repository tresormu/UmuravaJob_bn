import type { Request, Response } from "express";
import { Types } from "mongoose";
import Job from "../Models/Job.model.js";
import Applicant from "../Models/Applicant.model.js";
import type { AuthRequest } from "../types/type.js";
import { sendJobPostedEmail } from "../utils/email.js";
import { ResponseMessages } from "../utils/responseMessages.js";

class JobController {
  /**
   * Create a new job
   */
  async createJob(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: ResponseMessages.ERROR.UNAUTHORIZED,
        });
      }
      if (req.user.role !== "recruiter") {
        return res.status(403).json({
          success: false,
          message: ResponseMessages.ERROR.FORBIDDEN,
        });
      }

      const {
        title,
        department,
        employmentType,
        description,
        skills,
        experience,
        education,
        location,
        deadline,
      } =
        req.body;
      if (!title || typeof title !== "string") {
        return res.status(400).json({ success: false, message: ResponseMessages.ERROR.MISSING_FIELD("title") });
      }
      if (department !== undefined && typeof department !== "string") {
        return res.status(400).json({ success: false, message: ResponseMessages.ERROR.INVALID_FIELD("department") });
      }
      if (employmentType !== undefined && typeof employmentType !== "string") {
        return res.status(400).json({ success: false, message: ResponseMessages.ERROR.INVALID_FIELD("employment type") });
      }
      if (!Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({ success: false, message: ResponseMessages.ERROR.MISSING_FIELD("skills") });
      }
      const expNum = Number(experience);
      if (!Number.isFinite(expNum) || expNum < 0) {
        return res.status(400).json({ success: false, message: ResponseMessages.ERROR.INVALID_FIELD("experience") });
      }

      const jobData: any = {
        title,
        department,
        employmentType,
        description,
        skills,
        experience: expNum,
        education,
        location,
        recruiterId: req.user.id,
      };
      if (deadline) jobData.deadline = new Date(deadline);

      const job = (await Job.create(jobData)) as any;

      if (req.user.email) {
        try {
          await sendJobPostedEmail(req.user.email, job.title);
        } catch (emailError) {
          console.error("Failed to send job posted email", emailError);
        }
      }

      return res.status(201).json({
        success: true,
        message: ResponseMessages.SUCCESS.CREATED("job listing"),
        data: job,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "I'm sorry, we encountered an error while creating your job listing.",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Get all jobs
   */
  async getAllJobs(_req: Request, res: Response) {
    try {
      const page = Number.parseInt(String(_req.query.page ?? 1), 10) || 1;
      const limit = Number.parseInt(String(_req.query.limit ?? 20), 10) || 20;

      const total = await Job.countDocuments();
      const jobs = await Job.aggregate([
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: "applicants",
            localField: "_id",
            foreignField: "jobId",
            as: "applicants",
          },
        },
        {
          $project: {
            title: 1,
            department: 1,
            employmentType: 1,
            description: 1,
            skills: 1,
            experience: 1,
            education: 1,
            location: 1,
            recruiterId: 1,
            deadline: 1,
            createdAt: 1,
            updatedAt: 1,
            applicantsCount: { $size: "$applicants" },
            matchedCount: {
              $size: {
                $filter: {
                  input: "$applicants",
                  as: "applicant",
                  cond: { $gte: ["$$applicant.aiScore", 80] },
                },
              },
            },
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        data: jobs,
        pagination: { page, limit, total },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "We're having trouble fetching the job list right now. Please try again in a moment.",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Get a job by ID
   */
  async getJobById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: ResponseMessages.ERROR.INVALID_FIELD("job id"),
        });
      }

      const job = await Job.findById(id).lean();

      if (!job) {
        return res.status(404).json({
          success: false,
          message: ResponseMessages.ERROR.NOT_FOUND("job listing"),
        });
      }

      const [applicantsCount, matchedCount] = await Promise.all([
        Applicant.countDocuments({ jobId: id }),
        Applicant.countDocuments({ jobId: id, aiScore: { $gte: 80 } }),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          ...job,
          applicantsCount,
          matchedCount,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "We're sorry, an error occurred while fetching the job details.",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Update a job
   */
  async updateJob(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: ResponseMessages.ERROR.UNAUTHORIZED,
        });
      }
      if (req.user.role !== "recruiter") {
        return res.status(403).json({
          success: false,
          message: ResponseMessages.ERROR.FORBIDDEN,
        });
      }

      const { id } = req.params;

      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: ResponseMessages.ERROR.INVALID_FIELD("job id"),
        });
      }

      const existingJob = await Job.findById(id);
      if (!existingJob) {
        return res.status(404).json({
          success: false,
          message: ResponseMessages.ERROR.NOT_FOUND("job listing"),
        });
      }
      if (String(existingJob.recruiterId) !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: ResponseMessages.ERROR.FORBIDDEN,
        });
      }

      const updateData = { ...req.body };
      delete (updateData as { recruiterId?: unknown }).recruiterId;
      if (updateData.title && typeof updateData.title !== "string") {
        return res.status(400).json({ success: false, message: ResponseMessages.ERROR.INVALID_FIELD("title") });
      }
      if (updateData.department !== undefined && typeof updateData.department !== "string") {
        return res.status(400).json({ success: false, message: ResponseMessages.ERROR.INVALID_FIELD("department") });
      }
      if (updateData.employmentType !== undefined && typeof updateData.employmentType !== "string") {
        return res.status(400).json({ success: false, message: ResponseMessages.ERROR.INVALID_FIELD("employment type") });
      }
      if (updateData.skills && (!Array.isArray(updateData.skills) || updateData.skills.length === 0)) {
        return res.status(400).json({ success: false, message: ResponseMessages.ERROR.INVALID_FIELD("skills") });
      }
      if (updateData.experience !== undefined) {
        const expNum = Number(updateData.experience);
        if (!Number.isFinite(expNum) || expNum < 0) {
          return res.status(400).json({ success: false, message: ResponseMessages.ERROR.INVALID_FIELD("experience") });
        }
        updateData.experience = expNum;
      }
      if (updateData.deadline !== undefined) {
        updateData.deadline = new Date(updateData.deadline);
      }

      const updatedJob = await Job.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updatedJob) {
        return res.status(404).json({
          success: false,
          message: ResponseMessages.ERROR.NOT_FOUND("job listing"),
        });
      }

      return res.status(200).json({
        success: true,
        message: ResponseMessages.SUCCESS.UPDATED("job listing"),
        data: updatedJob,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "We encountered a problem while updating your job listing. Please try again.",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Delete a job
   */
  async deleteJob(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: ResponseMessages.ERROR.UNAUTHORIZED,
        });
      }
      if (req.user.role !== "recruiter") {
        return res.status(403).json({
          success: false,
          message: ResponseMessages.ERROR.FORBIDDEN,
        });
      }

      const { id } = req.params;

      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: ResponseMessages.ERROR.INVALID_FIELD("job id"),
        });
      }

      const existingJob = await Job.findById(id);
      if (!existingJob) {
        return res.status(404).json({
          success: false,
          message: ResponseMessages.ERROR.NOT_FOUND("job listing"),
        });
      }
      if (String(existingJob.recruiterId) !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: ResponseMessages.ERROR.FORBIDDEN,
        });
      }

      const deletedJob = await Job.findByIdAndDelete(id);

      if (!deletedJob) {
        return res.status(404).json({
          success: false,
          message: ResponseMessages.ERROR.NOT_FOUND("job listing"),
        });
      }

      return res.status(200).json({
        success: true,
        message: ResponseMessages.SUCCESS.DELETED("job listing"),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "We encountered an error while trying to delete the job listing.",
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}

export default new JobController();
