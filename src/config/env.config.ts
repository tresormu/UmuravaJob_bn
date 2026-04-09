import dotenv from "dotenv";
import type { StringValue } from "ms";
dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

const config = {
  // Server
  port: Number(process.env.PORT),

  // Database
  mongoUrl: requireEnv("MONGO_URL"),

  // Auth
  jwtSecret: requireEnv("JWT_SECRET"),
  expirationToken: (process.env.EXPIRATION_TOKEN) as StringValue,
  refreshTokenSecret: requireEnv("REFRESH_TOKEN_SECRET"),
  refreshTokenExpiresIn: requireEnv("REFRESH_TOKEN_EXPIRES_IN") as StringValue,
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

} as const;

export default config;
