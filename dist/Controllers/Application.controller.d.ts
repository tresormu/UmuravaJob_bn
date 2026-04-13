import type { Response } from "express";
import type { AuthRequest } from "../types/type.js";
declare class ApplicantsController {
    private static addIfDefined;
    static GetApplicants(req: AuthRequest, res: Response): Promise<void>;
    static GetApplicantById(req: AuthRequest, res: Response): Promise<void>;
    static CreateApplicant(req: AuthRequest, res: Response): Promise<void>;
    static UpdateApplicant(req: AuthRequest, res: Response): Promise<void>;
    static DeleteApplicant(req: AuthRequest, res: Response): Promise<void>;
}
export default ApplicantsController;
//# sourceMappingURL=Application.controller.d.ts.map