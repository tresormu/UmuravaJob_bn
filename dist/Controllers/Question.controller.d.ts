import type { Response } from "express";
import type { AuthRequest } from "../types/type.js";
declare class QuestionController {
    static createQuestion(req: AuthRequest, res: Response): Promise<Response>;
    static listJobQuestions(req: AuthRequest, res: Response): Promise<Response>;
    static updateQuestion(req: AuthRequest, res: Response): Promise<Response>;
    static deleteQuestion(req: AuthRequest, res: Response): Promise<Response>;
}
export default QuestionController;
//# sourceMappingURL=Question.controller.d.ts.map