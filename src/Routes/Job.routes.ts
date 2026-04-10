import express from "express";
import JobController from "../Controllers/Job.controller.js";
import { protect } from "../Middlewares/Auth.Middleware.js";
import { authorizeRoles } from "../Middlewares/authorize.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("recruiter"), JobController.createJob);
router.get("/", JobController.getAllJobs);
router.get("/:id", JobController.getJobById);
router.put("/:id", protect, authorizeRoles("recruiter"), JobController.updateJob);
router.delete("/:id", protect, authorizeRoles("recruiter"), JobController.deleteJob);

export default router;
