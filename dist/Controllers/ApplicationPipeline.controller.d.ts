import type { Request, Response } from "express";
import type { AuthRequest } from "../types/type.js";
declare class ApplicationPipelineController {
    static createApplication(req: Request, res: Response): Promise<Response>;
    static listJobApplications(req: AuthRequest, res: Response): Promise<Response>;
    static updateStatus(req: AuthRequest, res: Response): Promise<Response>;
    static uploadExcel(_req: AuthRequest, res: Response): Promise<Response>;
}
export default ApplicationPipelineController;
//# sourceMappingURL=ApplicationPipeline.controller.d.ts.map