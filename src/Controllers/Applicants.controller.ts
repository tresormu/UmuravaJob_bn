import type { Response } from "express";
import Applicant from "../Models/Applicant.model.js";
import { Types } from "mongoose";
import type { AuthRequest } from "../types/type.js";

class ApplicantsController {
  static async GetApplicants(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const jobId =
        typeof req.query?.jobId === "string" ? req.query.jobId : undefined;
      if (jobId && !Types.ObjectId.isValid(jobId)) {
        res.status(400).json({ message: "Invalid jobId" });
        return;
      }

      const query: Record<string, unknown> = {
        recruiterId: req.user.id,
      };
      if (jobId) query.jobId = jobId;

      const applicants = await Applicant.find(query);
      res.status(200).json({ applicants });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applicants" });
    }
  }

  static async GetApplicantById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params["id"];
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid applicant id" });
        return;
      }

      const applicant = await Applicant.findOne({
        _id: id,
        recruiterId: req.user.id,
      });

      if (!applicant) {
        res.status(404).json({ message: "Applicant not found" });
        return;
      }

      res.status(200).json({ applicant });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applicant" });
    }
  }

  static async CreateApplicant(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const {
        jobId,
        fullName,
        email,
        phone,
        location,
        resumeUrl,
        resumeFileName,
        resumeText,
        linkedInUrl,
        portfolioUrl,
        structuredProfile,
        parsedData,
        normalized,
        status,
        source,
        sourceFileId,
        isParsed,
        parsedAt,
        recruiterNotes,
        tags,
      } = req.body;
      if (!jobId || !fullName || !source) {
        res.status(400).json({
          message: "jobId, fullName, and source are required",
        });
        return;
      }
      if (!Types.ObjectId.isValid(jobId)) {
        res.status(400).json({ message: "Invalid jobId" });
        return;
      }
      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        res.status(400).json({ message: "Invalid email" });
        return;
      }

      const existing = email ? await Applicant.findOne({ email }) : null;

      const applicant = await Applicant.create({
        jobId,
        recruiterId: req.user.id,
        fullName,
        email,
        phone,
        location,
        resumeUrl,
        resumeFileName,
        resumeText,
        linkedInUrl,
        portfolioUrl,
        structuredProfile,
        parsedData,
        normalized,
        status,
        source,
        sourceFileId,
        isDuplicate: Boolean(existing),
        isParsed,
        parsedAt,
        recruiterNotes,
        tags,
      });

      res.status(201).json({ applicant });
    } catch (error) {
      res.status(500).json({ message: "Failed to create applicant" });
    }
  }

  static async UpdateApplicant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params["id"];
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid applicant id" });
        return;
      }
      const existingApplicant = await Applicant.findById(id);
      if (!existingApplicant) {
        res.status(404).json({ message: "Applicant not found" });
        return;
      }
      if (String(existingApplicant.recruiterId) !== req.user.id) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      const allowedFields = [
        "fullName",
        "email",
        "phone",
        "location",
        "resumeUrl",
        "resumeFileName",
        "resumeText",
        "linkedInUrl",
        "portfolioUrl",
        "structuredProfile",
        "parsedData",
        "normalized",
        "status",
        "source",
        "sourceFileId",
        "isParsed",
        "parsedAt",
        "recruiterNotes",
        "tags",
      ] as const;
      const updateData: Record<string, unknown> = {};
      for (const key of allowedFields) {
        if (key in req.body) updateData[key] = req.body[key];
      }
      if (updateData.email && !/^\S+@\S+\.\S+$/.test(String(updateData.email))) {
        res.status(400).json({ message: "Invalid email" });
        return;
      }

      const updatedApplicant = await Applicant.findOneAndUpdate(
        { _id: id, recruiterId: req.user.id },
        { $set: updateData },
        { new: true, runValidators: true },
      );

      if (!updatedApplicant) {
        res.status(404).json({ message: "Applicant not found" });
        return;
      }

      res.status(200).json({ applicant: updatedApplicant });
    } catch (error) {
      res.status(500).json({ message: "Failed to update applicant" });
    }
  }

  static async DeleteApplicant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params["id"];
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid applicant id" });
        return;
      }
      const existingApplicant = await Applicant.findById(id);
      if (!existingApplicant) {
        res.status(404).json({ message: "Applicant not found" });
        return;
      }
      if (String(existingApplicant.recruiterId) !== req.user.id) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      const deleted = await Applicant.findOneAndDelete({
        _id: id,
        recruiterId: req.user.id,
      });

      if (!deleted) {
        res.status(404).json({ message: "Applicant not found" });
        return;
      }

      res.status(200).json({ message: "Applicant deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete applicant" });
    }
  }
}

export default ApplicantsController;
