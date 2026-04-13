import mongoose, { Document } from "mongoose";
export interface ICandidate extends Document {
    fullName: string;
    email?: string;
    phone?: string;
    location?: string;
    resumeUrl?: string;
    resumeFileName?: string;
    resumeText?: string;
    linkedInUrl?: string;
    portfolioUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICandidate, {}, {}, {}, mongoose.Document<unknown, {}, ICandidate, {}, mongoose.DefaultSchemaOptions> & ICandidate & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICandidate>;
export default _default;
//# sourceMappingURL=Candidate.model.d.ts.map