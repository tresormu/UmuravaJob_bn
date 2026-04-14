import { expect, it, describe, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { Types } from "mongoose";
import app from "../app.js";
import { connectTestDB, disconnectTestDB, clearAndSeedDB } from "./db.helper.js";
import Application from "../Models/Application.model.js";
import Job from "../Models/Job.model.js";
import Applicant from "../Models/Applicant.model.js";
import Question from "../Models/Question.model.js";
import { getTestAuthHeader } from "./auth.helper.js";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe("Application Pipeline API (Integration)", () => {
  let authHeader: Record<string, string>;

  beforeEach(async () => {
    await clearAndSeedDB();
    authHeader = await getTestAuthHeader();
  });

  describe("POST /api/job/:jobId/apply", () => {
    it("creates application successfully", async () => {
      const job = await Job.findOne({ title: 'Frontend Developer' });
      const jobId = job!._id.toString();
      const questions = await Question.find({ jobId });

      const answers = questions.map(q => ({
        questionId: q._id.toString(),
        value: q.type === 'number' ? 5 : (q.type === 'boolean' ? true : "Real Answer")
      }));

      const res = await request(app)
        .post(`/api/jobs/${jobId}/applications`)
        .send({
          fullName: "Real Candidate",
          email: "real@candidate.com",
          phone: "0788123456",
          answers
        });

      expect(res.status).toBe(201);
      expect(res.body.applicationId).toBeDefined();

      // Verify in DB
      const appDoc = await Application.findById(res.body.applicationId);
      expect(appDoc).not.toBeNull();
      expect(appDoc?.status).toBe('applied');

      const applicant = await Applicant.findOne({ applicationId: appDoc?._id } as any);
      expect(applicant?.fullName).toBe("Real Candidate");
    });
  });

  describe("GET /api/jobs/:jobId/applications", () => {
    it("lists applications for a job", async () => {
      const job = await Job.findOne({ title: 'Frontend Developer' });
      const jobId = job!._id.toString();

      const res = await request(app)
        .get(`/api/jobs/${jobId}/applications`)
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.applications.length).toBeGreaterThan(0);
    });
  });

  describe("PATCH /api/applications/:id/status", () => {
    it("updates application status", async () => {
      const appDoc = await Application.findOne();
      const id = appDoc!._id.toString();

      const res = await request(app)
        .patch(`/api/applications/${id}/status`)
        .set(authHeader)
        .send({ status: "shortlisted" });

      expect(res.status).toBe(200);
      expect(res.body.application.status).toBe("shortlisted");
    });
  });
});
