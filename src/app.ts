import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import config from "./config/env.config.js";
import ApplicantsRoutes from "./Routes/Applicant.route.js";
import RecruitersRoutes from "./Routes/Recruiter.route.js"
import errorMiddleware from "./Middlewares/error.middleware.js";
import Jobrouter from "./Routes/Job.routes.js";
import ApplicationRoutes from "./Routes/Application.route.js";
import QuestionRoutes from "./Routes/Question.route.js";
import NotificationRoutes from "./Routes/Notification.route.js";
import RecruiterChatRoutes from "./Routes/RecruiterChat.route.js";


const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());
app.use(morgan("combined"));

app.use(
  cors({
    origin: config.corsOrigins ?? true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { 
    success: false,
    message: "I'm sorry, but we've received too many requests from your connection. Please wait a few minutes before trying again." 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many token refresh attempts. Please wait a few minutes before trying again."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path !== "/auth/refresh",
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Product API Docs",
}));

app.use("/api/applicants", ApplicantsRoutes);
app.use("/api/recruiters", RecruitersRoutes);
app.use("/api/jobs", Jobrouter);
app.use("/api", QuestionRoutes);
app.use("/api", ApplicationRoutes);
app.use("/api/notifications", NotificationRoutes);
app.use("/api/recruiter/chat", RecruiterChatRoutes);


app.use((req, res) => {
  res.status(404).json({ success: false, message: "I'm sorry, but we couldn't find the resource you're looking for. Please check the URL and try again." });
});

app.use(errorMiddleware);

export default app;
