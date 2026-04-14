import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedData } from "../Seed/seed.js";
import { MongoMemoryServer } from "mongodb-memory-server";

dotenv.config();

let memoryServer: MongoMemoryServer | null = null;

const connectWithUrl = async (mongoUrl: string) => {
  await mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 30000,
  });
};

export const connectTestDB = async () => {
    let mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/umuravajob_test";
    
    // If it's the Atlas URL from .env, ensure we use the test database
    if (mongoUrl.includes("mongodb.net")) {
        if (mongoUrl.includes("/?")) {
            mongoUrl = mongoUrl.replace("/?", "/umuravajob_test?");
        } else if (!mongoUrl.includes("/umuravajob_test")) {
            // Fallback for different URI formats
            const urlObj = new URL(mongoUrl);
            urlObj.pathname = "/umuravajob_test";
            mongoUrl = urlObj.toString();
        }
    }

    if (mongoose.connection.readyState !== 0) {
      return;
    }

    const forceMemory = process.env.USE_MEMORY_DB === "true";
    if (forceMemory) {
      memoryServer = await MongoMemoryServer.create();
      await connectWithUrl(memoryServer.getUri());
      return;
    }

    await connectWithUrl(mongoUrl);
};

export const disconnectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

export const clearAndSeedDB = async () => {
  await seedData();
};
