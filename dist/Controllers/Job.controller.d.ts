import type { Request, Response } from "express";
import type { AuthRequest } from "../types/type.js";
declare class JobController {
    /**
     * Create a new job
     */
    createJob(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get all jobs
     */
    getAllJobs(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get a job by ID
     */
    getJobById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Update a job
     */
    updateJob(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Delete a job
     */
    deleteJob(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
declare const _default: JobController;
export default _default;
//# sourceMappingURL=Job.controller.d.ts.map