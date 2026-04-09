import express from "express";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import config from "./config/env.config.js";
import ApplicantsRoutes from "./Routes/Applicant.route.js";
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());
app.use(cors({
    origin: [],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Product API Docs",
}));
mongoose
    .connect(config.mongoUrl)
    .then(() => console.log(" Connected to MongoDB Compass"))
    .catch((err) => console.error(" Connection error:", err));
app.use("/api/applicants", ApplicantsRoutes);
app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
    console.log(`Swagger is running on http://localhost:${config.port}/api-docs`);
});
//# sourceMappingURL=server.js.map