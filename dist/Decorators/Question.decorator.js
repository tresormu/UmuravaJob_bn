/**
 * @openapi
 * tags:
 *   name: Questions
 *   description: Job application questions
 */
export {};
/**
 * @openapi
 * /api/jobs/{jobId}/questions:
 *   get:
 *     summary: List questions for a job
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Questions fetched successfully
 *       400:
 *         description: Invalid jobId
 *       500:
 *         description: Failed to fetch questions
 */
/**
 * @openapi
 * /api/jobs/{jobId}/questions:
 *   post:
 *     summary: Create a question for a job
 *     tags: [Questions]
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
 *             required: [prompt]
 *             properties:
 *               prompt:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [text, single_choice, multi_choice, number, date, boolean]
 *               required:
 *                 type: boolean
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Question created successfully
 *       400:
 *         description: Invalid request payload
 *       403:
 *         description: Access denied
 *       404:
 *         description: Job not found
 *       500:
 *         description: Failed to create question
 */
/**
 * @openapi
 * /api/questions/{id}:
 *   patch:
 *     summary: Update a question
 *     tags: [Questions]
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
 *               prompt:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [text, single_choice, multi_choice, number, date, boolean]
 *               required:
 *                 type: boolean
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       400:
 *         description: Invalid question id
 *       403:
 *         description: Access denied
 *       404:
 *         description: Question not found
 *       500:
 *         description: Failed to update question
 */
/**
 * @openapi
 * /api/questions/{id}:
 *   delete:
 *     summary: Delete a question
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       400:
 *         description: Invalid question id
 *       403:
 *         description: Access denied
 *       404:
 *         description: Question not found
 *       500:
 *         description: Failed to delete question
 */
//# sourceMappingURL=Question.decorator.js.map