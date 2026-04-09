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
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
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
declare const _default: RecruiterModel;
export default _default;
//# sourceMappingURL=Recruiter.model.d.ts.map