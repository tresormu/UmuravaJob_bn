import { Router } from "express";
import multer from "multer";
import { protect } from "../Middlewares/Auth.Middleware.js";
import { authorizeRoles } from "../Middlewares/authorize.js";
import ApplicationPipelineController from "../Controllers/ApplicationPipeline.controller.js";

const App = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

App.post(
  "/jobs/:jobId/applications",
  ApplicationPipelineController.createApplication,
);
App.post(
  "/jobs/:jobId/applications/upload",
  protect,
  authorizeRoles("recruiter"),
  upload.single("file"),
  ApplicationPipelineController.uploadExcel,
);
App.get(
  "/jobs/:jobId/applications",
  protect,
  authorizeRoles("recruiter"),
  ApplicationPipelineController.listJobApplications,
);
App.patch(
  "/applications/:id/status",
  protect,
  authorizeRoles("recruiter"),
  ApplicationPipelineController.updateStatus,
);

export default App;
