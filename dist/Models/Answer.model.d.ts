import mongoose, { Document } from "mongoose";
export interface IAnswer extends Document {
    applicationId: mongoose.Types.ObjectId;
    questionId: mongoose.Types.ObjectId;
    value: unknown;
    valueText?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IAnswer, {}, {}, {}, mongoose.Document<unknown, {}, IAnswer, {}, mongoose.DefaultSchemaOptions> & IAnswer & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAnswer>;
export default _default;
//# sourceMappingURL=Answer.model.d.ts.map