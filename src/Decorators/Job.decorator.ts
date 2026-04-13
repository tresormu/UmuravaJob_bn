/**
 * @openapi
 * tags:
 *   name: Jobs
 *   description: Job posting management
 */

/**
 * @openapi
 * /api/job:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, skills, experience]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               experience:
 *                 type: number
 *                 minimum: 0
 *               education:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job created successfully. Posting confirmation email sent.
 *       500:
 *         description: Error creating job
 */

/**
 * @openapi
 * /api/job:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of jobs
 *       500:
 *         description: Error fetching jobs
 */

/**
 * @openapi
 * /api/job/{id}:
 *   get:
 *     summary: Get a job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job fetched successfully
 *       400:
 *         description: Invalid job id
 *       404:
 *         description: Job not found
 *       500:
 *         description: Error fetching job
 */

/**
 * @openapi
 * /api/job/{id}:
 *   put:
 *     summary: Update a job by ID
 *     tags: [Jobs]
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               experience:
 *                 type: number
 *                 minimum: 0
 *               education:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       400:
 *         description: Invalid job id
 *       404:
 *         description: Job not found
 *       500:
 *         description: Error updating job
 */

/**
 * @openapi
 * /api/job/{id}:
 *   delete:
 *     summary: Delete a job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       400:
 *         description: Invalid job id
 *       404:
 *         description: Job not found
 *       500:
 *         description: Error deleting job
 */
