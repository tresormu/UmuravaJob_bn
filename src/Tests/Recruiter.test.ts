import { expect, it, describe, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { Types } from "mongoose";
import app from "../app.js";
import { connectTestDB, disconnectTestDB, clearAndSeedDB } from "./db.helper.js";
import Recruiter from "../Models/Recruiter.model.js";
import { getTestAuthHeader } from "./auth.helper.js";
import { TEST_RECRUITER_EMAIL, TEST_RECRUITER_PASSWORD } from "../Seed/seed.js";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe("Recruiter API (Integration)", () => {
  let authHeader: Record<string, string>;

  beforeEach(async () => {
    await clearAndSeedDB();
    authHeader = await getTestAuthHeader();
  });

  describe("POST /api/recruiters", () => {
    it("creates a new recruiter", async () => {
      const recruiterData = {
        firstName: "New",
        lastName: "Recruiter",
        email: "new@recruiter.com",
        password: "password123"
      };

      const res = await request(app)
        .post("/api/recruiters")
        .send(recruiterData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      
      const dbCheck = await Recruiter.findOne({ email: "new@recruiter.com" });
      expect(dbCheck).not.toBeNull();
    });
  });

  describe("POST /api/recruiters/auth/login", () => {
    it("logs in successfully", async () => {
      const res = await request(app)
        .post("/api/recruiters/auth/login")
        .send({
          email: TEST_RECRUITER_EMAIL,
          password: TEST_RECRUITER_PASSWORD
        });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });
  });

  describe("GET /api/recruiters/:id", () => {
    it("fetches recruiter profile", async () => {
      const recruiter = await Recruiter.findOne({ email: TEST_RECRUITER_EMAIL });
      const id = recruiter!._id.toString();

      const res = await request(app)
        .get(`/api/recruiters/${id}`)
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.recruiter.email).toBe(TEST_RECRUITER_EMAIL);
    });
  });

  describe("PATCH /api/recruiters/:id", () => {
    it("updates recruiter profile", async () => {
      const recruiter = await Recruiter.findOne({ email: TEST_RECRUITER_EMAIL });
      const id = recruiter!._id.toString();

      const res = await request(app)
        .patch(`/api/recruiters/${id}`)
        .set(authHeader)
        .send({ firstName: "UpdatedName" });

      expect(res.status).toBe(200);
      const updated = await Recruiter.findById(id);
      expect(updated?.firstName).toBe("UpdatedName");
    });
  });
});
