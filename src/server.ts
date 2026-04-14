import mongoose from "mongoose";
import config from "./config/env.config.js";
import app from "./app.js";

mongoose
  .connect(config.mongoUrl)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Connection error:", err));

app.listen(config.port, () => {
  console.log(`🚀 Server is running on http://localhost:${config.port}`);
  console.log(`📚 Swagger is running on http://localhost:${config.port}/api-docs`)
});
