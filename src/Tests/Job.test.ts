import { expect, it, describe, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { Types } from "mongoose";
import app from "../app.js";
import { connectTestDB, disconnectTestDB, clearAndSeedDB } from "./db.helper.js";
import Job from "../Models/Job.model.js";
import { getTestAuthHeader } from "./auth.helper.js";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe("Job API (Integration)", () => {
  let authHeader: Record<string, string>;

  beforeEach(async () => {
    await clearAndSeedDB();
    authHeader = await getTestAuthHeader();
  });

  describe("POST /api/jobs", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await request(app)
        .post("/api/jobs")
        .send({
          title: "New Job",
          description: "Desc",
          skills: ["Node"],
        });

      expect(res.status).toBe(401);
    });

    it("creates job successfully with real auth", async () => {
      const jobData = {
        title: "New Integration Job",
        description: "Build APIs",
        skills: ["Node", "Express"],
        experience: 3,
        education: "BS",
        location: "Remote",
      };

      const res = await request(app)
        .post("/api/jobs")
        .set(authHeader)
        .send(jobData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("New Integration Job");
      
      // Verify in real DB
      const dbJob = await Job.findOne({ title: "New Integration Job" });
      expect(dbJob).not.toBeNull();
    });
  });

  describe("GET /api/jobs", () => {
    it("returns jobs list from seeded data", async () => {
      const res = await request(app).get("/api/jobs");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/jobs/:id", () => {
    it("returns 404 if not found", async () => {
      const id = new Types.ObjectId().toString();
      const res = await request(app).get(`/api/jobs/${id}`);

      expect(res.status).toBe(404);
    });

    it("returns job", async () => {
      const seededJob = await Job.findOne({ title: 'Frontend Developer' });
      const id = seededJob!._id.toString();

      const res = await request(app).get(`/api/jobs/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Frontend Developer");
    });
  });

  describe("PATCH /api/jobs/:id", () => {
    it("updates job", async () => {
      const seededJob = await Job.findOne({ title: 'Frontend Developer' });
      const id = seededJob!._id.toString();

      const res = await request(app)
        .put(`/api/jobs/${id}`)
        .set(authHeader)
        .send({ title: "Updated Title" });

      expect(res.status).toBe(200);
      const dbJob = await Job.findById(id);
      expect(dbJob?.title).toBe("Updated Title");
    });
  });

  describe("DELETE /api/jobs/:id", () => {
    it("deletes job", async () => {
      const seededJob = await Job.findOne({ title: 'Frontend Developer' });
      const id = seededJob!._id.toString();

      const res = await request(app)
        .delete(`/api/jobs/${id}`)
        .set(authHeader);

      expect(res.status).toBe(200);
      const dbJob = await Job.findById(id);
      expect(dbJob).toBeNull();
    });
  });
});
