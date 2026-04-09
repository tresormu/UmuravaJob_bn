/**
 * @openapi
 * tags:
 *   name: Recruiters
 *   description: Recruiter management and authentication
 */
export {};
/**
 * @openapi
 * /api/recruiters:
 *   get:
 *     summary: Get all recruiters
 *     tags: [Recruiters]
 *     responses:
 *       200:
 *         description: List of recruiters fetched successfully
 *       500:
 *         description: Failed to fetch recruiters
 */
/**
 * @openapi
 * /api/recruiters/{id}:
 *   get:
 *     summary: Get a recruiter by ID
 *     tags: [Recruiters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recruiter fetched successfully
 *       404:
 *         description: Recruiter not found
 *       500:
 *         description: Failed to fetch recruiter
 */
/**
 * @openapi
 * /api/recruiters:
 *   post:
 *     summary: Create a new recruiter
 *     tags: [Recruiters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [recruiter]
 *               companyName:
 *                 type: string
 *               companyWebsite:
 *                 type: string
 *               position:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       201:
 *         description: Recruiter created successfully
 *       500:
 *         description: Failed to create recruiter
 */
/**
 * @openapi
 * /api/recruiters/{id}:
 *   patch:
 *     summary: Update a recruiter
 *     tags: [Recruiters]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               companyName:
 *                 type: string
 *               companyWebsite:
 *                 type: string
 *               position:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recruiter updated successfully
 *       404:
 *         description: Recruiter not found
 *       500:
 *         description: Failed to update recruiter
 */
/**
 * @openapi
 * /api/recruiters/{id}:
 *   delete:
 *     summary: Delete a recruiter
 *     tags: [Recruiters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recruiter deleted successfully
 *       404:
 *         description: Recruiter not found
 *       500:
 *         description: Failed to delete recruiter
 */
//# sourceMappingURL=Recruiter.decorator.js.map