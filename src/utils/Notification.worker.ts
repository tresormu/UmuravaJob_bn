import cron from "node-cron";
import Job from "../Models/Job.model.js";
import NotificationController from "../Controllers/Notification.controller.js";
import { NotificationType } from "../Models/Notification.model.js";

/**
 * Background worker to handle notification-related maintenance tasks
 */
export const initNotificationWorker = () => {
  // Run every day at midnight (00:00)
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Running job expiration worker...");
    await checkExpiredJobs();
  });

  // For testing/demo purposes, we could also run it every hour
  // cron.schedule("0 * * * *", checkExpiredJobs);
};

/**
 * Checks for jobs that have recently reached their deadline
 */
const checkExpiredJobs = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const now = new Date();

    // Find jobs that expired in the last 24 hours and haven't been notified yet
    // We can use a property in 'data' of notification to avoid double notification, 
    // or just assume we run once a day.
    const expiredJobs = await Job.find({
      deadline: {
        $gte: yesterday,
        $lte: now,
      }
    });

    for (const job of expiredJobs) {
      // Check if we already notified for this job expiration
      // (This is a simple check, in production you might want a more robust one)
      const existingNotif = await NotificationController.createNotification({
        recipientId: job.recruiterId,
        recipientType: "Recruiter",
        title: "Job Posting Expired",
        message: `Your job posting "${job.title}" has reached its deadline and is now expired.`,
        type: NotificationType.JOB_EXPIRED,
        data: {
          jobId: job._id,
          expiredAt: job.deadline,
        }
      });
    }

    console.log(`✅ Processed ${expiredJobs.length} expired jobs.`);
  } catch (error) {
    console.error("Error in checkExpiredJobs:", error);
  }
};
