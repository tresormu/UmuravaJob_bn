import type { Response } from "express";
import { Types } from "mongoose";
import Notification, { NotificationType } from "../Models/Notification.model.js";
import type { AuthRequest } from "../types/type.js";
import { ResponseMessages } from "../utils/responseMessages.js";

class NotificationController {
  /**
   * Get all notifications for the authenticated user
   */
  static async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: ResponseMessages.ERROR.UNAUTHORIZED });
        return;
      }

      const page = Number.parseInt(String(req.query.page ?? 1), 10) || 1;
      const limit = Number.parseInt(String(req.query.limit ?? 20), 10) || 20;

      const query = { recipientId: req.user.id };

      const [total, notifications, unreadCount] = await Promise.all([
        Notification.countDocuments(query),
        Notification.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Notification.countDocuments({ ...query, isRead: false }),
      ]);

      res.status(200).json({
        success: true,
        data: notifications,
        pagination: {
          page,
          limit,
          total,
          unreadCount,
        },
      });
    } catch (error) {
      console.error("getNotifications error:", error);
      res.status(500).json({ success: false, message: "We're sorry, we couldn't fetch your notifications at this time." });
    }
  }

  /**
   * Get unread count only
   */
  static async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: ResponseMessages.ERROR.UNAUTHORIZED });
        return;
      }

      const unreadCount = await Notification.countDocuments({
        recipientId: req.user.id,
        isRead: false,
      });

      res.status(200).json({
        success: true,
        data: { unreadCount },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "We apologize, but we couldn't retrieve your unread notification count." });
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: ResponseMessages.ERROR.UNAUTHORIZED });
        return;
      }

      const id = req.params["id"];
      if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: ResponseMessages.ERROR.INVALID_FIELD("notification ID") });
        return;
      }

      const notification = await Notification.findOneAndUpdate(
        { _id: id, recipientId: req.user.id },
        { $set: { isRead: true } },
        { new: true }
      );

      if (!notification) {
        res.status(404).json({ success: false, message: ResponseMessages.ERROR.NOT_FOUND("notification") });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Your notification has been marked as read.",
        data: notification,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Something went wrong while updating your notification status." });
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: ResponseMessages.ERROR.UNAUTHORIZED });
        return;
      }

      await Notification.updateMany(
        { recipientId: req.user.id, isRead: false },
        { $set: { isRead: true } }
      );

      res.status(200).json({
        success: true,
        message: "Great! All your notifications have been marked as read.",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "We encountered an error while trying to mark your notifications as read." });
    }
  }

  /**
   * Helper utility to create notifications internally
   */
  static async createNotification(params: {
    recipientId: string | Types.ObjectId;
    recipientType: "Recruiter" | "Candidate";
    title: string;
    message: string;
    type: NotificationType;
    data?: any;
  }) {
    try {
      return await Notification.create(params);
    } catch (error) {
      console.error("Internal Notification Create Error:", error);
    }
  }
}

export default NotificationController;
