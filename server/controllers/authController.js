const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { apiSuccess } = require("../utils/apiResponse");
const { signAccessToken, signRefreshToken } = require("../utils/generateToken");

function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }
  if (role && role !== "customer") {
    res.status(400);
    throw new Error("Only customer role allowed on register");
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    res.status(409);
    throw new Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name || "",
    email: email.toLowerCase().trim(),
    password: hashed,
    role: "customer",
  });

  const accessToken = signAccessToken({ id: user._id, role: user.role });
  const refreshToken = signRefreshToken({ id: user._id });

  user.refreshToken = refreshToken;
  await user.save();

  setRefreshCookie(res, refreshToken);

  return apiSuccess(res, {
    statusCode: 201,
    message: "Registered successfully",
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      accessToken,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.isActive) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const accessToken = signAccessToken({ id: user._id, role: user.role });
  const refreshToken = signRefreshToken({ id: user._id });
  user.refreshToken = refreshToken;
  await user.save();

  setRefreshCookie(res, refreshToken);

  return apiSuccess(res, {
    message: "Logged in",
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      accessToken,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    const user = await User.findOne({ refreshToken: token });
    if (user) {
      user.refreshToken = "";
      await user.save();
    }
  }
  clearRefreshCookie(res);
  return apiSuccess(res, { message: "Logged out" });
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    res.status(401);
    throw new Error("Missing refresh token");
  }

  const user = await User.findOne({ refreshToken: token });
  if (!user || !user.isActive) {
    res.status(401);
    throw new Error("Invalid refresh token");
  }

  try {
    jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    user.refreshToken = "";
    await user.save();
    res.status(401);
    throw new Error("Refresh token expired");
  }

  const newAccessToken = signAccessToken({ id: user._id, role: user.role });
  const newRefreshToken = signRefreshToken({ id: user._id });
  user.refreshToken = newRefreshToken;
  await user.save();

  setRefreshCookie(res, newRefreshToken);

  return apiSuccess(res, {
    message: "Token refreshed",
    data: { accessToken: newAccessToken },
  });
});

const me = asyncHandler(async (req, res) => {
  return apiSuccess(res, { data: { user: req.user }, message: "Me" });
});

module.exports = { register, login, logout, refreshToken, me };

