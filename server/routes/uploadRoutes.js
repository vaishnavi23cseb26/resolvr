const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
const { uploadToCloudinary } = require("../controllers/uploadController");

const router = express.Router();

router.post("/", protect, upload.single("file"), uploadToCloudinary);

module.exports = router;

