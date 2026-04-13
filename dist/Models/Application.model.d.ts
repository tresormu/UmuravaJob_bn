import mongoose, { Document } from "mongoose";
export type ApplicationStatus = "applied" | "screened" | "shortlisted" | "rejected";
export type ApplicationSource = "direct" | "excel" | "api" | "manual";
export interface IApplication extends Document {
    jobId: mongoose.Types.ObjectId;
    candidateId: mongoose.Types.ObjectId;
    recruiterId: mongoose.Types.ObjectId;
    status: ApplicationStatus;
    source: ApplicationSource;
    score?: number;
    scoreExplanation?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IApplication, {}, {}, {}, mongoose.Document<unknown, {}, IApplication, {}, mongoose.DefaultSchemaOptions> & IApplication & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IApplication>;
export default _default;
//# sourceMappingURL=Application.model.d.ts.map