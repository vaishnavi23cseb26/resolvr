const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/User");
const Category = require("./models/Category");
const Ticket = require("./models/Ticket");
const Comment = require("./models/Comment");
const ActivityLog = require("./models/ActivityLog");
const Notification = require("./models/Notification");

dotenv.config();

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function lorem(n = 2) {
  const parts = [
    "User reports intermittent issue.",
    "Steps to reproduce included.",
    "Observed on latest version.",
    "Needs investigation and confirmation.",
    "Customer impact is moderate.",
    "Possible workaround exists.",
  ];
  return Array.from({ length: n }, () => pick(parts)).join(" ");
}

async function run() {
  await connectDB();

  // Clean
  await Promise.all([
    Notification.deleteMany({}),
    ActivityLog.deleteMany({}),
    Comment.deleteMany({}),
    Ticket.deleteMany({}),
    Category.deleteMany({}),
    User.deleteMany({}),
  ]);

  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash("Admin@123", salt);
  const agentPass = await bcrypt.hash("Agent@123", salt);
  const customerPass = await bcrypt.hash("Customer@123", salt);

  const [admin] = await User.create([
    { name: "Admin", email: "admin@resolvr.com", password: adminPass, role: "admin" },
  ]);

  const agents = await User.create([
    { name: "Agent One", email: "agent1@resolvr.com", password: agentPass, role: "agent" },
    { name: "Agent Two", email: "agent2@resolvr.com", password: agentPass, role: "agent" },
  ]);

  const customers = await User.create([
    { name: "Customer One", email: "customer1@resolvr.com", password: customerPass, role: "customer" },
    { name: "Customer Two", email: "customer2@resolvr.com", password: customerPass, role: "customer" },
    { name: "Customer Three", email: "customer3@resolvr.com", password: customerPass, role: "customer" },
  ]);

  const categories = await Category.create([
    { name: "Bug", description: "Defects and broken behavior", color: "#3b82f6" },
    { name: "Feature Request", description: "New feature ideas", color: "#6366f1" },
    { name: "Billing", description: "Payments and invoices", color: "#f59e0b" },
    { name: "Account", description: "Login, profile, access", color: "#22c55e" },
    { name: "General", description: "General inquiries", color: "#94a3b8" },
  ]);

  const statuses = ["open", "in-progress", "resolved", "closed"];
  const priorities = ["low", "medium", "high", "critical"];

  const tickets = [];
  for (let i = 1; i <= 20; i += 1) {
    const createdBy = pick(customers);
    const status = pick(statuses);
    const assignedTo = status === "open" ? null : pick(agents);
    const resolvedAt = status === "resolved" ? new Date() : null;

    tickets.push({
      title: `Sample Ticket #${i}: ${pick(["Cannot login", "Bug in dashboard", "Billing question", "Feature idea", "Account issue"])}`,
      description: lorem(3),
      category: pick(categories)._id,
      priority: pick(priorities),
      status,
      createdBy: createdBy._id,
      assignedTo: assignedTo?._id || null,
      tags: ["sample", status],
      resolvedAt,
    });
  }

  const createdTickets = await Ticket.create(tickets);

  for (const t of createdTickets) {
    await ActivityLog.create({
      ticket: t._id,
      performedBy: t.createdBy,
      action: "Ticket created",
      details: `Ticket '${t.title}' created`,
    });

    if (t.assignedTo) {
      await ActivityLog.create({
        ticket: t._id,
        performedBy: admin._id,
        action: "Agent assigned",
        details: `Assigned to ${t.assignedTo}`,
      });
    }

    // 2 comments per ticket (one public, one internal if assigned)
    await Comment.create({
      ticket: t._id,
      author: t.createdBy,
      content: "Hello team, please help with this issue.",
      isInternal: false,
    });

    if (t.assignedTo) {
      await Comment.create({
        ticket: t._id,
        author: t.assignedTo,
        content: "Internal note: investigating root cause and next steps.",
        isInternal: true,
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log("Seed complete");
  process.exit(0);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

