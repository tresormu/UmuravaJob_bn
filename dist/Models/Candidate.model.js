import mongoose, { Schema, Document } from "mongoose";
const CandidateSchema = new Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true, unique: true, sparse: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    resumeUrl: { type: String, trim: true },
    resumeFileName: { type: String, trim: true },
    resumeText: { type: String },
    linkedInUrl: { type: String, trim: true },
    portfolioUrl: { type: String, trim: true },
}, { timestamps: true });
export default mongoose.model("Candidate", CandidateSchema);
//# sourceMappingURL=Candidate.model.js.map