import { jest } from "@jest/globals";
import type { Request, Response } from "express";
import { Types } from "mongoose";

// Setup mocks for Model and Hash utility
const mockRecruiter: any = {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
};

const mockHashMe = jest.fn() as jest.MockedFunction<(pass: string) => Promise<string>>;

// Mock dependencies before importing the controller
jest.unstable_mockModule("../Models/Recruiter.model.js", () => ({
    __esModule: true,
    default: mockRecruiter,
}));

jest.unstable_mockModule("../config/hash.config.js", () => ({
    __esModule: true,
    default: mockHashMe,
}));

let RecruiterController: typeof import("../Controllers/Recruiter.controller.js").default;

beforeAll(async () => {
    // Import the controller after mocks are established
    ({ default: RecruiterController } = await import("../Controllers/Recruiter.controller.js"));
});

const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
};

const mockRequest = (overrides: Partial<Request> = {}): Request => ({
    params: {},
    body: {},
    ...overrides,
} as Request);

describe("RecruiterController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockHashMe.mockImplementation(async (p) => `hashed_${p}`);
    });

    describe("createRecruiter", () => {
        it("should hash password and create recruiter", async () => {
            const body = {
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                password: "password123",
                companyName: "Umurava"
            };
            const req = mockRequest({ body });
            const res = mockResponse();

            mockRecruiter.create.mockResolvedValue({ ...body, password: "hashed_password123" });

            await RecruiterController.createRecruiter(req, res);

            expect(mockHashMe).toHaveBeenCalledWith("password123");
            expect(mockRecruiter.create).toHaveBeenCalledWith(expect.objectContaining({
                password: "hashed_password123"
            }));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it("should handle creation errors", async () => {
            const req = mockRequest({ body: { email: "error@test.com" } });
            const res = mockResponse();
            mockRecruiter.create.mockRejectedValue(new Error("DB Error"));

            await RecruiterController.createRecruiter(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
        });
    });

    describe("getRecruiter", () => {
        it("should fetch all recruiters", async () => {
            const recruiters = [{ firstName: "Admin" }];
            mockRecruiter.find.mockResolvedValue(recruiters);

            const req = mockRequest();
            const res = mockResponse();

            await RecruiterController.getRecruiter(req, res);

            expect(mockRecruiter.find).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ recruiter: recruiters }));
        });
    });

    describe("getRecruiterById", () => {
        it("should return a recruiter if found", async () => {
            const id = new Types.ObjectId().toString();
            const recruiter = { _id: id, firstName: "Test" };
            mockRecruiter.findById.mockResolvedValue(recruiter);

            const req = mockRequest({ params: { id } });
            const res = mockResponse();

            await RecruiterController.getRecruiterById(req, res);

            expect(mockRecruiter.findById).toHaveBeenCalledWith(id);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("should return 404 if not found", async () => {
            mockRecruiter.findById.mockResolvedValue(null);
            const req = mockRequest({ params: { id: "nonexistent" } });
            const res = mockResponse();

            await RecruiterController.getRecruiterById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe("updateRecruiter", () => {
        it("should hash password if provided during update", async () => {
            const id = new Types.ObjectId().toString();
            const req = mockRequest({ 
                params: { id },
                body: { firstName: "Jane", password: "newpassword" } 
            });
            const res = mockResponse();
            mockRecruiter.findByIdAndUpdate.mockResolvedValue({ _id: id });

            await RecruiterController.updateRecruiter(req, res);

            expect(mockHashMe).toHaveBeenCalledWith("newpassword");
            expect(mockRecruiter.findByIdAndUpdate).toHaveBeenCalledWith(
                id, 
                expect.objectContaining({ password: "hashed_newpassword" }),
                { new: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe("deleteRecruiter", () => {
        it("should delete recruiter", async () => {
            const id = new Types.ObjectId().toString();
            mockRecruiter.findByIdAndDelete.mockResolvedValue({ _id: id });
            
            const req = mockRequest({ params: { id } });
            const res = mockResponse();

            await RecruiterController.deleteRecruiter(req, res);

            expect(mockRecruiter.findByIdAndDelete).toHaveBeenCalledWith(id);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
