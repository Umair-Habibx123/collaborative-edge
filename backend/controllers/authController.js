// Thin HTTP layer for auth: parses requests, sets cookies, shapes responses.
// All business logic is delegated to authService. Wrapped with asyncHandler so
// thrown ApiErrors flow to the central error handler.
import { gfs } from "../gridfsConfig.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import * as authService from "../services/authService.js";

// Shared cookie options so login/logout stay in sync.
const baseCookie = { secure: true, sameSite: "None" };
const httpOnlyCookie = { ...baseCookie, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 };
const readableCookie = { ...baseCookie, httpOnly: false, maxAge: 24 * 60 * 60 * 1000 };
const AUTH_COOKIES = ["token", "id", "email", "role", "loggedIn"];

const clearAuthCookies = (res) =>
  AUTH_COOKIES.forEach((name) => res.clearCookie(name, baseCookie));

export const register = asyncHandler(async (req, res) => {
  const { _id, username, email, password, profilePic, role, status } = req.body;
  if (!_id || !username || !password || !email || !role) {
    throw new ApiError(400, "Missing required fields.");
  }
  const user = await authService.createUser({ _id, username, email, password, profilePic, role, status });
  res.status(201).json({ message: "User created successfully.", user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required.");

  const user = await authService.authenticate(email, password);

  if (req.cookies?.token) clearAuthCookies(res);

  const token = authService.issueToken(user);
  res.cookie("token", token, httpOnlyCookie);
  res.cookie("id", user._id, readableCookie);
  res.cookie("email", user.email, readableCookie);
  res.cookie("role", user.role, readableCookie);
  res.cookie("loggedIn", true, readableCookie);

  res.status(200).json({
    message: "Login successful!",
    user: {
      username: user.username,
      id: user._id,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
      status: user.status,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookies(res);
  res.status(200).json({ message: "Logged out successfully." });
});

export const getMyProfile = asyncHandler(async (req, res) => {
  // req.user is set by `protect`; re-fetch to include all role fields.
  const user = await authService.getUserById(req.user._id);
  if (user.status !== "verified") {
    clearAuthCookies(res);
    throw new ApiError(403, "User is not verified. Authentication cleared.");
  }
  res.status(200).json(await authService.buildUserProfile(user));
});

export const getOtherUserProfile = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) throw new ApiError(400, "Email is required.");
  const user = await authService.getUserByEmail(email);
  res.status(200).json(await authService.buildUserProfile(user));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { username, password, profilePic } = req.body;
  const user = await authService.updateUserProfile(req.user._id, { username, password, profilePic });
  const safeUser = user.toObject();
  delete safeUser.password;
  res.status(200).json({ message: "Profile updated successfully", user: safeUser });
});

export const listUsers = asyncHandler(async (req, res) => {
  const users = await authService.listAllUsers();
  res.status(200).json({ success: true, count: users.length, data: users });
});

export const getProfilePic = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const files = await gfs.find({ filename }).toArray();
  if (!files || files.length === 0) throw new ApiError(404, "File not found");
  gfs.openDownloadStreamByName(filename).pipe(res);
});
