const asyncHandler = require("express-async-handler");

const User = require("../models/User");
const { apiSuccess } = require("../utils/apiResponse");

const listUsers = asyncHandler(async (req, res) => {
  const items = await User.find({}).select("-password -refreshToken").sort({ createdAt: -1 });
  return apiSuccess(res, { data: { items }, message: "Users fetched" });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!role || !["customer", "agent", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.role = role;
  await user.save();

  const safe = await User.findById(user._id).select("-password -refreshToken");
  return apiSuccess(res, { data: { user: safe }, message: "Role updated" });
});

const toggleUserActive = asyncHandler(async (req, res) => {
  if (String(req.user._id) === String(req.params.id)) {
    res.status(400);
    throw new Error("You cannot deactivate yourself");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.isActive = !user.isActive;
  if (!user.isActive) user.refreshToken = "";
  await user.save();

  const safe = await User.findById(user._id).select("-password -refreshToken");
  return apiSuccess(res, { data: { user: safe }, message: user.isActive ? "User activated" : "User deactivated" });
});

module.exports = { listUsers, updateUserRole, toggleUserActive };

