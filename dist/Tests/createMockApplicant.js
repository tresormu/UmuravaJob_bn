import { Types } from "mongoose";
export function createMockApplicant(partial = {}) {
    const defaultAttrs = {
        jobId: new Types.ObjectId(),
        recruiterId: new Types.ObjectId(),
        fullName: "Mock Applicant",
        status: "applied",
        source: "manual",
        isParsed: false,
        isDuplicate: false,
    };
    const attrs = { ...defaultAttrs, ...partial };
    // Mock essential Document methods to satisfy HydratedDocument
    attrs.save = () => Promise.resolve(attrs);
    attrs.populate = () => Promise.resolve(attrs);
    attrs.toObject = () => attrs;
    attrs.toJSON = () => attrs;
    return attrs;
}
//# sourceMappingURL=createMockApplicant.js.map