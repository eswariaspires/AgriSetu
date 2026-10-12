
import mongoose from "mongoose";
import Notification from "../models/notification.js";

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user.id,
      isRead: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      message: "Unable to fetch notifications.",
    });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid notification ID.",
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipientId: req.user.id,
        isRead: false,
      },
      { isRead: true },
      { returnDocument: "after" }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found or already read.",
      });
    }

    return res.json({
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res.status(500).json({
      message: "Unable to update notification.",
    });
  }
};
