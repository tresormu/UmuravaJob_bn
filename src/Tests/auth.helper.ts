import { GenerateToken } from "../utils/token.js";
import Recruiter from "../Models/Recruiter.model.js";
import { TEST_RECRUITER_EMAIL } from "../Seed/seed.js";

/**
 * Generates a real JWT token for the test recruiter seeded in the database.
 * This ensures we are testing with real, valid authentication.
 */
export const getTestAuthHeader = async () => {
    const recruiter = await Recruiter.findOne({ email: TEST_RECRUITER_EMAIL });
    if (!recruiter) {
        throw new Error("Test recruiter not found. Ensure clearAndSeedDB() was called.");
    }

    const payload = {
        id: recruiter.id,
        role: recruiter.role,
        email: recruiter.email,
    };

    const token = GenerateToken(payload);
    return { Authorization: `Bearer ${token}` };
};
