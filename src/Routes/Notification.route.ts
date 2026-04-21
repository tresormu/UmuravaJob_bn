import express from "express";
import NotificationController from "../Controllers/Notification.controller.js";
import { protect } from "../Middlewares/Auth.Middleware.js";

const router = express.Router();

// All notification routes are protected
router.use(protect);

router.get("/", NotificationController.getNotifications);
router.get("/unread-count", NotificationController.getUnreadCount);
router.patch("/:id/read", NotificationController.markAsRead);
router.patch("/read-all", NotificationController.markAllAsRead);

export default router;
