import mongoose, { Schema, Document } from "mongoose";
const AnswerSchema = new Schema({
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
}, { timestamps: true });
AnswerSchema.index({ applicationId: 1, questionId: 1 }, { unique: true });
export default mongoose.model("Answer", AnswerSchema);
//# sourceMappingURL=Answer.model.js.map