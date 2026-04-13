import mongoose, { Schema, Document } from "mongoose";

export type QuestionType =
  | "text"
  | "single_choice"
  | "multi_choice"
  | "number"
  | "date"
  | "boolean";

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

const QuestionSchema: Schema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    prompt: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["text", "single_choice", "multi_choice", "number", "date", "boolean"],
      required: true,
      default: "text",
    },
    required: { type: Boolean, default: false },
    options: { type: [String], default: undefined },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

QuestionSchema.index({ jobId: 1, order: 1 });

export default mongoose.model<IQuestion>("Question", QuestionSchema);
