const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { updateProfile, changePassword } = require("../controllers/profileController");

const router = express.Router();

router.use(protect);

router.put("/profile", updateProfile);
router.put("/password", changePassword);

module.exports = router;

