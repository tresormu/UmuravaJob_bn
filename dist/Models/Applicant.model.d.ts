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
    applicationId?: Types.ObjectId;
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
declare const _default: ApplicantModel;
export default _default;
//# sourceMappingURL=Applicant.model.d.ts.map