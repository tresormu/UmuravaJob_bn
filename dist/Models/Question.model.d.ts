import mongoose, { Document } from "mongoose";
export type QuestionType = "text" | "single_choice" | "multi_choice" | "number" | "date" | "boolean";
export interface IQuestion extends Document {
    jobId: mongoose.Types.ObjectId;
    prompt: string;
    type: QuestionType;
    required: boolean;
    options?: string[];
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IQuestion, {}, {}, {}, mongoose.Document<unknown, {}, IQuestion, {}, mongoose.DefaultSchemaOptions> & IQuestion & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IQuestion>;
export default _default;
//# sourceMappingURL=Question.model.d.ts.map