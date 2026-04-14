import { expect, it, describe, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { Types } from "mongoose";
import app from "../app.js";
import { connectTestDB, disconnectTestDB, clearAndSeedDB } from "./db.helper.js";
import Applicant from "../Models/Applicant.model.js";
import Job from "../Models/Job.model.js";
import { getTestAuthHeader } from "./auth.helper.js";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe("Applicants API (Integration)", () => {
  let authHeader: Record<string, string>;

  beforeEach(async () => {
    await clearAndSeedDB();
    authHeader = await getTestAuthHeader();
  });

  describe("GET /api/applicants", () => {
    it("returns applicants list from seeded data", async () => {
      const res = await request(app)
        .get("/api/applicants")
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.applicants.length).toBeGreaterThan(0);
      expect(res.body.applicants.some((a: any) => a.fullName === "John Doe")).toBe(true);
    });
  });

  describe("GET /api/applicants/:id", () => {
    it("returns applicant by id", async () => {
      const applicant = await Applicant.findOne({ fullName: "John Doe" });
      const id = applicant!._id.toString();

      const res = await request(app)
        .get(`/api/applicants/${id}`)
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.applicant.fullName).toBe("John Doe");
    });
  });

  describe("POST /api/applicants", () => {
    it("creates unique applicant", async () => {
        const job = await Job.findOne();
        const jobId = job!._id.toString();

        const res = await request(app)
            .post("/api/applicants")
            .set(authHeader)
            .send({
              jobId,
              fullName: "Unique Name",
              email: "unique@test.com",
              source: "manual",
            });
    
          expect(res.status).toBe(201);
          const dbCheck = await Applicant.findOne({ email: "unique@test.com" });
          expect(dbCheck).not.toBeNull();
    });
  });

  describe("PATCH /api/applicants/:id", () => {
    it("updates applicant", async () => {
      const applicant = await Applicant.findOne();
      const id = applicant!._id.toString();

      const res = await request(app)
        .patch(`/api/applicants/${id}`)
        .set(authHeader)
        .send({ status: "screened" });

      expect(res.status).toBe(200);
      const updated = await Applicant.findById(id);
      expect(updated?.status).toBe("screened");
    });
  });

  describe("DELETE /api/applicants/:id", () => {
    it("deletes applicant", async () => {
      const applicant = await Applicant.findOne();
      const id = applicant!._id.toString();

      const res = await request(app)
        .delete(`/api/applicants/${id}`)
        .set(authHeader);

      expect(res.status).toBe(200);
      const dbCheck = await Applicant.findById(id);
      expect(dbCheck).toBeNull();
    });
  });
});
