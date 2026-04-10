import { Types } from "mongoose";
import Job from "../Models/Job.model.js";
class JobController {
    /**
     * Create a new job
     */
    async createJob(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            if (req.user.role !== "recruiter") {
                return res.status(403).json({
                    success: false,
                    message: "Access denied",
                });
            }
            const { title, description, skills, experience, education, location } = req.body;
            const job = await Job.create({
                title,
                description,
                skills,
                experience,
                education,
                location,
                recruiterId: req.user.id,
            });
            return res.status(201).json({
                success: true,
                message: "Job created successfully",
                data: job,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error creating job",
                error: error instanceof Error ? error.message : error,
            });
        }
    }
    /**
     * Get all jobs
     */
    async getAllJobs(_req, res) {
        try {
            const jobs = await Job.find().sort({ createdAt: -1 });
            return res.status(200).json({
                success: true,
                data: jobs,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching jobs",
                error: error instanceof Error ? error.message : error,
            });
        }
    }
    /**
     * Get a job by ID
     */
    async getJobById(req, res) {
        try {
            const { id } = req.params;
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
            return res.status(200).json({
                success: true,
                data: job,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching job",
                error: error instanceof Error ? error.message : error,
            });
        }
    }
    /**
     * Update a job
     */
    async updateJob(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            if (req.user.role !== "recruiter") {
                return res.status(403).json({
                    success: false,
                    message: "Access denied",
                });
            }
            const { id } = req.params;
            if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid job id",
                });
            }
            const existingJob = await Job.findById(id);
            if (!existingJob) {
                return res.status(404).json({
                    success: false,
                    message: "Job not found",
                });
            }
            if (String(existingJob.recruiterId) !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied",
                });
            }
            const updateData = { ...req.body };
            delete updateData.recruiterId;
            const updatedJob = await Job.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            });
            if (!updatedJob) {
                return res.status(404).json({
                    success: false,
                    message: "Job not found",
                });
            }
            return res.status(200).json({
                success: true,
                message: "Job updated successfully",
                data: updatedJob,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error updating job",
                error: error instanceof Error ? error.message : error,
            });
        }
    }
    /**
     * Delete a job
     */
    async deleteJob(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            if (req.user.role !== "recruiter") {
                return res.status(403).json({
                    success: false,
                    message: "Access denied",
                });
            }
            const { id } = req.params;
            if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid job id",
                });
            }
            const existingJob = await Job.findById(id);
            if (!existingJob) {
                return res.status(404).json({
                    success: false,
                    message: "Job not found",
                });
            }
            if (String(existingJob.recruiterId) !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied",
                });
            }
            const deletedJob = await Job.findByIdAndDelete(id);
            if (!deletedJob) {
                return res.status(404).json({
                    success: false,
                    message: "Job not found",
                });
            }
            return res.status(200).json({
                success: true,
                message: "Job deleted successfully",
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error deleting job",
                error: error instanceof Error ? error.message : error,
            });
        }
    }
}
export default new JobController();
//# sourceMappingURL=Job.controller.js.map