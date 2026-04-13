/**
 * @openapi
 * tags:
 *   name: Applications
 *   description: Application intake and pipeline
 */
export {};
/**
 * @openapi
 * /api/jobs/{jobId}/applications:
 *   post:
 *     summary: Submit an application for a job
 *     tags: [Applications]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName]
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               location:
 *                 type: string
 *               resumeUrl:
 *                 type: string
 *               resumeFileName:
 *                 type: string
 *               resumeText:
 *                 type: string
 *               linkedInUrl:
 *                 type: string
 *               portfolioUrl:
 *                 type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     value:
 *                       type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully. Applicant receives confirmation email.
 *       400:
 *         description: Invalid request payload
 *       409:
 *         description: Application already exists
 *       500:
 *         description: Failed to submit application
 */
/**
 * @openapi
 * /api/jobs/{jobId}/applications/upload:
 *   post:
 *     summary: Bulk upload applications via Excel
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload processed
 *       400:
 *         description: Invalid upload or file
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Failed to process Excel upload
 */
/**
 * @openapi
 * /api/jobs/{jobId}/applications:
 *   get:
 *     summary: List applications for a job
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [applied, screened, shortlisted, rejected]
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Applications fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Failed to fetch applications
 */
/**
 * @openapi
 * /api/applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [applied, screened, shortlisted, rejected]
 *     responses:
 *       200:
 *         description: Application status updated. Shortlisted applicants receive an email.
 *       400:
 *         description: Invalid status or application id
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found
 *       500:
 *         description: Failed to update status
 */
//# sourceMappingURL=Application.decorator.js.map