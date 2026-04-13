const asyncHandler = require("express-async-handler");

const Ticket = require("../models/Ticket");
const Comment = require("../models/Comment");
const ActivityLog = require("../models/ActivityLog");
const { apiSuccess } = require("../utils/apiResponse");
const { createAndEmitNotification } = require("../services/notificationService");
const { sendEmail } = require("../services/emailService");

async function canAccessTicket(reqUser, ticket) {
  if (reqUser.role === "admin") return true;
  if (reqUser.role === "customer") return String(ticket.createdBy) === String(reqUser._id);
  if (reqUser.role === "agent") return String(ticket.assignedTo || "") === String(reqUser._id);
  return false;
}

const listComments = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).select("_id createdBy assignedTo title");
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  const ok = await canAccessTicket(req.user, ticket);
  if (!ok) {
    res.status(403);
    throw new Error("Forbidden");
  }

  const query = { ticket: ticket._id };
  if (req.user.role === "customer") query.isInternal = false;

  const items = await Comment.find(query)
    .sort({ createdAt: 1 })
    .populate("author", "name email role avatar");

  return apiSuccess(res, { data: { items }, message: "Comments fetched" });
});

const addComment = asyncHandler(async (req, res) => {
  const { content, isInternal } = req.body;
  if (!content) {
    res.status(400);
    throw new Error("Content is required");
  }

  const ticket = await Ticket.findById(req.params.id)
    .select("_id createdBy assignedTo title")
    .populate("createdBy", "email name")
    .populate("assignedTo", "email name");

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  const ok = await canAccessTicket(req.user, ticket);
  if (!ok) {
    res.status(403);
    throw new Error("Forbidden");
  }

  const internal = Boolean(isInternal);
  if (internal && req.user.role === "customer") {
    res.status(403);
    throw new Error("Customers cannot create internal notes");
  }

  const comment = await Comment.create({
    ticket: ticket._id,
    author: req.user._id,
    content,
    isInternal: internal,
  });

  await ActivityLog.create({
    ticket: ticket._id,
    performedBy: req.user._id,
    action: internal ? "Internal note added" : "Comment added",
    details: internal ? "Internal note added" : "Comment added",
  });

  // Notify participants (never notify author)
  const recipients = new Set([String(ticket.createdBy._id)]);
  if (ticket.assignedTo?._id) recipients.add(String(ticket.assignedTo._id));
  recipients.delete(String(req.user._id));

  await Promise.all(
    Array.from(recipients).map((recipientId) =>
      createAndEmitNotification({
        recipientId,
        message: `New ${internal ? "internal note" : "comment"} on '${ticket.title}'`,
        link: `/tickets/${ticket._id}`,
      })
    )
  );

  // Email only ticket creator (as requested)
  if (String(ticket.createdBy._id) !== String(req.user._id) && !internal) {
    await sendEmail({
      to: ticket.createdBy.email,
      subject: `Resolvr: New comment (${ticket.title})`,
      html: `<p>A new comment was added to your ticket.</p><p><b>${ticket.title}</b></p><p>${content}</p>`,
    });
  }

  const populated = await Comment.findById(comment._id).populate("author", "name email role avatar");
  return apiSuccess(res, { statusCode: 201, data: { comment: populated }, message: "Comment added" });
});

module.exports = { listComments, addComment };

