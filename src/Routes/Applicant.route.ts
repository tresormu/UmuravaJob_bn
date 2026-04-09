import ApplicantsController from "../Controllers/Applicants.controller.js";
import { Router } from "express";
import { protect } from "../Middlewares/Auth.Middleware.js";
import { authorizeRoles } from "../Middlewares/authorize.js";

const App = Router();

App.get("/", protect, authorizeRoles("recruiter"), ApplicantsController.GetApplicants);
App.get("/:id", protect, authorizeRoles("recruiter"), ApplicantsController.GetApplicantById);
App.post("/", ApplicantsController.CreateApplicant);
App.patch("/:id", ApplicantsController.UpdateApplicant);
App.delete("/:id", ApplicantsController.DeleteApplicant);

export default App;
