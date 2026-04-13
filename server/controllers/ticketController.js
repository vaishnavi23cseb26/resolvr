const asyncHandler = require("express-async-handler");

const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Category = require("../models/Category");
const ActivityLog = require("../models/ActivityLog");
const { apiSuccess } = require("../utils/apiResponse");
const { getPagination } = require("../utils/pagination");
const { createAndEmitNotification } = require("../services/notificationService");
const { sendEmail } = require("../services/emailService");

function buildTicketFilters(query, user) {
  const filters = {};

  // Role-based scoping
  if (user.role === "customer") filters.createdBy = user._id;
  if (user.role === "agent") filters.assignedTo = user._id;

  if (query.status) filters.status = query.status;
  if (query.priority) filters.priority = query.priority;
  if (query.category) filters.category = query.category;
  if (query.agent) filters.assignedTo = query.agent;

  if (query.from || query.to) {
    filters.createdAt = {};
    if (query.from) filters.createdAt.$gte = new Date(query.from);
    if (query.to) filters.createdAt.$lte = new Date(query.to);
  }

  if (query.search) {
    filters.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  return filters;
}

async function logActivity({ ticketId, performedBy, action, details = "" }) {
  await ActivityLog.create({
    ticket: ticketId,
    performedBy,
    action,
    details,
  });
}

const listTickets = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filters = buildTicketFilters(req.query, req.user);

  const [items, total] = await Promise.all([
    Ticket.find(filters)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category")
      .populate("createdBy", "name email role avatar")
      .populate("assignedTo", "name email role avatar"),
    Ticket.countDocuments(filters),
  ]);

  return apiSuccess(res, {
    data: {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    message: "Tickets fetched",
  });
});

const createTicket = asyncHandler(async (req, res) => {
  const { title, description, category, priority, tags, attachments } = req.body;
  if (!title || !description) {
    res.status(400);
    throw new Error("Title and description are required");
  }

  if (category) {
    const exists = await Category.exists({ _id: category });
    if (!exists) {
      res.status(400);
      throw new Error("Invalid category");
    }
  }

  const ticket = await Ticket.create({
    title,
    description,
    category: category || null,
    priority: priority || "low",
    createdBy: req.user._id,
    tags: Array.isArray(tags) ? tags : [],
    attachments: Array.isArray(attachments) ? attachments : [],
  });

  await logActivity({
    ticketId: ticket._id,
    performedBy: req.user._id,
    action: "Ticket created",
    details: `Ticket '${ticket.title}' created`,
  });

  // Email customer
  await sendEmail({
    to: req.user.email,
    subject: `Resolvr: Ticket created (${ticket.title})`,
    html: `<p>Your ticket has been created.</p><p><b>${ticket.title}</b></p><p>Status: open</p>`,
  });

  return apiSuccess(res, { statusCode: 201, data: { ticket }, message: "Ticket created" });
});

const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate("category")
    .populate("createdBy", "name email role avatar")
    .populate("assignedTo", "name email role avatar");

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  // Authorization: customer must own; agent must be assigned; admin can view
  if (req.user.role === "customer" && String(ticket.createdBy._id) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Forbidden");
  }
  if (req.user.role === "agent" && String(ticket.assignedTo?._id || "") !== String(req.user._id)) {
    res.status(403);
    throw new Error("Forbidden");
  }

  return apiSuccess(res, { data: { ticket }, message: "Ticket fetched" });
});

const updateTicket = asyncHandler(async (req, res) => {
  const { title, description, category, priority, tags, attachments } = req.body;
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  // Customer can edit own ticket (title/desc/category/priority/tags/attachments) only if not closed
  if (req.user.role === "customer") {
    if (String(ticket.createdBy) !== String(req.user._id)) {
      res.status(403);
      throw new Error("Forbidden");
    }
    if (ticket.status === "closed") {
      res.status(400);
      throw new Error("Closed ticket cannot be edited");
    }
  }

  // Agent can edit only assigned ticket; admin can edit any
  if (req.user.role === "agent" && String(ticket.assignedTo || "") !== String(req.user._id)) {
    res.status(403);
    throw new Error("Forbidden");
  }

  if (category) {
    const exists = await Category.exists({ _id: category });
    if (!exists) {
      res.status(400);
      throw new Error("Invalid category");
    }
  }

  if (title !== undefined) ticket.title = title;
  if (description !== undefined) ticket.description = description;
  if (category !== undefined) ticket.category = category || null;
  if (priority !== undefined) ticket.priority = priority;
  if (tags !== undefined) ticket.tags = Array.isArray(tags) ? tags : [];
  if (attachments !== undefined) ticket.attachments = Array.isArray(attachments) ? attachments : [];

  await ticket.save();

  await logActivity({
    ticketId: ticket._id,
    performedBy: req.user._id,
    action: "Ticket updated",
    details: "Ticket details updated",
  });

  return apiSuccess(res, { data: { ticket }, message: "Ticket updated" });
});

const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  await Ticket.deleteOne({ _id: ticket._id });
  await ActivityLog.deleteMany({ ticket: ticket._id });

  return apiSuccess(res, { message: "Ticket deleted" });
});

const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    res.status(400);
    throw new Error("Status is required");
  }

  const ticket = await Ticket.findById(req.params.id).populate("createdBy", "email name").populate("assignedTo", "email name");
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  // Authorization
  if (req.user.role === "customer") {
    res.status(403);
    throw new Error("Forbidden");
  }
  if (req.user.role === "agent" && String(ticket.assignedTo?._id || "") !== String(req.user._id)) {
    res.status(403);
    throw new Error("Forbidden");
  }

  ticket.status = status;
  if (status === "resolved") ticket.resolvedAt = new Date();
  await ticket.save();

  await logActivity({
    ticketId: ticket._id,
    performedBy: req.user._id,
    action: `Status changed to ${status}`,
    details: `Status changed to ${status}`,
  });

  // Notify customer
  await createAndEmitNotification({
    recipientId: ticket.createdBy._id,
    message: `Ticket '${ticket.title}' status updated to ${status}`,
    link: `/tickets/${ticket._id}`,
  });

  await sendEmail({
    to: ticket.createdBy.email,
    subject: `Resolvr: Ticket status updated (${ticket.title})`,
    html: `<p>Your ticket status changed to <b>${status}</b>.</p><p><b>${ticket.title}</b></p>`,
  });

  return apiSuccess(res, { data: { ticket }, message: "Status updated" });
});

const assignTicket = asyncHandler(async (req, res) => {
  const { agentId } = req.body;
  if (!agentId) {
    res.status(400);
    throw new Error("agentId is required");
  }

  const [ticket, agent] = await Promise.all([
    Ticket.findById(req.params.id),
    User.findById(agentId).select("role email name isActive"),
  ]);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  if (!agent || agent.role !== "agent" || !agent.isActive) {
    res.status(400);
    throw new Error("Invalid agent");
  }

  ticket.assignedTo = agent._id;
  await ticket.save();

  await logActivity({
    ticketId: ticket._id,
    performedBy: req.user._id,
    action: "Agent assigned",
    details: `Assigned to ${agent.email}`,
  });

  await createAndEmitNotification({
    recipientId: agent._id,
    message: `You were assigned ticket '${ticket.title}'`,
    link: `/tickets/${ticket._id}`,
  });

  await sendEmail({
    to: agent.email,
    subject: `Resolvr: Ticket assigned (${ticket.title})`,
    html: `<p>You were assigned a ticket.</p><p><b>${ticket.title}</b></p>`,
  });

  return apiSuccess(res, { data: { ticket }, message: "Ticket assigned" });
});

const getTicketActivity = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).select("_id createdBy assignedTo");
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  if (req.user.role === "customer" && String(ticket.createdBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Forbidden");
  }
  if (req.user.role === "agent" && String(ticket.assignedTo || "") !== String(req.user._id)) {
    res.status(403);
    throw new Error("Forbidden");
  }

  const items = await ActivityLog.find({ ticket: ticket._id })
    .sort({ createdAt: -1 })
    .populate("performedBy", "name email role avatar");

  return apiSuccess(res, { data: { items }, message: "Activity fetched" });
});

module.exports = {
  listTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
  updateTicketStatus,
  assignTicket,
  getTicketActivity,
};

