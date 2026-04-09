import Recruiter from "../Models/Recruiter.model.js";
import HashMe from "../config/hash.config.js";
import type { Request, Response } from "express";

class RecruiterController {
    /**
     * Create a new recruiter
     */
    async createRecruiter(req: Request, res: Response) {
        try {
            const { firstName, lastName, email, password, phone, companyName, companyWebsite, position, bio } = req.body;
            
            // Hash the password before saving
            const hashedPassword = await HashMe(password);
            
            const recruiter = await Recruiter.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phone,
                companyName,
                companyWebsite,
                position,
                bio
            });
            
            return res.status(201).json({ 
                success: true, 
                message: "Recruiter created successfully", 
                recruiter 
            });
        } catch (error) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to create recruiter", 
                error: error instanceof Error ? error.message : error 
            });
        }
    }

    /**
     * Get all recruiters
     */
    async getRecruiter(req: Request, res: Response) {
        try {
            const recruiter = await Recruiter.find();
            return res.status(200).json({ 
                success: true, 
                message: "Recruiters fetched successfully", 
                recruiter 
            });
        } catch (error) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to fetch recruiters", 
                error: error instanceof Error ? error.message : error 
            });
        }
    }

    /**
     * Get a recruiter by ID
     */
    async getRecruiterById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const recruiter = await Recruiter.findById(id);
            
            if (!recruiter) {
                return res.status(404).json({ success: false, message: "Recruiter not found" });
            }

            return res.status(200).json({ 
                success: true, 
                message: "Recruiter fetched successfully", 
                recruiter 
            });
        } catch (error) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to fetch recruiter", 
                error: error instanceof Error ? error.message : error 
            });
        }
    }

    /**
     * Update a recruiter
     */
    async updateRecruiter(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { firstName, lastName, email, password, phone, companyName, companyWebsite, position, bio } = req.body;
            
            // Prepare update object
            const updateData: any = { firstName, lastName, email, phone, companyName, companyWebsite, position, bio };
            
            // If a new password is provided, hash it
            if (password) {
                updateData.password = await HashMe(password);
            }

            const recruiter = await Recruiter.findByIdAndUpdate(id, updateData, { new: true });
            
            if (!recruiter) {
                return res.status(404).json({ success: false, message: "Recruiter not found" });
            }

            return res.status(200).json({ 
                success: true, 
                message: "Recruiter updated successfully", 
                recruiter 
            });
        } catch (error) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to update recruiter", 
                error: error instanceof Error ? error.message : error 
            });
        }
    }

    /**
     * Delete a recruiter
     */
    async deleteRecruiter(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const recruiter = await Recruiter.findByIdAndDelete(id);
            
            if (!recruiter) {
                return res.status(404).json({ success: false, message: "Recruiter not found" });
            }

            return res.status(200).json({ 
                success: true, 
                message: "Recruiter deleted successfully", 
                recruiter 
            });
        } catch (error) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to delete recruiter", 
                error: error instanceof Error ? error.message : error 
            });
        }
    }
}

export default new RecruiterController();