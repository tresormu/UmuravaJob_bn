import Recruiter from "../Models/Recruiter.model.js";
import HashMe from "../config/hash.config.js";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import type { AuthRequest } from "../types/type.js";
import crypto from "crypto";
import { sendRecruiterDeletionEmail, sendVerificationEmail, sendAccountDeletionVerificationEmail } from "../utils/email.js";
import {
    GenerateToken,
    GenerateRefreshToken,
    VerifyRefreshToken,
} from "../utils/token.js";
import { ResponseMessages } from "../utils/responseMessages.js";

const generateVerificationCode = (): string =>
    String(crypto.randomInt(100000, 1000000));

const hashToken = (value: string): string =>
    crypto.createHash("sha256").update(value).digest("hex");

class RecruiterController {

    /**
     * Create a new recruiter
     */
    async createRecruiter(req: Request, res: Response) {
        try {
            const { firstName, lastName, email, password, phone, companyName, companyWebsite, position, bio } = req.body;
            if (!firstName || !lastName || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "I'm sorry, but we need your first name, last name, email, and password to create your account.",
                });
            }
            if (!/^\S+@\S+\.\S+$/.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: ResponseMessages.ERROR.INVALID_FIELD("email address"),
                });
            }

            const existing = await Recruiter.findOne({ email });
            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: ResponseMessages.ERROR.EMAIL_ALREADY_IN_USE,
                });
            }
            
            // Hash the password before saving
            const hashedPassword = await HashMe(password);
            const verificationCode = generateVerificationCode();
            const verificationHash = hashToken(verificationCode);
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
            
            const recruiter = await Recruiter.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phone,
                companyName,
                companyWebsite,
                position,
                bio,
                role: "recruiter",
                isEmailVerified: false,
                emailVerificationToken: verificationHash,
                emailVerificationExpires: expiresAt,
                isActive: true,
            });

            try {
                await sendVerificationEmail(email, verificationCode);
            } catch (emailError) {
                console.error("Failed to send verification email:", emailError);
                // We don't fail the request because the recruiter was already created
            }
            
            return res.status(201).json({ 
                success: true, 
                message: "Welcome! Your recruiter profile has been created successfully, and a verification code has been sent to your email.", 
                recruiter 
            });
        } catch (error) {
            if (error && typeof error === "object") {
                // Log richer error details during development/testing
                console.error("Recruiter create error:", error);
            }
            const message =
                error instanceof Error ? error.message : "Failed to create recruiter";
            return res.status(500).json({
                success: false,
                message: "I'm sorry, we encountered a problem while creating your account. Please try again.",
                error: process.env.NODE_ENV === "test" ? message : undefined,
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
                message: ResponseMessages.SUCCESS.FETCHED("Recruiters"), 
                recruiter 
            });
        } catch (error) {
            return res.status(500).json({ 
                success: false, 
                message: "We're sorry, we couldn't fetch the recruiter list at the moment.", 
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
                return res.status(404).json({ success: false, message: ResponseMessages.ERROR.NOT_FOUND("recruiter profile") });
            }

            return res.status(200).json({ 
                success: true, 
                message: ResponseMessages.SUCCESS.FETCHED("Recruiter profile"), 
                recruiter 
            });
        } catch (error) {
            return res.status(500).json({ 
                success: false, 
                message: "We apologize, but we couldn't retrieve that recruiter's profile.", 
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
                return res.status(403).json({ success: false, message: ResponseMessages.ERROR.FORBIDDEN });
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
                return res.status(404).json({ success: false, message: ResponseMessages.ERROR.NOT_FOUND("recruiter profile") });
            }

            return res.status(200).json({ 
                success: true, 
                message: ResponseMessages.SUCCESS.UPDATED("recruiter profile"), 
                recruiter 
            });
        } catch (error) {
            return res.status(500).json({ 
                success: false, 
                message: "I'm sorry, we couldn't update your profile at this time. Please try again.", 
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
                return res.status(403).json({ success: false, message: ResponseMessages.ERROR.FORBIDDEN });
            }
            const recruiter = await Recruiter.findByIdAndDelete(id);
            
            if (!recruiter) {
                return res.status(404).json({ success: false, message: ResponseMessages.ERROR.NOT_FOUND("recruiter profile") });
            }

            try {
                await sendRecruiterDeletionEmail(recruiter.email, recruiter.firstName);
            } catch (emailError) {
                console.error("Failed to send recruiter deletion email", emailError);
            }

            return res.status(200).json({ 
                success: true, 
                message: ResponseMessages.SUCCESS.DELETED("recruiter profile"), 
                recruiter 
            });
        } catch (error) {
            return res.status(500).json({ 
                success: false, 
                message: "We're sorry, we encountered an error while trying to delete your profile.", 
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
                    message: "Please provide both your email and password to log in.",
                });
            }

            const recruiter = await Recruiter.findOne({ email });
            if (!recruiter || !recruiter.password) {
                return res.status(401).json({
                    success: false,
                    message: ResponseMessages.ERROR.INVALID_CREDENTIALS,
                });
            }
            if (!recruiter.isEmailVerified) {
                return res.status(403).json({
                    success: false,
                    message: ResponseMessages.ERROR.EMAIL_NOT_VERIFIED,
                });
            }

            const isValid = await bcrypt.compare(password, recruiter.password);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    message: ResponseMessages.ERROR.INVALID_CREDENTIALS,
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
                message: ResponseMessages.SUCCESS.LOGIN,
                accessToken,
                refreshToken,
                recruiter: recruiterSafe,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "I'm sorry, we couldn't log you in at the moment. Please try again later.",
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
                    message: "I'm sorry, a refresh token is required to proceed.",
                });
            }

            let payload;
            try {
                payload = VerifyRefreshToken(refreshToken);
            } catch {
                return res.status(401).json({
                    success: false,
                    message: ResponseMessages.ERROR.INVALID_TOKEN,
                });
            }

            const recruiter = await Recruiter.findById(payload.id);
            if (!recruiter || recruiter.refreshToken !== refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: ResponseMessages.ERROR.INVALID_TOKEN,
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
                message: ResponseMessages.SUCCESS.TOKEN_REFRESHED,
                accessToken,
                refreshToken: newRefreshToken,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "We're sorry, we couldn't refresh your session. Please log in again.",
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
                    message: "I'm sorry, a refresh token is required to proceed.",
                });
            }

            const recruiter = await Recruiter.findOne({ refreshToken });
            if (recruiter) {
                recruiter.refreshToken = undefined;
                await recruiter.save();
            }

            return res.status(200).json({
                success: true,
                message: ResponseMessages.SUCCESS.LOGOUT,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "We encountered an issue while logging you out.",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    /**
     * Verify recruiter email
     */
    async verifyRecruiterEmail(req: Request, res: Response) {
        try {
            const { email, code } = req.body as { email?: string; code?: string };
            if (!email || !code) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide both your email and the verification code.",
                });
            }
            const recruiter = await Recruiter.findOne({ email });
            if (!recruiter) {
                return res.status(404).json({
                    success: false,
                    message: ResponseMessages.ERROR.NOT_FOUND("recruiter profile"),
                });
            }
            if (recruiter.isEmailVerified) {
                return res.status(200).json({
                    success: true,
                    message: ResponseMessages.SUCCESS.EMAIL_VERIFIED,
                });
            }
            if (!recruiter.emailVerificationToken || !recruiter.emailVerificationExpires) {
                return res.status(400).json({
                    success: false,
                    message: "I'm sorry, I couldn't find a verification code for this account.",
                });
            }
            if (recruiter.emailVerificationExpires.getTime() < Date.now()) {
                return res.status(400).json({
                    success: false,
                    message: ResponseMessages.ERROR.EXPIRED_CODE,
                });
            }
            const codeHash = hashToken(code);
            if (codeHash !== recruiter.emailVerificationToken) {
                return res.status(400).json({
                    success: false,
                    message: ResponseMessages.ERROR.INVALID_CODE,
                });
            }

            recruiter.isEmailVerified = true;
            recruiter.emailVerificationToken = undefined;
            recruiter.emailVerificationExpires = undefined;

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
                message: ResponseMessages.SUCCESS.EMAIL_VERIFIED,
                accessToken,
                refreshToken,
                recruiter: recruiterSafe,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "I'm sorry, we couldn't verify your email address. Please try again.",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    /**
     * Resend verification code
     */
    async resendVerificationCode(req: Request, res: Response) {
        try {
            const { email } = req.body as { email?: string };
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide your email address to resend the code.",
                });
            }
            const recruiter = await Recruiter.findOne({ email });
            if (!recruiter) {
                return res.status(404).json({
                    success: false,
                    message: ResponseMessages.ERROR.NOT_FOUND("recruiter profile"),
                });
            }
            if (recruiter.isEmailVerified) {
                return res.status(200).json({
                    success: true,
                    message: ResponseMessages.SUCCESS.EMAIL_VERIFIED,
                });
            }

            const verificationCode = generateVerificationCode();
            recruiter.emailVerificationToken = hashToken(verificationCode);
            recruiter.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
            await recruiter.save();

            await sendVerificationEmail(email, verificationCode);

            return res.status(200).json({
                success: true,
                message: ResponseMessages.SUCCESS.CODE_RESENT,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "I'm sorry, we couldn't resend your verification code. Please try again.",
                error: error instanceof Error ? error.message : error,
            });
        }
    }
    /**
     * Request account deletion — sends a verification code to the recruiter's email
     */
    async requestDeleteAccount(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: "Not authenticated." });
            }
            const recruiter = await Recruiter.findById(req.user.id);
            if (!recruiter) {
                return res.status(404).json({ success: false, message: ResponseMessages.ERROR.NOT_FOUND("recruiter profile") });
            }

            const code = generateVerificationCode();
            recruiter.deletionVerificationToken = hashToken(code);
            recruiter.deletionVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
            await recruiter.save();

            await sendAccountDeletionVerificationEmail(recruiter.email, code, recruiter.firstName);

            return res.status(200).json({
                success: true,
                message: "A verification code has been sent to your email. Enter it to confirm account deletion.",
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "We couldn't send the verification code. Please try again.",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    /**
     * Confirm account deletion with the verification code
     */
    async confirmDeleteAccount(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: "Not authenticated." });
            }
            const { code } = req.body as { code?: string };
            if (!code) {
                return res.status(400).json({ success: false, message: "Please provide the verification code." });
            }

            const recruiter = await Recruiter.findById(req.user.id);
            if (!recruiter) {
                return res.status(404).json({ success: false, message: ResponseMessages.ERROR.NOT_FOUND("recruiter profile") });
            }
            if (!recruiter.deletionVerificationToken || !recruiter.deletionVerificationExpires) {
                return res.status(400).json({ success: false, message: "No deletion request found. Please request a new code." });
            }
            if (recruiter.deletionVerificationExpires.getTime() < Date.now()) {
                return res.status(400).json({ success: false, message: ResponseMessages.ERROR.EXPIRED_CODE });
            }
            if (hashToken(code) !== recruiter.deletionVerificationToken) {
                return res.status(400).json({ success: false, message: ResponseMessages.ERROR.INVALID_CODE });
            }

            await Recruiter.findByIdAndDelete(req.user.id);

            try {
                await sendRecruiterDeletionEmail(recruiter.email, recruiter.firstName);
            } catch (emailError) {
                console.error("Failed to send deletion confirmation email", emailError);
            }

            return res.status(200).json({
                success: true,
                message: "Your account has been permanently deleted.",
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "We couldn't delete your account. Please try again.",
                error: error instanceof Error ? error.message : error,
            });
        }
    }
}

export default new RecruiterController();
