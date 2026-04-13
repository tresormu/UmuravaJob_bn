import { jest } from "@jest/globals";
import { Types } from "mongoose";
const mockJob = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
};
["create", "find", "findById", "findByIdAndUpdate", "findByIdAndDelete"].forEach((method) => {
    mockJob[method].mockImplementation(async () => null);
});
jest.unstable_mockModule("../Models/Job.model.js", () => ({
    __esModule: true,
    default: mockJob,
}));
const mockSendJobPostedEmail = jest.fn();
jest.unstable_mockModule("../utils/email.js", () => ({
    __esModule: true,
    sendJobPostedEmail: mockSendJobPostedEmail,
}));
let JobController;
beforeAll(async () => {
    ({ default: JobController } = await import("../Controllers/Job.controller.js"));
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
describe("JobController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSendJobPostedEmail.mockImplementation(async () => ({}));
        ["create", "find", "findById", "findByIdAndUpdate", "findByIdAndDelete"].forEach((method) => {
            mockJob[method].mockImplementation(async () => null);
        });
    });
    describe("createJob", () => {
        it("returns 401 when unauthenticated", async () => {
            const req = mockRequest({ user: undefined });
            const res = mockResponse();
            await JobController.createJob(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Unauthorized",
            });
            expect(mockJob.create).not.toHaveBeenCalled();
        });
        it("returns 403 when not recruiter", async () => {
            const req = mockRequest({ user: { id: MOCK_USER_ID, email: "t@t.com", role: "applicant" } });
            const res = mockResponse();
            await JobController.createJob(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Access denied",
            });
            expect(mockJob.create).not.toHaveBeenCalled();
        });
        it("creates job with recruiterId", async () => {
            const req = mockRequest({
                body: {
                    title: "Backend Dev",
                    description: "Build APIs",
                    skills: ["Node"],
                    experience: 3,
                    education: "BS",
                    location: "Remote",
                },
            });
            const res = mockResponse();
            const created = { _id: new Types.ObjectId(), ...req.body, recruiterId: MOCK_USER_ID };
            mockJob.create.mockResolvedValue(created);
            await JobController.createJob(req, res);
            expect(mockJob.create).toHaveBeenCalledWith(expect.objectContaining({
                title: "Backend Dev",
                skills: ["Node"],
                experience: 3,
                recruiterId: MOCK_USER_ID,
            }));
            expect(mockSendJobPostedEmail).toHaveBeenCalledWith("test@test.com", "Backend Dev");
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Job created successfully",
                data: created,
            });
        });
        it("handles create error", async () => {
            const req = mockRequest({ body: { title: "Backend Dev", skills: ["Node"], experience: 3 } });
            const res = mockResponse();
            mockJob.create.mockRejectedValue(new Error("Create error"));
            await JobController.createJob(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: "Error creating job" }));
        });
    });
    describe("getAllJobs", () => {
        it("returns jobs list", async () => {
            const jobs = [{ _id: new Types.ObjectId(), title: "Frontend Dev" }];
            const sort = jest.fn().mockResolvedValue(jobs);
            mockJob.find.mockReturnValue({ sort });
            const req = mockRequest();
            const res = mockResponse();
            await JobController.getAllJobs(req, res);
            expect(mockJob.find).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: jobs });
        });
        it("handles error", async () => {
            const sort = jest
                .fn()
                .mockRejectedValue(new Error("DB error"));
            mockJob.find.mockImplementation(() => ({ sort }));
            const req = mockRequest();
            const res = mockResponse();
            await JobController.getAllJobs(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: "Error fetching jobs" }));
        });
    });
    describe("getJobById", () => {
        it("returns 400 for invalid id", async () => {
            const req = mockRequest({ params: { id: "bad-id" } });
            const res = mockResponse();
            await JobController.getJobById(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Invalid job id",
            });
        });
        it("returns 404 if not found", async () => {
            const id = new Types.ObjectId().toString();
            mockJob.findById.mockResolvedValue(null);
            const req = mockRequest({ params: { id } });
            const res = mockResponse();
            await JobController.getJobById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Job not found",
            });
        });
        it("returns job", async () => {
            const id = new Types.ObjectId().toString();
            const job = { _id: id, title: "QA" };
            mockJob.findById.mockResolvedValue(job);
            const req = mockRequest({ params: { id } });
            const res = mockResponse();
            await JobController.getJobById(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: job });
        });
        it("handles error", async () => {
            const id = new Types.ObjectId().toString();
            mockJob.findById.mockRejectedValue(new Error("DB error"));
            const req = mockRequest({ params: { id } });
            const res = mockResponse();
            await JobController.getJobById(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: "Error fetching job" }));
        });
    });
    describe("updateJob", () => {
        it("returns 401 when unauthenticated", async () => {
            const req = mockRequest({ user: undefined, params: { id: new Types.ObjectId().toString() } });
            const res = mockResponse();
            await JobController.updateJob(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Unauthorized",
            });
        });
        it("returns 403 when not recruiter", async () => {
            const req = mockRequest({
                user: { id: MOCK_USER_ID, email: "t@t.com", role: "applicant" },
                params: { id: new Types.ObjectId().toString() },
            });
            const res = mockResponse();
            await JobController.updateJob(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Access denied",
            });
        });
        it("returns 400 for invalid id", async () => {
            const req = mockRequest({ params: { id: "bad-id" } });
            const res = mockResponse();
            await JobController.updateJob(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Invalid job id",
            });
        });
        it("returns 404 if not found", async () => {
            const id = new Types.ObjectId().toString();
            mockJob.findById.mockResolvedValue(null);
            const req = mockRequest({ params: { id } });
            const res = mockResponse();
            await JobController.updateJob(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Job not found",
            });
        });
        it("returns 403 if not owner", async () => {
            const id = new Types.ObjectId().toString();
            mockJob.findById.mockResolvedValue({ _id: id, recruiterId: new Types.ObjectId().toString() });
            const req = mockRequest({ params: { id } });
            const res = mockResponse();
            await JobController.updateJob(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Access denied",
            });
        });
        it("updates job and strips recruiterId from payload", async () => {
            const id = new Types.ObjectId().toString();
            mockJob.findById.mockResolvedValue({ _id: id, recruiterId: MOCK_USER_ID });
            const req = mockRequest({
                params: { id },
                body: { title: "New Title", recruiterId: "hijack" },
            });
            const res = mockResponse();
            const updated = { _id: id, title: "New Title" };
            mockJob.findByIdAndUpdate.mockResolvedValue(updated);
            await JobController.updateJob(req, res);
            expect(mockJob.findByIdAndUpdate).toHaveBeenCalledWith(id, { title: "New Title" }, { new: true, runValidators: true });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Job updated successfully",
                data: updated,
            });
        });
        it("handles update error", async () => {
            const id = new Types.ObjectId().toString();
            mockJob.findById.mockResolvedValue({ _id: id, recruiterId: MOCK_USER_ID });
            mockJob.findByIdAndUpdate.mockRejectedValue(new Error("Update error"));
            const req = mockRequest({ params: { id }, body: { title: "X" } });
            const res = mockResponse();
            await JobController.updateJob(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: "Error updating job" }));
        });
    });
    describe("deleteJob", () => {
        it("returns 401 when unauthenticated", async () => {
            const req = mockRequest({ user: undefined, params: { id: new Types.ObjectId().toString() } });
            const res = mockResponse();
            await JobController.deleteJob(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Unauthorized",
            });
        });
        it("returns 403 when not recruiter", async () => {
            const req = mockRequest({
                user: { id: MOCK_USER_ID, email: "t@t.com", role: "applicant" },
                params: { id: new Types.ObjectId().toString() },
            });
            const res = mockResponse();
            await JobController.deleteJob(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Access denied",
            });
        });
        it("returns 400 for invalid id", async () => {
            const req = mockRequest({ params: { id: "bad-id" } });
            const res = mockResponse();
            await JobController.deleteJob(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Invalid job id",
            });
        });
        it("returns 404 if not found", async () => {
            const id = new Types.ObjectId().toString();
            mockJob.findById.mockResolvedValue(null);
            const req = mockRequest({ params: { id } });
            const res = mockResponse();
            await JobController.deleteJob(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Job not found",
            });
        });
        it("returns 403 if not owner", async () => {
            const id = new Types.ObjectId().toString();
            mockJob.findById.mockResolvedValue({ _id: id, recruiterId: new Types.ObjectId().toString() });
            const req = mockRequest({ params: { id } });
            const res = mockResponse();
            await JobController.deleteJob(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Access denied",
            });
        });
        it("deletes job", async () => {
            const id = new Types.ObjectId().toString();
            mockJob.findById.mockResolvedValue({ _id: id, recruiterId: MOCK_USER_ID });
            mockJob.findByIdAndDelete.mockResolvedValue({ _id: id });
            const req = mockRequest({ params: { id } });
            const res = mockResponse();
            await JobController.deleteJob(req, res);
            expect(mockJob.findByIdAndDelete).toHaveBeenCalledWith(id);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Job deleted successfully",
            });
        });
        it("handles delete error", async () => {
            const id = new Types.ObjectId().toString();
            mockJob.findById.mockResolvedValue({ _id: id, recruiterId: MOCK_USER_ID });
            mockJob.findByIdAndDelete.mockRejectedValue(new Error("Delete error"));
            const req = mockRequest({ params: { id } });
            const res = mockResponse();
            await JobController.deleteJob(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: "Error deleting job" }));
        });
    });
});
//# sourceMappingURL=Job.test.js.map