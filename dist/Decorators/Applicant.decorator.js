/**
 * @openapi
 * tags:
 *   name: Applicants
 *   description: Applicant management and screening intake
 */
export {};
/**
 * @openapi
 * /api/applicants:
 *   get:
 *     summary: Get all applicants
 *     tags: [Applicants]
 *     responses:
 *       200:
 *         description: List of applicants
 */
/**
 * @openapi
 * /api/applicants/{id}:
 *   get:
 *     summary: Get an applicant by ID
 *     tags: [Applicants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Applicant found
 *       404:
 *         description: Applicant not found
 */
/**
 * @openapi
 * /api/applicants:
 *   post:
 *     summary: Create a new applicant
 *     tags: [Applicants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobId, fullName, source]
 *             properties:
 *               jobId:
 *                 type: string
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
 *               structuredProfile:
 *                 type: object
 *               parsedData:
 *                 type: object
 *               normalized:
 *                 type: object
 *               status:
 *                 type: string
 *               source:
 *                 type: string
 *               sourceFileId:
 *                 type: string
 *               isParsed:
 *                 type: boolean
 *               parsedAt:
 *                 type: string
 *                 format: date-time
 *               recruiterNotes:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Applicant created. Application and candidate are linked.
 *       400:
 *         description: Invalid request body
 */
/**
 * @openapi
 * /api/applicants/{id}:
 *   patch:
 *     summary: Update an applicant
 *     tags: [Applicants]
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
 *     responses:
 *       200:
 *         description: Applicant updated
 *       404:
 *         description: Applicant not found
 */
/**
 * @openapi
 * /api/applicants/{id}:
 *   delete:
 *     summary: Delete an applicant
 *     tags: [Applicants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Applicant deleted
 *       404:
 *         description: Applicant not found
 */
//# sourceMappingURL=Applicant.decorator.js.map