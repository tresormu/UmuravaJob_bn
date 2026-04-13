import mongoose, { Schema } from "mongoose";
const FileUploadSchema = new Schema({
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
}, { timestamps: true });
export default mongoose.model("FileUpload", FileUploadSchema);
//# sourceMappingURL=FileUpload.model.js.map