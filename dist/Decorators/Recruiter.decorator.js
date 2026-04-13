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
 * /api/recruiters/auth/login:
 *   post:
 *     summary: Login recruiter
 *     tags: [Recruiters]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Failed to login
 */
/**
 * @openapi
 * /api/recruiters/auth/refresh:
 *   post:
 *     summary: Refresh recruiter access token
 *     tags: [Recruiters]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed
 *       400:
 *         description: Refresh token is required
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Failed to refresh token
 */
/**
 * @openapi
 * /api/recruiters/auth/logout:
 *   post:
 *     summary: Logout recruiter
 *     tags: [Recruiters]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: Refresh token is required
 *       500:
 *         description: Failed to logout
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
 *         description: Recruiter created successfully. Verification code email sent.
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
 *         description: Recruiter deleted successfully. Deletion confirmation email sent.
 *       404:
 *         description: Recruiter not found
 *       500:
 *         description: Failed to delete recruiter
 */
/**
 * @openapi
 * /api/recruiters/auth/verify-email:
 *   post:
 *     summary: Verify recruiter email
 *     tags: [Recruiters]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired verification code
 *       404:
 *         description: Recruiter not found
 *       500:
 *         description: Failed to verify email
 */
/**
 * @openapi
 * /api/recruiters/auth/resend-verification:
 *   post:
 *     summary: Resend recruiter verification code
 *     tags: [Recruiters]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification code resent
 *       404:
 *         description: Recruiter not found
 *       500:
 *         description: Failed to resend verification code
 */
//# sourceMappingURL=Recruiter.decorator.js.map