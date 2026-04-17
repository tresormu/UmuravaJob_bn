/**
 * @openapi
 * tags:
 *   name: Applicants
 *   description: Applicant management and screening intake
 */

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

/**
 * @openapi
 * /api/applicants/applicant-screening/schema:
 *   get:
 *     summary: Get Applicant Screening output schema example
 *     tags: [Applicants]
 *     responses:
 *       200:
 *         description: Applicant screening schema returned
 */

/**
 * @openapi
 * /api/applicants/applicant-screening/pdf:
 *   post:
 *     summary: Parse resume PDF, extract applicant profile with Gemini AI, and save to database
 *     tags: [Applicants]
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
 *         description: Applicant profile extracted and saved in applicants collection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 screening:
 *                   type: object
 *                   properties:
 *                     fileName:
 *                       type: string
 *                     applicantId:
 *                       type: string
 *                     pages:
 *                       type: number
 *                     extractedText:
 *                       type: string
 *                     applicantProfile:
 *                       type: object
 *                       properties:
 *                         personaInfo:
 *                           type: object
 *                           properties:
 *                             firstName:
 *                               type: string
 *                             lastName:
 *                               type: string
 *                             email:
 *                               type: string
 *                               format: email
 *                             headline:
 *                               type: string
 *                             location:
 *                               type: string
 *                         skills:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               level:
 *                                 type: string
 *                                 enum: [Beginner, Intermediate, Advanced, Expert]
 *                               yearsOfExperience:
 *                                 type: number
 *                         languages:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               proficiency:
 *                                 type: string
 *                                 enum: [Basic, Conversational, Fluent, Native]
 *                         workExperience:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               company:
 *                                 type: string
 *                               role:
 *                                 type: string
 *                               startDate:
 *                                 type: string
 *                               endDate:
 *                                 type: string
 *                               description:
 *                                 type: string
 *                               technologies:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               isCurrent:
 *                                 type: boolean
 *                         education:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               institution:
 *                                 type: string
 *                               degree:
 *                                 type: string
 *                               fieldOfStudy:
 *                                 type: string
 *                               startYear:
 *                                 type: number
 *                               endYear:
 *                                 type: number
 *                         certifications:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               issuer:
 *                                 type: string
 *                               issueDate:
 *                                 type: string
 *                         projects:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               description:
 *                                 type: string
 *                               technologies:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               role:
 *                                 type: string
 *                               link:
 *                                 type: string
 *                               startDate:
 *                                 type: string
 *                               endDate:
 *                                 type: string
 *                         socialLinks:
 *                           type: object
 *                           properties:
 *                             linkedin:
 *                               type: string
 *                             github:
 *                               type: string
 *                             portfolio:
 *                               type: string
 *                         availability:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               enum: [Available, Open to Opportunities, Not Available]
 *                             type:
 *                               type: string
 *                               enum: [Full-time, Part-time, Contract]
 *                             startDate:
 *                               type: string
 *                     savedApplicant:
 *                       type: object
 *                       description: Persisted document in applicants collection including applicantProfile object as extracted
 *       400:
 *         description: Missing required fields or invalid file/id values
 *       422:
 *         description: PDF contains no readable text
 *       500:
 *         description: Failed to parse the PDF
 */
