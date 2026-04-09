import { Schema, model } from "mongoose";
import type { HydratedDocument, Model, Types } from "mongoose";

export type ApplicantStatus = "applied" | "screened" | "shortlisted" | "rejected";
export type ApplicantSource = "umurava" | "csv" | "pdf" | "manual" | "api";

export interface StructuredProfile {
  skills?: string[];
  experience?: string[];
  education?: string[];
  certifications?: string[];
  projects?: string[];
}

export interface ParsedData {
  skills?: string[];
  experienceYears?: number;
  education?: string[];
  certifications?: string[];
  projects?: string[];
  jobTitles?: string[];
  companies?: string[];
}

export interface NormalizedScores {
  skillScore?: number;
  experienceScore?: number;
  educationScore?: number;
}

export interface ApplicantAttrs {
  jobId: Types.ObjectId;
  recruiterId: Types.ObjectId;
  fullName: string;
  email?: string;
  phone?: string;
  location?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  resumeText?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  structuredProfile?: StructuredProfile;
  parsedData?: ParsedData;
  normalized?: NormalizedScores;
  status: ApplicantStatus;
  source: ApplicantSource;
  sourceFileId?: Types.ObjectId;
  isDuplicate?: boolean;
  isParsed: boolean;
  parsedAt?: Date;
  recruiterNotes?: string;
  tags?: string[];
}

export type ApplicantDocument = HydratedDocument<ApplicantAttrs>;
export type ApplicantModel = Model<ApplicantAttrs>;

const StructuredProfileSchema = new Schema<StructuredProfile>(
  {
    skills: { type: [String], default: undefined },
    experience: { type: [String], default: undefined },
    education: { type: [String], default: undefined },
    certifications: { type: [String], default: undefined },
    projects: { type: [String], default: undefined },
  },
  { _id: false },
);

const ParsedDataSchema = new Schema<ParsedData>(
  {
    skills: { type: [String], default: undefined },
    experienceYears: { type: Number },
    education: { type: [String], default: undefined },
    certifications: { type: [String], default: undefined },
    projects: { type: [String], default: undefined },
    jobTitles: { type: [String], default: undefined },
    companies: { type: [String], default: undefined },
  },
  { _id: false },
);

const NormalizedScoresSchema = new Schema<NormalizedScores>(
  {
    skillScore: { type: Number, min: 0, max: 100 },
    experienceScore: { type: Number, min: 0, max: 100 },
    educationScore: { type: Number, min: 0, max: 100 },
  },
  { _id: false },
);

const ApplicantSchema = new Schema<ApplicantAttrs>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    recruiterId: { type: Schema.Types.ObjectId, ref: "Recruiter", required: true },
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
  },
  { timestamps: true },
);

ApplicantSchema.index({ jobId: 1, recruiterId: 1 });

export default model<ApplicantAttrs, ApplicantModel>("Applicant", ApplicantSchema);
