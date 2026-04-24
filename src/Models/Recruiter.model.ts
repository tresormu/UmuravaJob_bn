import { Schema, model } from "mongoose";
import type { HydratedDocument, Model } from "mongoose";

export type RecruiterRole = "recruiter";

export interface RecruiterAttrs {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  role: RecruiterRole;
  permissions?: string[];
  companyName?: string;
  companyWebsite?: string;
  position?: string;
  profilePicture?: string;
  bio?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string | undefined;
  emailVerificationExpires?: Date | undefined;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  deletionVerificationToken?: string | undefined;
  deletionVerificationExpires?: Date | undefined;
  lastLoginAt?: Date;
  loginAttempts?: number;
  isLocked?: boolean;
  lockedUntil?: Date;
  refreshToken?: string | undefined;
  preferredLanguage?: string;
  timezone?: string;
  notificationsEnabled?: boolean;
  isActive: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type RecruiterDocument = HydratedDocument<RecruiterAttrs>;
export type RecruiterModel = Model<RecruiterAttrs>;

const RecruiterSchema = new Schema<RecruiterAttrs>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ["recruiter"],
      required: true,
      default: "recruiter",
    },
    permissions: { type: [String], default: [] },
    companyName: { type: String, trim: true },
    companyWebsite: { type: String, trim: true },
    position: { type: String, trim: true },
    profilePicture: { type: String, trim: true },
    bio: { type: String, trim: true },
    isEmailVerified: { type: Boolean, required: true, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    deletionVerificationToken: { type: String },
    deletionVerificationExpires: { type: Date },
    lastLoginAt: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    lockedUntil: { type: Date },
    refreshToken: { type: String },
    preferredLanguage: { type: String, default: "en" },
    timezone: { type: String, default: "Africa/Kigali" },
    notificationsEnabled: { type: Boolean, default: true },
    isActive: { type: Boolean, required: true, default: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Indexes

export default model<RecruiterAttrs, RecruiterModel>("Recruiter", RecruiterSchema);
