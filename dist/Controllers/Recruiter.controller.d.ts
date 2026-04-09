import type { Request, Response } from "express";
import type { AuthRequest } from "../types/type.js";
declare class RecruiterController {
    /**
     * Create a new recruiter
     */
    createRecruiter(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get all recruiters
     */
    getRecruiter(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get a recruiter by ID
     */
    getRecruiterById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Update a recruiter
     */
    updateRecruiter(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Delete a recruiter
     */
    deleteRecruiter(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Login recruiter
     */
    loginRecruiter(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Refresh access token
     */
    refreshRecruiterToken(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Logout recruiter
     */
    logoutRecruiter(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
declare const _default: RecruiterController;
export default _default;
//# sourceMappingURL=Recruiter.controller.d.ts.map