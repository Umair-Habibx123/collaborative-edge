// express-validator chains + a runner middleware for the auth routes.
// Keeps validation declarative and out of the controllers.
import { body, validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, "Validation failed", errors.array().map((e) => e.msg)));
  }
  next();
};

export const registerRules = [
  body("_id").notEmpty().withMessage("_id is required"),
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("A valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["student", "teacher", "industry", "admin"]).withMessage("Invalid role"),
];

export const loginRules = [
  body("email").isEmail().withMessage("A valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];
