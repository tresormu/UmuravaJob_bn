import { Schema, model } from "mongoose";
const RecruiterSchema = new Schema({
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
}, {
    timestamps: true,
});
// Indexes
export default model("Recruiter", RecruiterSchema);
//# sourceMappingURL=Recruiter.model.js.map