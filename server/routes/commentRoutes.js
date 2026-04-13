const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { listComments, addComment } = require("../controllers/commentController");

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get("/", listComments);
router.post("/", addComment);

module.exports = router;

