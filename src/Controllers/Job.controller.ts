import type { Request, Response } from "express";
import { Types } from "mongoose";
import Job from "../Models/Job.model.js";

//  CREATE JOB
export const createJob = async (req: Request, res: Response) => {
  try {
    const { title, description, skills, experience, education, location } = req.body;

    const job = new Job({
      title,
      description,
      skills,
      experience,
      education,
      location,
    });

    const savedJob = await job.save();

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: savedJob,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating job",
      error: error.message,
    });
  }
};

// ✅ GET ALL JOBS
export const getAllJobs = async (_req: Request, res: Response) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching jobs",
      error: error.message,
    });
  }
};

// ✅ GET SINGLE JOB
export const getJobById = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"];

    if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error fetching job",
      error: error.message,
    });
  }
};

// ✅ UPDATE JOB
export const updateJob = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"];

    if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id",
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: updatedJob,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error updating job",
      error: error.message,
    });
  }
};

// ✅ DELETE JOB
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"];

    if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id",
      });
    }

    const deletedJob = await Job.findByIdAndDelete(id);

    if (!deletedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error deleting job",
      error: error.message,
    });
  }
};