import { jest } from "@jest/globals";
import { createMockApplicant } from "./createMockApplicant.js";
import type { Request, Response } from "express";
import type {
  ApplicantDocument,
  ApplicantStatus,
  ApplicantSource,
} from "../Models/Applicant.model.js";
import { Types } from "mongoose";

const mockApplicant: any = {
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
};

['find', 'findById', 'findOne', 'create', 'findByIdAndUpdate', 'findByIdAndDelete', 'findOneAndUpdate', 'findOneAndDelete'].forEach(method => {
  mockApplicant[method].mockImplementation(async () => null);
});

jest.unstable_mockModule("../Models/Applicant.model.js", () => ({
  __esModule: true,
  default: mockApplicant,
}));

let ApplicantsController: typeof import("../Controllers/Applicants.controller.js").default;

beforeAll(async () => {
  ({ default: ApplicantsController } = await import(
    "../Controllers/Applicants.controller.js"
  ));
});

const MOCK_USER_ID = new Types.ObjectId().toString();

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockRequest = (overrides: Partial<Request> = {}): Request => ({
  params: {},
  body: {},
  user: { id: MOCK_USER_ID, email: "test@test.com", role: "recruiter" },
  ...overrides,
} as any);

describe("ApplicantsController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ['find', 'findById', 'findOne', 'create', 'findByIdAndUpdate', 'findByIdAndDelete', 'findOneAndUpdate', 'findOneAndDelete'].forEach(method => {
      mockApplicant[method].mockImplementation(async () => null);
    });
  });

  describe("GetApplicants", () => {
    it("returns applicants list", async () => {
      const applicants = [{
        _id: new Types.ObjectId(),
        jobId: new Types.ObjectId(),
        recruiterId: new Types.ObjectId(),
        fullName: "Jane Doe",
        status: "applied" as ApplicantStatus,
        source: "manual" as ApplicantSource,
        isParsed: false,
        isDuplicate: false,
      }] as ApplicantDocument[];
      mockApplicant.find.mockResolvedValueOnce(applicants);

      const req = mockRequest();
      const res = mockResponse();

      await ApplicantsController.GetApplicants(req, res);

      expect(mockApplicant.find).toHaveBeenCalledWith({
        recruiterId: MOCK_USER_ID,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ applicants });
    });

    it("handles error", async () => {
      const error = new Error("DB error");
      mockApplicant.find.mockRejectedValueOnce(error);

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
      (applicant as any)._id = new Types.ObjectId(mockId);

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
        status: "applied" as ApplicantStatus,
        source: "manual" as ApplicantSource,
        isParsed: false,
        isDuplicate: false,
      });
      mockApplicant.create.mockResolvedValue(
        createMockApplicant({
          jobId: jobIdObj,
          recruiterId: recruiterIdObj,
          fullName: "Jane Doe",
          email: "jane@example.com",
          status: "applied" as ApplicantStatus,
          source: "manual" as ApplicantSource,
          isParsed: false,
          isDuplicate: true,
        }),
      );

      await ApplicantsController.CreateApplicant(req, res);

      expect(mockApplicant.findOne).toHaveBeenCalledWith({ email: "jane@example.com" });
      expect(mockApplicant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          jobId,
          recruiterId: MOCK_USER_ID,
          isDuplicate: true,
        }),
      );
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

      mockApplicant.create.mockResolvedValue(
        createMockApplicant({ jobId: new Types.ObjectId(), isDuplicate: false }),
      );

      await ApplicantsController.CreateApplicant(req, res);

      expect(mockApplicant.findOne).not.toHaveBeenCalled();
      expect(mockApplicant.create).toHaveBeenCalledWith(
        expect.objectContaining({ isDuplicate: false, recruiterId: MOCK_USER_ID }),
      );
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
        body: { status: "reviewed" }
      });
      const res = mockResponse();
      const updated = createMockApplicant({ status: "reviewed" as ApplicantStatus });
      (updated as any)._id = new Types.ObjectId(updateId);
      mockApplicant.findById.mockResolvedValue({
        _id: updateId,
        recruiterId: MOCK_USER_ID,
      });
      mockApplicant.findOneAndUpdate.mockResolvedValue(updated);

      await ApplicantsController.UpdateApplicant(req, res);

      expect(mockApplicant.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: updateId, recruiterId: MOCK_USER_ID },
        { $set: { status: "reviewed" } },
        { new: true, runValidators: true }
      );
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
