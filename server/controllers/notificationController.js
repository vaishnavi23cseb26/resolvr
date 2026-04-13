const asyncHandler = require("express-async-handler");

const Notification = require("../models/Notification");
const { apiSuccess } = require("../utils/apiResponse");

const listMyNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  return apiSuccess(res, { data: { items }, message: "Notifications fetched" });
});

const readAll = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { $set: { isRead: true } });
  return apiSuccess(res, { message: "All notifications marked as read" });
});

const readOne = asyncHandler(async (req, res) => {
  const notif = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!notif) {
    res.status(404);
    throw new Error("Notification not found");
  }
  notif.isRead = true;
  await notif.save();
  return apiSuccess(res, { data: { notification: notif }, message: "Notification marked as read" });
});

module.exports = { listMyNotifications, readAll, readOne };

