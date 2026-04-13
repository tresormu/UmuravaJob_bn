import { Router } from "express";
import { protect } from "../Middlewares/Auth.Middleware.js";
import { authorizeRoles } from "../Middlewares/authorize.js";
import QuestionController from "../Controllers/Question.controller.js";
const router = Router();
router.get("/jobs/:jobId/questions", QuestionController.listJobQuestions);
router.post("/jobs/:jobId/questions", protect, authorizeRoles("recruiter"), QuestionController.createQuestion);
router.patch("/questions/:id", protect, authorizeRoles("recruiter"), QuestionController.updateQuestion);
router.delete("/questions/:id", protect, authorizeRoles("recruiter"), QuestionController.deleteQuestion);
export default router;
//# sourceMappingURL=Question.route.js.map