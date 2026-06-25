// Auth & user routes — thin wiring only. Logic lives in:
//   controllers/authController.js  (HTTP/cookies)
//   services/authService.js        (business logic)
//   validators/authValidator.js    (input validation)
import { Router } from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  register,
  login,
  logout,
  getMyProfile,
  getOtherUserProfile,
  updateProfile,
  listUsers,
  getProfilePic,
} from "../controllers/authController.js";
import { validate, registerRules, loginRules } from "../validators/authValidator.js";

const router = Router();

// --- Public ---
router.post("/insertUsers", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.post("/logout", logout);
router.get("/getProfilePic/:filename", getProfilePic);
router.get("/other-user-profile", getOtherUserProfile);

// --- Authenticated ---
router.get("/user-profile", protect, getMyProfile);
router.put("/updateProfile", protect, updateProfile);

// --- Admin ---
router.get("/fetchAllUsers", protect, authorize("admin"), listUsers);

export default router;
