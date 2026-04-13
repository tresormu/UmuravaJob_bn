import mongoose from "mongoose";
import type { HydratedDocument } from "mongoose";
export type FileUploadStatus = "pending" | "processing" | "completed" | "failed";
export interface IFileUpload {
    jobId: mongoose.Types.ObjectId;
    recruiterId: mongoose.Types.ObjectId;
    filename: string;
    status: FileUploadStatus;
    rowCount?: number;
    errorCount?: number;
    errors?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export type FileUploadDocument = HydratedDocument<IFileUpload>;
declare const _default: mongoose.Model<IFileUpload, {}, {}, {}, mongoose.Document<unknown, {}, IFileUpload, {}, mongoose.DefaultSchemaOptions> & IFileUpload & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IFileUpload>;
export default _default;
//# sourceMappingURL=FileUpload.model.d.ts.map