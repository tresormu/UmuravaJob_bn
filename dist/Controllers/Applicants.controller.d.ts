import type { Request, Response } from "express";
declare class ApplicantsController {
    static GetApplicants(req: Request, res: Response): Promise<void>;
    static GetApplicantById(req: Request, res: Response): Promise<void>;
    static CreateApplicant(req: Request, res: Response): Promise<void>;
    static UpdateApplicant(req: Request, res: Response): Promise<void>;
    static DeleteApplicant(req: Request, res: Response): Promise<void>;
}
export default ApplicantsController;
//# sourceMappingURL=Applicants.controller.d.ts.map