import mongoose, { Document } from "mongoose";
export interface IJob extends Document {
    title: string;
    description?: string;
    skills: string[];
    experience: number;
    education?: string;
    location?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IJob, {}, {}, {}, mongoose.Document<unknown, {}, IJob, {}, mongoose.DefaultSchemaOptions> & IJob & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IJob>;
export default _default;
//# sourceMappingURL=Job.model.d.ts.map