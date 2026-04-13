import { jest } from "@jest/globals";
import { createMockApplicant } from "./createMockApplicant.js";
import mongoose, { Types } from "mongoose";
const mockApplicant = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
};
['find', 'countDocuments', 'findById', 'findOne', 'create', 'findByIdAndUpdate', 'findByIdAndDelete', 'findOneAndUpdate', 'findOneAndDelete'].forEach(method => {
    mockApplicant[method].mockImplementation(async () => null);
});
jest.unstable_mockModule("../Models/Applicant.model.js", () => ({
    __esModule: true,
    default: mockApplicant,
}));
const mockJob = {
    findById: jest.fn(),
};
const mockCandidate = {
    findOne: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
};
const mockApplication = {
    findOne: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
};
jest.unstable_mockModule("../Models/Job.model.js", () => ({
    __esModule: true,
    default: mockJob,
}));
jest.unstable_mockModule("../Models/Candidate.model.js", () => ({
    __esModule: true,
    default: mockCandidate,
}));
jest.unstable_mockModule("../Models/Application.model.js", () => ({
    __esModule: true,
    default: mockApplication,
}));
let ApplicantsController;
beforeAll(async () => {
    ({ default: ApplicantsController } = await import("../Controllers/Application.controller.js"));
});
const MOCK_USER_ID = new Types.ObjectId().toString();
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
const mockRequest = (overrides = {}) => ({
    params: {},
    body: {},
    user: { id: MOCK_USER_ID, email: "test@test.com", role: "recruiter" },
    ...overrides,
});
describe("ApplicantsController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        ['find', 'countDocuments', 'findById', 'findOne', 'create', 'findByIdAndUpdate', 'findByIdAndDelete', 'findOneAndUpdate', 'findOneAndDelete'].forEach(method => {
            mockApplicant[method].mockImplementation(async () => null);
        });
        mockApplicant.countDocuments.mockResolvedValue(1);
        mockJob.findById.mockResolvedValue({ _id: new Types.ObjectId(), recruiterId: MOCK_USER_ID });
        mockCandidate.findOne.mockReturnValue({
            session: jest.fn().mockResolvedValue(null),
        });
        mockCandidate.create.mockResolvedValue([{ _id: new Types.ObjectId() }]);
        mockApplication.findOne.mockReturnValue({
            session: jest.fn().mockResolvedValue(null),
        });
        mockApplication.create.mockResolvedValue([{ _id: new Types.ObjectId() }]);
        jest.spyOn(mongoose, "startSession").mockResolvedValue({
            withTransaction: async (fn) => {
                await fn();
            },
            endSession: jest.fn(),
        });
    });
    describe("GetApplicants", () => {
        it("returns applicants list", async () => {
            const applicants = [{
                    _id: new Types.ObjectId(),
                    jobId: new Types.ObjectId(),
                    recruiterId: new Types.ObjectId(),
                    fullName: "Jane Doe",
                    status: "applied",
                    source: "manual",
                    isParsed: false,
                    isDuplicate: false,
                }];
            const limit = jest.fn().mockResolvedValue(applicants);
            const skip = jest.fn().mockReturnValue({ limit });
            const sort = jest.fn().mockReturnValue({ skip });
            mockApplicant.find.mockReturnValue({ sort });
            const req = mockRequest();
            const res = mockResponse();
            await ApplicantsController.GetApplicants(req, res);
            expect(mockApplicant.find).toHaveBeenCalledWith({
                recruiterId: MOCK_USER_ID,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                applicants,
                pagination: { page: 1, limit: 20, total: 1 },
            });
        });
        it("handles error", async () => {
            const error = new Error("DB error");
            mockApplicant.countDocuments.mockRejectedValueOnce(error);
            const req = mockRequest();
            const res = mockResponse();
            await ApplicantsController.GetApplicants(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Failed to fetch applicants" });
        });
    });
    describe("GetApplicantById", () => {
        it("returns applicant by id", async () => {
            const mockId = new Types.ObjectId().toString();
            const applicant = createMockApplicant({ fullName: "John Smith" });
            applicant._id = new Types.ObjectId(mockId);
            mockApplicant.findOne.mockResolvedValueOnce(applicant);
            const req = mockRequest({ params: { id: mockId } });
            const res = mockResponse();
            await ApplicantsController.GetApplicantById(req, res);
            expect(mockApplicant.findOne).toHaveBeenCalledWith({
                _id: mockId,
                recruiterId: MOCK_USER_ID,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ applicant });
        });
        it("returns 404 if not found", async () => {
            const mockId = new Types.ObjectId().toString();
            mockApplicant.findOne.mockResolvedValueOnce(null);
            const req = mockRequest({ params: { id: mockId } });
            const res = mockResponse();
            await ApplicantsController.GetApplicantById(req, res);
            expect(mockApplicant.findOne).toHaveBeenCalledWith({
                _id: mockId,
                recruiterId: MOCK_USER_ID,
            });
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Applicant not found" });
        });
        it("handles error", async () => {
            const mockId = new Types.ObjectId().toString();
            const error = new Error("DB error");
            mockApplicant.findOne.mockRejectedValueOnce(error);
            const req = mockRequest({ params: { id: mockId } });
            const res = mockResponse();
            await ApplicantsController.GetApplicantById(req, res);
            expect(mockApplicant.findOne).toHaveBeenCalledWith({
                _id: mockId,
                recruiterId: MOCK_USER_ID,
            });
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Failed to fetch applicant" });
        });
    });
    describe("CreateApplicant", () => {
        it("flags duplicates but allows creation", async () => {
            const jobId = new Types.ObjectId().toString();
            const jobIdObj = new Types.ObjectId();
            const recruiterIdObj = new Types.ObjectId();
            const req = mockRequest({
                body: {
                    jobId,
                    fullName: "Jane Doe",
                    email: "jane@example.com",
                    source: "manual",
                },
            });
            const res = mockResponse();
            mockApplicant.findOne.mockResolvedValue({
                _id: new Types.ObjectId(),
                jobId: new Types.ObjectId(),
                recruiterId: new Types.ObjectId(),
                fullName: "Existing Doe",
                status: "applied",
                source: "manual",
                isParsed: false,
                isDuplicate: false,
            });
            mockApplicant.create.mockResolvedValue([
                createMockApplicant({
                    jobId: jobIdObj,
                    recruiterId: recruiterIdObj,
                    fullName: "Jane Doe",
                    email: "jane@example.com",
                    status: "applied",
                    source: "manual",
                    isParsed: false,
                    isDuplicate: true,
                }),
            ]);
            await ApplicantsController.CreateApplicant(req, res);
            expect(mockApplicant.findOne).toHaveBeenCalledWith({ email: "jane@example.com" });
            expect(mockApplicant.create).toHaveBeenCalledWith([
                expect.objectContaining({
                    jobId,
                    recruiterId: MOCK_USER_ID,
                    isDuplicate: true,
                }),
            ], expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ applicant: expect.any(Object) });
        });
        it("returns 400 for missing required fields", async () => {
            const req = mockRequest({
                body: { fullName: "Jane Doe" }, // missing jobId etc.
            });
            const res = mockResponse();
            await ApplicantsController.CreateApplicant(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "jobId, fullName, and source are required",
            });
            expect(mockApplicant.findOne).not.toHaveBeenCalled();
            expect(mockApplicant.create).not.toHaveBeenCalled();
        });
        it("creates without duplicate (no email)", async () => {
            const jobId = new Types.ObjectId().toString();
            const req = mockRequest({
                body: {
                    jobId,
                    fullName: "No Email Doe",
                    source: "manual",
                },
            });
            const res = mockResponse();
            mockApplicant.create.mockResolvedValue([createMockApplicant({ jobId: new Types.ObjectId(), isDuplicate: false })]);
            await ApplicantsController.CreateApplicant(req, res);
            expect(mockApplicant.findOne).not.toHaveBeenCalled();
            expect(mockApplicant.create).toHaveBeenCalledWith([
                expect.objectContaining({ isDuplicate: false, recruiterId: MOCK_USER_ID }),
            ], expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(201);
        });
        it("handles create error", async () => {
            const jobId = new Types.ObjectId().toString();
            const req = mockRequest({
                body: {
                    jobId,
                    fullName: "Error Doe",
                    source: "manual",
                },
            });
            const res = mockResponse();
            mockApplicant.create.mockRejectedValue(new Error("Create error"));
            await ApplicantsController.CreateApplicant(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
    describe("UpdateApplicant", () => {
        it("updates applicant", async () => {
            const updateId = new Types.ObjectId().toString();
            const req = mockRequest({
                params: { id: updateId },
                body: { status: "screened" }
            });
            const res = mockResponse();
            const updated = createMockApplicant({ status: "screened" });
            updated._id = new Types.ObjectId(updateId);
            mockApplicant.findById.mockResolvedValue({
                _id: updateId,
                recruiterId: MOCK_USER_ID,
            });
            mockApplicant.findOneAndUpdate.mockResolvedValue(updated);
            await ApplicantsController.UpdateApplicant(req, res);
            expect(mockApplicant.findOneAndUpdate).toHaveBeenCalledWith({ _id: updateId, recruiterId: MOCK_USER_ID }, { $set: { status: "reviewed" } }, { new: true, runValidators: true });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ applicant: updated });
        });
        it("returns 404 if not found", async () => {
            const req = mockRequest({ params: { id: new Types.ObjectId().toString() } });
            const res = mockResponse();
            mockApplicant.findById.mockResolvedValue(null);
            await ApplicantsController.UpdateApplicant(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
        it("handles update error", async () => {
            const req = mockRequest({ params: { id: new Types.ObjectId().toString() } });
            const res = mockResponse();
            mockApplicant.findById.mockResolvedValue({
                _id: req.params.id,
                recruiterId: MOCK_USER_ID,
            });
            mockApplicant.findOneAndUpdate.mockRejectedValue(new Error("Update error"));
            await ApplicantsController.UpdateApplicant(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
    describe("DeleteApplicant", () => {
        it("deletes applicant", async () => {
            const deleteId = new Types.ObjectId().toString();
            const req = mockRequest({ params: { id: deleteId } });
            const res = mockResponse();
            mockApplicant.findById.mockResolvedValue({
                _id: deleteId,
                recruiterId: MOCK_USER_ID,
            });
            mockApplicant.findOneAndDelete.mockResolvedValue({ _id: deleteId });
            await ApplicantsController.DeleteApplicant(req, res);
            expect(mockApplicant.findOneAndDelete).toHaveBeenCalledWith({
                _id: deleteId,
                recruiterId: MOCK_USER_ID,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Applicant deleted successfully" });
        });
        it("returns 404 if not found", async () => {
            const req = mockRequest({ params: { id: new Types.ObjectId().toString() } });
            const res = mockResponse();
            mockApplicant.findById.mockResolvedValue(null);
            await ApplicantsController.DeleteApplicant(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
        it("handles delete error", async () => {
            const req = mockRequest({ params: { id: new Types.ObjectId().toString() } });
            const res = mockResponse();
            mockApplicant.findById.mockResolvedValue({
                _id: req.params.id,
                recruiterId: MOCK_USER_ID,
            });
            mockApplicant.findOneAndDelete.mockRejectedValue(new Error("Delete error"));
            await ApplicantsController.DeleteApplicant(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
//# sourceMappingURL=Applicant.test.js.map