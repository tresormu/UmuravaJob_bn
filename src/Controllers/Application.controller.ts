import type { Response } from "express";
import Applicant from "../Models/Applicant.model.js";
import Candidate from "../Models/Candidate.model.js";
import Application from "../Models/Application.model.js";
import Job from "../Models/Job.model.js";
import mongoose from "mongoose";
import { Types } from "mongoose";
import type { AuthRequest } from "../types/type.js";
import { sendShortlistedEmail } from "../utils/email.js";
import NotificationController from "./Notification.controller.js";
import { NotificationType } from "../Models/Notification.model.js";
import { ResponseMessages } from "../utils/responseMessages.js";

class ApplicantsController {
  private static addIfDefined(
    target: Record<string, unknown>,
    key: string,
    value: unknown,
  ): void {
    if (value !== undefined) {
      target[key] = value;
    }
  }

  static async GetApplicants(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: ResponseMessages.ERROR.UNAUTHORIZED });
        return;
      }
      const userId = req.user.id;

      const jobId =
        typeof req.query?.jobId === "string" ? req.query.jobId : undefined;
      if (jobId && !Types.ObjectId.isValid(jobId)) {
        res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("job ID") });
        return;
      }

      const query: Record<string, unknown> = {
        recruiterId: userId,
      };
      if (jobId) query.jobId = jobId;

      const page = Number.parseInt(String(req.query.page ?? 1), 10) || 1;
      const limit = Number.parseInt(String(req.query.limit ?? 20), 10) || 20;

      const [total, applicants] = await Promise.all([
        Applicant.countDocuments(query),
        Applicant.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
      ]);

      res.status(200).json({ applicants, pagination: { page, limit, total } });
    } catch (error) {
      res.status(500).json({ message: "We're sorry, we couldn't fetch the applicant list at this time." });
    }
  }

  static async GetApplicantById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params["id"];
      if (!req.user) {
        res.status(401).json({ message: ResponseMessages.ERROR.UNAUTHORIZED });
        return;
      }
      const userId = req.user.id;
      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("applicant ID") });
        return;
      }

      const applicant = await Applicant.findOne({
        _id: id,
        recruiterId: userId,
      });

      if (!applicant) {
        res.status(404).json({ message: ResponseMessages.ERROR.NOT_FOUND("applicant profile") });
        return;
      }

      res.status(200).json({ applicant });
    } catch (error) {
      res.status(500).json({ message: "I'm sorry, we couldn't retrieve the applicant's details right now." });
    }
  }

  static async CreateApplicant(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: ResponseMessages.ERROR.UNAUTHORIZED });
        return;
      }
      const userId = req.user.id;

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
          message: "I'm sorry, but jobId, fullName, and source are required to create an applicant.",
        });
        return;
      }
      if (!Types.ObjectId.isValid(jobId)) {
        res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("job ID") });
        return;
      }
      const job = await Job.findById(jobId);
      if (!job) {
        res.status(404).json({ message: ResponseMessages.ERROR.NOT_FOUND("job listing") });
        return;
      }
      if (String(job.recruiterId) !== userId) {
        res.status(403).json({ message: ResponseMessages.ERROR.FORBIDDEN });
        return;
      }
      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("email address") });
        return;
      }

      const existing = email ? await Applicant.findOne({ email }) : null;

      let applicant;
      try {
        // Temporarily disabled transaction for debugging
        {
          let candidate = email ? await Candidate.findOne({ email }) : null;
          if (!candidate) {
            const candidateData: Record<string, unknown> = { fullName };
            ApplicantsController.addIfDefined(candidateData, "email", email);
            ApplicantsController.addIfDefined(candidateData, "phone", phone);
            ApplicantsController.addIfDefined(candidateData, "location", location);
            ApplicantsController.addIfDefined(candidateData, "resumeUrl", resumeUrl);
            ApplicantsController.addIfDefined(candidateData, "resumeFileName", resumeFileName);
            ApplicantsController.addIfDefined(candidateData, "resumeText", resumeText);
            ApplicantsController.addIfDefined(candidateData, "linkedInUrl", linkedInUrl);
            ApplicantsController.addIfDefined(candidateData, "portfolioUrl", portfolioUrl);

            const createdCandidates = await Candidate.create([candidateData]);
            const createdCandidate = createdCandidates[0];
            if (!createdCandidate) {
              throw new Error("CANDIDATE_CREATE_FAILED");
            }
            candidate = createdCandidate;
          }

          if (!candidate) {
            throw new Error("CANDIDATE_CREATE_FAILED");
          }

          let application = await Application.findOne({
            jobId,
            candidateId: candidate._id,
          });

          if (!application) {
            const createdApplications = await Application.create(
              [
                {
                  jobId,
                  candidateId: candidate._id,
                  recruiterId: userId,
                  status: status ?? "applied",
                  source: "manual",
                },
              ],
            );
            const createdApplication = createdApplications[0];
            if (!createdApplication) {
              throw new Error("APPLICATION_CREATE_FAILED");
            }
            application = createdApplication;
          }

          if (!application) {
            throw new Error("APPLICATION_CREATE_FAILED");
          }

          const applicantData: Record<string, unknown> = {
            jobId,
            recruiterId: userId,
            applicationId: application._id,
            fullName,
            source,
            isDuplicate: Boolean(existing),
          };
          ApplicantsController.addIfDefined(applicantData, "email", email);
          ApplicantsController.addIfDefined(applicantData, "phone", phone);
          ApplicantsController.addIfDefined(applicantData, "location", location);
          ApplicantsController.addIfDefined(applicantData, "resumeUrl", resumeUrl);
          ApplicantsController.addIfDefined(applicantData, "resumeFileName", resumeFileName);
          ApplicantsController.addIfDefined(applicantData, "resumeText", resumeText);
          ApplicantsController.addIfDefined(applicantData, "linkedInUrl", linkedInUrl);
          ApplicantsController.addIfDefined(applicantData, "portfolioUrl", portfolioUrl);
          ApplicantsController.addIfDefined(applicantData, "structuredProfile", structuredProfile);
          ApplicantsController.addIfDefined(applicantData, "parsedData", parsedData);
          ApplicantsController.addIfDefined(applicantData, "normalized", normalized);
          ApplicantsController.addIfDefined(applicantData, "status", status);
          ApplicantsController.addIfDefined(applicantData, "sourceFileId", sourceFileId);
          ApplicantsController.addIfDefined(applicantData, "isParsed", isParsed);
          ApplicantsController.addIfDefined(applicantData, "parsedAt", parsedAt);
          ApplicantsController.addIfDefined(applicantData, "recruiterNotes", recruiterNotes);
          ApplicantsController.addIfDefined(applicantData, "tags", tags);

          const createdApplicants = await Applicant.create([applicantData]);
          const createdApplicant = createdApplicants[0];
          if (!createdApplicant) {
            throw new Error("APPLICANT_CREATE_FAILED");
          }
          applicant = createdApplicant;

          // Add Notification for Recruiter
          try {
            await NotificationController.createNotification({
              recipientId: userId,
              recipientType: "Recruiter",
              title: "Applicant Manually Added",
              message: `You have successfully added ${fullName} to the "${job.title}" position.`,
              type: NotificationType.NEW_APPLICANT,
              data: {
                jobId: job._id,
                applicantId: applicant._id,
              },
            });
          } catch (notifError) {
            console.error("Failed to create manual applicant notification", notifError);
          }
        }
      } finally {
        // session.endSession();
      }

      res.status(201).json({ 
        message: ResponseMessages.SUCCESS.CREATED("applicant profile"),
        applicant 
      });
    } catch (error) {
      console.error("CreateApplicant error:", error);
      throw error;
    }
  }

  static async UpdateApplicant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params["id"];
      if (!req.user) {
        res.status(401).json({ message: ResponseMessages.ERROR.UNAUTHORIZED });
        return;
      }
      const userId = req.user.id;
      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("applicant ID") });
        return;
      }
      const existingApplicant = await Applicant.findById(id);
      if (!existingApplicant) {
        res.status(404).json({ message: ResponseMessages.ERROR.NOT_FOUND("applicant profile") });
        return;
      }
      if (String(existingApplicant.recruiterId) !== userId) {
        res.status(403).json({ message: ResponseMessages.ERROR.FORBIDDEN });
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
        res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("email address") });
        return;
      }
      if (
        updateData.status &&
        !["applied", "screened", "shortlisted", "rejected"].includes(
          String(updateData.status),
        )
      ) {
        res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("status") });
        return;
      }

      const updatedApplicant = await Applicant.findOneAndUpdate(
        { _id: id, recruiterId: userId },
        { $set: updateData },
        { new: true, runValidators: true },
      );

      if (!updatedApplicant) {
        res.status(404).json({ message: ResponseMessages.ERROR.NOT_FOUND("applicant profile") });
        return;
      }

      if (updatedApplicant?.applicationId && updateData.status) {
        await Application.updateOne(
          { _id: updatedApplicant.applicationId },
          { $set: { status: updateData.status } },
        );
      }

      if (updatedApplicant?.email && updateData.status === "shortlisted") {
        const job = await Job.findById(updatedApplicant.jobId);
        if (job) {
          try {
            await sendShortlistedEmail(updatedApplicant.email, job.title, updatedApplicant.fullName);
          } catch (emailError) {
            console.error("Failed to send shortlisted email", emailError);
          }
        }
      }

      res.status(200).json({ 
        message: ResponseMessages.SUCCESS.UPDATED("applicant profile"),
        applicant: updatedApplicant 
      });
    } catch (error) {
      res.status(500).json({ message: "I'm sorry, we couldn't update the applicant's profile at this time." });
    }
  }

  static async DeleteApplicant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params["id"];
      if (!req.user) {
        res.status(401).json({ message: ResponseMessages.ERROR.UNAUTHORIZED });
        return;
      }
      const userId = req.user.id;
      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: ResponseMessages.ERROR.INVALID_FIELD("applicant ID") });
        return;
      }
      const existingApplicant = await Applicant.findById(id);
      if (!existingApplicant) {
        res.status(404).json({ message: ResponseMessages.ERROR.NOT_FOUND("applicant profile") });
        return;
      }
      if (String(existingApplicant.recruiterId) !== userId) {
        res.status(403).json({ message: ResponseMessages.ERROR.FORBIDDEN });
        return;
      }

      const deleted = await Applicant.findOneAndDelete({
        _id: id,
        recruiterId: userId,
      });

      if (!deleted) {
        res.status(404).json({ message: ResponseMessages.ERROR.NOT_FOUND("applicant profile") });
        return;
      }

      res.status(200).json({ message: ResponseMessages.SUCCESS.DELETED("applicant profile") });
    } catch (error) {
      res.status(500).json({ message: "We encountered a problem while trying to delete the applicant record." });
    }
  }
}

export default ApplicantsController;
