import RecruiterController from "../Controllers/Recruiter.controller.js";
import { Router } from "express";

const router = Router();

// CRUD Routes for Recruiters
router.get("/", RecruiterController.getRecruiter);
router.get("/:id", RecruiterController.getRecruiterById);
router.post("/", RecruiterController.createRecruiter);
router.patch("/:id", RecruiterController.updateRecruiter);
router.delete("/:id", RecruiterController.deleteRecruiter);

export default router;
