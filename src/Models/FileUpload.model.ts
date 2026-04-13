import mongoose, { Schema } from "mongoose";
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

const FileUploadSchema: Schema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    recruiterId: { type: Schema.Types.ObjectId, ref: "Recruiter", required: true },
    filename: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    rowCount: { type: Number, min: 0 },
    errorCount: { type: Number, min: 0 },
    errors: { type: [String], default: undefined },
  },
  { timestamps: true },
);

export default mongoose.model<IFileUpload>("FileUpload", FileUploadSchema);
