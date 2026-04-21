import mongoose, { Schema, Types } from "mongoose";
import type { HydratedDocument, Model } from "mongoose";

export enum NotificationType {
  NEW_APPLICANT = "NEW_APPLICANT",
  EXCEL_IMPORT_COMPLETE = "EXCEL_IMPORT_COMPLETE",
  JOB_EXPIRED = "JOB_EXPIRED",
  AI_SUGGESTION = "AI_SUGGESTION",
  SYSTEM_ALERT = "SYSTEM_ALERT",
}

export interface NotificationAttrs {
  recipientId: Types.ObjectId;
  recipientType: "Recruiter" | "Candidate";
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NotificationDocument = HydratedDocument<NotificationAttrs>;
export type NotificationModel = Model<NotificationAttrs>;

const NotificationSchema: Schema = new Schema<NotificationAttrs>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "recipientType",
    },
    recipientType: {
      type: String,
      required: true,
      enum: ["Recruiter", "Candidate"],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      default: NotificationType.SYSTEM_ALERT,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster lookups
NotificationSchema.index({ recipientId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.model<NotificationAttrs, NotificationModel>("Notification", NotificationSchema);
