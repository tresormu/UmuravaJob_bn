import mongoose from "mongoose";
import config from "./config/env.config.js";
import app from "./app.js";
import { initNotificationWorker } from "./utils/Notification.worker.js";

mongoose
  .connect(config.mongoUrl)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    initNotificationWorker();
  })
  .catch((err) => console.error("❌ Connection error:", err));

app.listen(config.port, () => {
  console.log(`🚀 Server is running on http://localhost:${config.port}`);
  console.log(`📚 Swagger is running on http://localhost:${config.port}/api-docs`)
});
