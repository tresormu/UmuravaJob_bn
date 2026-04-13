import mongoose, { Schema, Document } from "mongoose";
const QuestionSchema = new Schema({
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
}, { timestamps: true });
QuestionSchema.index({ jobId: 1, order: 1 });
export default mongoose.model("Question", QuestionSchema);
//# sourceMappingURL=Question.model.js.map