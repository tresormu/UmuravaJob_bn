import ApplicantsController from "../Controllers/Applicants.controller.js";
import { Router } from "express";

const App = Router();

App.get("/", ApplicantsController.GetApplicants);
App.get("/:id", ApplicantsController.GetApplicantById);
App.post("/", ApplicantsController.CreateApplicant);
App.patch("/:id", ApplicantsController.UpdateApplicant);
App.delete("/:id", ApplicantsController.DeleteApplicant);

export default App;
