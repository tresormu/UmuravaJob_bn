import dotenv from "dotenv";
dotenv.config();
const requireEnv = (key) => {
    const value = process.env[key];
    if (!value)
        throw new Error(`Missing required environment variable: ${key}`);
    return value;
};
const parseCorsOrigins = () => {
    const raw = process.env.CORS_ORIGINS;
    if (!raw)
        return undefined;
    const origins = raw
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
    return origins.length > 0 ? origins : undefined;
};
const config = {
    // Server
    port: Number(process.env.PORT),
    corsOrigins: parseCorsOrigins(),
    // Database
    mongoUrl: requireEnv("MONGO_URL"),
    // Auth
    jwtSecret: requireEnv("JWT_SECRET"),
    expirationToken: (process.env.EXPIRATION_TOKEN),
    refreshTokenSecret: requireEnv("REFRESH_TOKEN_SECRET"),
    refreshTokenExpiresIn: requireEnv("REFRESH_TOKEN_EXPIRES_IN"),
    saltRounds: Number(process.env.SALT_ROUNDS),
    // Cloudinary
    cloudinary: {
        cloudName: requireEnv("CLOUDINARY_CLOUD_NAME"),
        apiKey: requireEnv("CLOUDINARY_API_KEY"),
        apiSecret: requireEnv("CLOUDINARY_API_SECRET"),
    },
    // Email
    email: {
        from: requireEnv("EMAIL_FROM"),
        smtpHost: requireEnv("SMTP_HOST"),
        smtpPort: Number(process.env.SMTP_PORT),
        smtpUser: requireEnv("SMTP_USER"),
        smtpPass: requireEnv("SMTP_PASS"),
        smtpSecure: process.env.SMTP_SECURE === "true",
    },
};
export default config;
//# sourceMappingURL=env.config.js.map