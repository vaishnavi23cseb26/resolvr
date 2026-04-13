const Notification = require("../models/Notification");
const { emitToUser } = require("./socketService");

async function createAndEmitNotification({ recipientId, message, link = "" }) {
  const notif = await Notification.create({
    recipient: recipientId,
    message,
    link,
  });

  emitToUser(recipientId, "notification:new", {
    id: notif._id,
    message: notif.message,
    link: notif.link,
    isRead: notif.isRead,
    createdAt: notif.createdAt,
  });

  return notif;
}

module.exports = { createAndEmitNotification };

