import ApplicantsController from "../Controllers/Application.controller.js";
import { Router } from "express";
import multer from "multer";
import { protect } from "../Middlewares/Auth.Middleware.js";
import { authorizeRoles } from "../Middlewares/authorize.js";
import ApplicantScreeningController from "../Controllers/Apllicants.controller.js";

const App = Router();
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

App.get("/", protect, authorizeRoles("recruiter"), ApplicantsController.GetApplicants);
App.get("/:id", protect, authorizeRoles("recruiter"), ApplicantsController.GetApplicantById);
App.post("/", protect, authorizeRoles("recruiter"), ApplicantsController.CreateApplicant);
App.get(
	"/applicant-screening/schema",
	ApplicantScreeningController.getApplicantScreeningSchema,
);
App.post(
	"/applicant-screening/pdf",
	upload.array("files", 20),
	ApplicantScreeningController.parseApplicantScreeningPdf,
);
App.patch("/:id", protect, authorizeRoles("recruiter"), ApplicantsController.UpdateApplicant);
App.delete("/:id", protect, authorizeRoles("recruiter"), ApplicantsController.DeleteApplicant);

export default App;
