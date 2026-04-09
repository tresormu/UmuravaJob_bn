import type { ApplicantAttrs, ApplicantDocument, ApplicantStatus, ApplicantSource } from "../Models/Applicant.model.js";
import { Types } from "mongoose";

export function createMockApplicant(partial: Partial<ApplicantAttrs> = {}): ApplicantDocument {
  const defaultAttrs: ApplicantAttrs = {
    jobId: new Types.ObjectId(),
    recruiterId: new Types.ObjectId(),
    fullName: "Mock Applicant",
    status: "applied" as ApplicantStatus,
    source: "manual" as ApplicantSource,
    isParsed: false,
    isDuplicate: false,
  };

  const attrs = { ...defaultAttrs, ...partial } as ApplicantAttrs;

  // Mock essential Document methods to satisfy HydratedDocument
  (attrs as any).save = () => Promise.resolve(attrs as any);
  (attrs as any).populate = () => Promise.resolve(attrs as any);
  (attrs as any).toObject = () => attrs as any;
  (attrs as any).toJSON = () => attrs as any;

  return attrs as ApplicantDocument;
}
