const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { listCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");

const router = express.Router();

router.use(protect);

router.get("/", listCategories);
router.post("/", requireRole("admin"), createCategory);
router.put("/:id", requireRole("admin"), updateCategory);
router.delete("/:id", requireRole("admin"), deleteCategory);

module.exports = router;

