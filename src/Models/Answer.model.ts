import mongoose, { Schema, Document } from "mongoose";

export interface IAnswer extends Document {
  applicationId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  value: unknown;
  valueText?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema: Schema = new Schema(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },
    value: { type: Schema.Types.Mixed, required: true },
    valueText: { type: String },
  },
  { timestamps: true },
);

AnswerSchema.index({ applicationId: 1, questionId: 1 }, { unique: true });

export default mongoose.model<IAnswer>("Answer", AnswerSchema);
