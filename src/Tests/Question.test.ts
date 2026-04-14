import { expect, it, describe, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { Types } from "mongoose";
import app from "../app.js";
import { connectTestDB, disconnectTestDB, clearAndSeedDB } from "./db.helper.js";
import Question from "../Models/Question.model.js";
import Job from "../Models/Job.model.js";
import { getTestAuthHeader } from "./auth.helper.js";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe("Question API (Integration)", () => {
  let authHeader: Record<string, string>;

  beforeEach(async () => {
    await clearAndSeedDB();
    authHeader = await getTestAuthHeader();
  });

  describe("POST /api/job/:jobId/questions", () => {
    it("creates question successfully", async () => {
      const job = await Job.findOne({ title: 'Frontend Developer' });
      const jobId = job!._id.toString();

      const res = await request(app)
        .post(`/api/jobs/${jobId}/questions`)
        .set(authHeader)
        .send({
          prompt: "New Integration Question",
          type: "text",
          required: true,
          order: 10
        });

      expect(res.status).toBe(201);
      expect(res.body.data.prompt).toBe("New Integration Question");
      
      const dbCheck = await Question.findOne({ prompt: "New Integration Question" });
      expect(dbCheck).not.toBeNull();
    });
  });

  describe("GET /api/jobs/:jobId/questions", () => {
    it("lists questions for a job", async () => {
      const job = await Job.findOne({ title: 'Frontend Developer' });
      const jobId = job!._id.toString();

      const res = await request(app).get(`/api/jobs/${jobId}/questions`);

      expect(res.status).toBe(200);
      expect(res.body.questions.length).toBeGreaterThan(0);
    });
  });

  describe("PATCH /api/questions/:id", () => {
    it("updates question", async () => {
      const question = await Question.findOne();
      const id = question!._id.toString();

      const res = await request(app)
        .patch(`/api/questions/${id}`)
        .set(authHeader)
        .send({ prompt: "Updated Prompt" });

      expect(res.status).toBe(200);
      const updated = await Question.findById(id);
      expect(updated?.prompt).toBe("Updated Prompt");
    });
  });

  describe("DELETE /api/questions/:id", () => {
    it("deletes question", async () => {
      const question = await Question.findOne();
      const id = question!._id.toString();

      const res = await request(app)
        .delete(`/api/questions/${id}`)
        .set(authHeader);

      expect(res.status).toBe(200);
      const dbCheck = await Question.findById(id);
      expect(dbCheck).toBeNull();
    });
  });
});
