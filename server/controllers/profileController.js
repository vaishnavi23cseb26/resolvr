const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const { apiSuccess } = require("../utils/apiResponse");

const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (name !== undefined) user.name = String(name);
  if (avatar !== undefined) user.avatar = String(avatar);

  await user.save();
  const safe = await User.findById(user._id).select("-password -refreshToken");
  return apiSuccess(res, { data: { user: safe }, message: "Profile updated" });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("currentPassword and newPassword are required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.refreshToken = "";
  await user.save();

  return apiSuccess(res, { message: "Password changed. Please login again." });
});

module.exports = { updateProfile, changePassword };

