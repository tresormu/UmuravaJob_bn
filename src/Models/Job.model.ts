import mongoose, { Schema, Document } from "mongoose";

// Interface (TypeScript)
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

// Schema
const JobSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Model
export default mongoose.model<IJob>("Job", JobSchema);