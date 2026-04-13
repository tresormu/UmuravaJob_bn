import mongoose, { Schema, Document } from "mongoose";

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

const ApplicationSchema: Schema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },
    recruiterId: { type: Schema.Types.ObjectId, ref: "Recruiter", required: true },
    status: {
      type: String,
      enum: ["applied", "screened", "shortlisted", "rejected"],
      default: "applied",
    },
    source: {
      type: String,
      enum: ["direct", "excel", "api", "manual"],
      required: true,
      default: "direct",
    },
    score: { type: Number, min: 0, max: 100 },
    scoreExplanation: { type: String },
  },
  { timestamps: true },
);

ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
ApplicationSchema.index({ recruiterId: 1, jobId: 1, status: 1 });

export default mongoose.model<IApplication>("Application", ApplicationSchema);
