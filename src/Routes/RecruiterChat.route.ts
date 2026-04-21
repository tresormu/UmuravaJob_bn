import { Router } from "express";
import RecruiterChatController from "../Controllers/RecruiterChat.controller.js";
import { protect } from "../Middlewares/Auth.Middleware.js";

const router = Router();

/**
 * @swagger
 * /api/recruiter/chat/{jobId}:
 *   post:
 *     summary: Chat with AI about a specific job and its applicants
 *     tags: [Recruiter Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID context for the chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message to send to the AI
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, model]
 *                     parts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           text:
 *                             type: string
 *     responses:
 *       200:
 *         description: AI response
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.post("/:jobId", protect, RecruiterChatController.chatWithAI);

export default router;
