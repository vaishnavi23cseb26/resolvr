const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { listUsers, updateUserRole, toggleUserActive } = require("../controllers/userController");
const { adminStats } = require("../controllers/statsController");

const router = express.Router();

router.use(protect);
router.use(requireRole("admin"));

router.get("/users", listUsers);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/toggle", toggleUserActive);

router.get("/stats", adminStats);

module.exports = router;

