import { Schema, model } from "mongoose";
const StructuredProfileSchema = new Schema({
    skills: { type: [String], default: undefined },
    experience: { type: [String], default: undefined },
    education: { type: [String], default: undefined },
    certifications: { type: [String], default: undefined },
    projects: { type: [String], default: undefined },
}, { _id: false });
const ParsedDataSchema = new Schema({
    skills: { type: [String], default: undefined },
    experienceYears: { type: Number },
    education: { type: [String], default: undefined },
    certifications: { type: [String], default: undefined },
    projects: { type: [String], default: undefined },
    jobTitles: { type: [String], default: undefined },
    companies: { type: [String], default: undefined },
}, { _id: false });
const NormalizedScoresSchema = new Schema({
    skillScore: { type: Number, min: 0, max: 100 },
    experienceScore: { type: Number, min: 0, max: 100 },
    educationScore: { type: Number, min: 0, max: 100 },
}, { _id: false });
const ApplicantSchema = new Schema({
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    recruiterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    resumeUrl: { type: String, trim: true },
    resumeFileName: { type: String, trim: true },
    resumeText: { type: String },
    linkedInUrl: { type: String, trim: true },
    portfolioUrl: { type: String, trim: true },
    structuredProfile: { type: StructuredProfileSchema, default: undefined },
    parsedData: { type: ParsedDataSchema, default: undefined },
    normalized: { type: NormalizedScoresSchema, default: undefined },
    status: {
        type: String,
        enum: ["applied", "screened", "shortlisted", "rejected"],
        required: true,
        default: "applied",
    },
    source: {
        type: String,
        enum: ["umurava", "csv", "pdf", "manual", "api"],
        required: true,
    },
    sourceFileId: { type: Schema.Types.ObjectId, ref: "FileUpload" },
    isDuplicate: { type: Boolean, default: false },
    isParsed: { type: Boolean, required: true, default: false },
    parsedAt: { type: Date },
    recruiterNotes: { type: String },
    tags: { type: [String], default: undefined },
}, { timestamps: true });
ApplicantSchema.index({ jobId: 1, recruiterId: 1 });
export default model("Applicant", ApplicantSchema);
//# sourceMappingURL=Applicant.model.js.map