const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { listMyNotifications, readAll, readOne } = require("../controllers/notificationController");

const router = express.Router();

router.use(protect);

router.get("/", listMyNotifications);
router.put("/read-all", readAll);
router.put("/:id/read", readOne);

module.exports = router;

