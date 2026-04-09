import RecruiterController from "../Controllers/Recruiter.controller.js";
import { Router } from "express";
import { protect } from "../Middlewares/Auth.Middleware.js";

const router = Router();

// Auth Routes for Recruiters
router.post("/auth/login", RecruiterController.loginRecruiter);
router.post("/auth/refresh", RecruiterController.refreshRecruiterToken);
router.post("/auth/logout", RecruiterController.logoutRecruiter);

// CRUD Routes for Recruiters
router.get("/", RecruiterController.getRecruiter);
router.get("/:id", protect, RecruiterController.getRecruiterById);
router.post("/", protect, RecruiterController.createRecruiter);
router.patch("/:id", protect, RecruiterController.updateRecruiter);
router.delete("/:id", protect, RecruiterController.deleteRecruiter);

export default router;
