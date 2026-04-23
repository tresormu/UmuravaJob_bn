import ApplicantsController from "../Controllers/Application.controller.js";
import express from "express";
import multer from "multer";
import { protect } from "../Middlewares/Auth.Middleware.js";
import { authorizeRoles } from "../Middlewares/authorize.js";
import ApplicantScreeningController from "../Controllers/ApplicantScreening.controller.js";
import ApplicantRankingController from "../Controllers/ApplicantRanking.controller.js";

const router = express.Router();
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 },
	fileFilter: (_req, file, cb) => {
		if (file.mimetype !== "application/pdf") {
			cb(new Error("Only PDF files are allowed"));
			return;
		}
		cb(null, true);
	},
});

router.get("/", protect, authorizeRoles("recruiter"), (req, res) => ApplicantsController.GetApplicants(req, res));
router.get("/:id", protect, authorizeRoles("recruiter"), (req, res) => ApplicantsController.GetApplicantById(req, res));
router.post("/", protect, authorizeRoles("recruiter"), (req, res) => ApplicantsController.CreateApplicant(req, res));
router.get(
	"/applicant-screening/schema",
	(req, res) => ApplicantScreeningController.getApplicantScreeningSchema(req, res),
);
router.post(
	"/applicant-screening/pdf",
	protect,
	authorizeRoles("recruiter"),
	upload.array("files", 20),
	(req, res) => ApplicantScreeningController.parseApplicantScreeningPdf(req, res),
);
router.get(
	"/applicant-screening/rank",
	protect,
	authorizeRoles("recruiter"),
	(req, res) => ApplicantRankingController.rankApplicantsForJob(req, res),
);
router.patch("/:id", protect, authorizeRoles("recruiter"), (req, res) => ApplicantsController.UpdateApplicant(req, res));
router.delete("/:id", protect, authorizeRoles("recruiter"), (req, res) => ApplicantsController.DeleteApplicant(req, res));

export default router;
