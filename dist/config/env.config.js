import dotenv from "dotenv";
dotenv.config();
const requireEnv = (key) => {
    const value = process.env[key];
    if (!value)
        throw new Error(`Missing required environment variable: ${key}`);
    return value;
};
const config = {
    // Server
    port: Number(process.env.PORT),
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
        apiKey: requireEnv("RESEND_API_KEY"),
        from: requireEnv("EMAIL_FROM"),
    },
};
export default config;
//# sourceMappingURL=env.config.js.map