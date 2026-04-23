import mongoose, { Schema, Types } from "mongoose";
import type { HydratedDocument, Model } from "mongoose";

// Interface (TypeScript)
export interface JobAttrs {
  title: string;
  department?: string;
  employmentType?: string;
  description?: string;
  skills: string[];
  experience: number;
  education?: string;
  location?: string;
  recruiterId: Types.ObjectId;
  deadline?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type JobDocument = HydratedDocument<JobAttrs>;
export type JobModel = Model<JobAttrs>;

// Schema
const JobSchema: Schema = new Schema<JobAttrs>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      default: "General",
      trim: true,
    },

    employmentType: {
      type: String,
      default: "Full-time",
      trim: true,
    },

    description: {
      type: String,
    },

    skills: {
      type: [String],
      required: true,
    },

    experience: {
      type: Number,
      required: true,
      min: 0,
    },

    education: {
      type: String,
      default: "Not specified",
    },

    location: {
      type: String,
      default: "Remote",
    },
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Model
JobSchema.index({ recruiterId: 1 });

export default mongoose.model<JobAttrs, JobModel>("Job", JobSchema);
