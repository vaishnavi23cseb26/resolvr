const asyncHandler = require("express-async-handler");

const Category = require("../models/Category");
const Ticket = require("../models/Ticket");
const { apiSuccess } = require("../utils/apiResponse");

const listCategories = asyncHandler(async (req, res) => {
  const items = await Category.find({}).sort({ name: 1 });
  return apiSuccess(res, { data: { items }, message: "Categories fetched" });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Name is required");
  }
  const exists = await Category.findOne({ name: name.trim() });
  if (exists) {
    res.status(409);
    throw new Error("Category already exists");
  }
  const category = await Category.create({
    name: name.trim(),
    description: description || "",
    color: color || "#6366f1",
  });
  return apiSuccess(res, { statusCode: 201, data: { category }, message: "Category created" });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  const { name, description, color } = req.body;
  if (name !== undefined) category.name = name.trim();
  if (description !== undefined) category.description = description;
  if (color !== undefined) category.color = color;
  await category.save();
  return apiSuccess(res, { data: { category }, message: "Category updated" });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  const inUse = await Ticket.exists({ category: category._id });
  if (inUse) {
    res.status(400);
    throw new Error("Category is in use by tickets");
  }
  await Category.deleteOne({ _id: category._id });
  return apiSuccess(res, { message: "Category deleted" });
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };

