import ApplicantsController from "../Controllers/Application.controller.js";
import { Router } from "express";
import { protect } from "../Middlewares/Auth.Middleware.js";
import { authorizeRoles } from "../Middlewares/authorize.js";

const App = Router();

App.get("/", protect, authorizeRoles("recruiter"), ApplicantsController.GetApplicants);
App.get("/:id", protect, authorizeRoles("recruiter"), ApplicantsController.GetApplicantById);
App.post("/", protect, authorizeRoles("recruiter"), ApplicantsController.CreateApplicant);
App.patch("/:id", protect, authorizeRoles("recruiter"), ApplicantsController.UpdateApplicant);
App.delete("/:id", protect, authorizeRoles("recruiter"), ApplicantsController.DeleteApplicant);

export default App;
