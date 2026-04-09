import Recruiter from "../Models/Recruiter.model.js";
import HashMe from "../config/hash.config.js";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import type { AuthRequest } from "../types/type.js";
import {
    GenerateToken,
    GenerateRefreshToken,
    VerifyRefreshToken,
} from "../utils/token.js";

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
    async updateRecruiter(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            if (!req.user || req.user.id !== id) {
                return res.status(403).json({ success: false, message: "Access denied" });
            }
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
    async deleteRecruiter(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            if (!req.user || req.user.id !== id) {
                return res.status(403).json({ success: false, message: "Access denied" });
            }
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

    /**
     * Login recruiter
     */
    async loginRecruiter(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Email and password are required",
                });
            }

            const recruiter = await Recruiter.findOne({ email });
            if (!recruiter || !recruiter.password) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
            }

            const isValid = await bcrypt.compare(password, recruiter.password);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
            }

            const payload = {
                id: recruiter.id,
                role: recruiter.role,
                email: recruiter.email,
            };
            const accessToken = GenerateToken(payload);
            const refreshToken = GenerateRefreshToken(payload);

            recruiter.refreshToken = refreshToken;
            recruiter.lastLoginAt = new Date();
            await recruiter.save();

            const recruiterSafe = recruiter.toObject();
            delete recruiterSafe.password;
            delete recruiterSafe.refreshToken;

            return res.status(200).json({
                success: true,
                message: "Login successful",
                accessToken,
                refreshToken,
                recruiter: recruiterSafe,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to login",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    /**
     * Refresh access token
     */
    async refreshRecruiterToken(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: "Refresh token is required",
                });
            }

            let payload;
            try {
                payload = VerifyRefreshToken(refreshToken);
            } catch {
                return res.status(401).json({
                    success: false,
                    message: "Invalid or expired refresh token",
                });
            }

            const recruiter = await Recruiter.findById(payload.id);
            if (!recruiter || recruiter.refreshToken !== refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid or expired refresh token",
                });
            }

            const newPayload = {
                id: recruiter.id,
                role: recruiter.role,
                email: recruiter.email,
            };
            const accessToken = GenerateToken(newPayload);
            const newRefreshToken = GenerateRefreshToken(newPayload);

            recruiter.refreshToken = newRefreshToken;
            await recruiter.save();

            return res.status(200).json({
                success: true,
                message: "Token refreshed",
                accessToken,
                refreshToken: newRefreshToken,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to refresh token",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    /**
     * Logout recruiter
     */
    async logoutRecruiter(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: "Refresh token is required",
                });
            }

            const recruiter = await Recruiter.findOne({ refreshToken });
            if (recruiter) {
                recruiter.refreshToken = undefined;
                await recruiter.save();
            }

            return res.status(200).json({
                success: true,
                message: "Logged out successfully",
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to logout",
                error: error instanceof Error ? error.message : error,
            });
        }
    }
}

export default new RecruiterController();
