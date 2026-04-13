import { Types } from "mongoose";
import Job from "../Models/Job.model.js";
import { sendJobPostedEmail } from "../utils/email.js";
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
            if (!title || typeof title !== "string") {
                return res.status(400).json({ success: false, message: "title is required" });
            }
            if (!Array.isArray(skills) || skills.length === 0) {
                return res.status(400).json({ success: false, message: "skills are required" });
            }
            const expNum = Number(experience);
            if (!Number.isFinite(expNum) || expNum < 0) {
                return res.status(400).json({ success: false, message: "experience is invalid" });
            }
            const job = await Job.create({
                title,
                description,
                skills,
                experience: expNum,
                education,
                location,
                recruiterId: req.user.id,
            });
            if (req.user.email) {
                try {
                    await sendJobPostedEmail(req.user.email, job.title);
                }
                catch (emailError) {
                    console.error("Failed to send job posted email", emailError);
                }
            }
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
            const page = Number.parseInt(String(_req.query.page ?? 1), 10) || 1;
            const limit = Number.parseInt(String(_req.query.limit ?? 20), 10) || 20;
            const [total, jobs] = await Promise.all([
                Job.countDocuments(),
                Job.find()
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit),
            ]);
            return res.status(200).json({
                success: true,
                data: jobs,
                pagination: { page, limit, total },
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
            if (updateData.title && typeof updateData.title !== "string") {
                return res.status(400).json({ success: false, message: "Invalid title" });
            }
            if (updateData.skills && (!Array.isArray(updateData.skills) || updateData.skills.length === 0)) {
                return res.status(400).json({ success: false, message: "Invalid skills" });
            }
            if (updateData.experience !== undefined) {
                const expNum = Number(updateData.experience);
                if (!Number.isFinite(expNum) || expNum < 0) {
                    return res.status(400).json({ success: false, message: "Invalid experience" });
                }
                updateData.experience = expNum;
            }
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