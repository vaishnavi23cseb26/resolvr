const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  listTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
  updateTicketStatus,
  assignTicket,
  getTicketActivity,
} = require("../controllers/ticketController");

const router = express.Router();
const commentRoutes = require("./commentRoutes");

router.use(protect);

router.route("/").get(listTickets).post(createTicket);

router.use("/:id/comments", commentRoutes);

router.get("/:id/activity", getTicketActivity);

router.route("/:id").get(getTicketById).put(updateTicket).delete(requireRole("admin"), deleteTicket);

router.put("/:id/status", requireRole("agent", "admin"), updateTicketStatus);
router.put("/:id/assign", requireRole("admin"), assignTicket);

module.exports = router;

