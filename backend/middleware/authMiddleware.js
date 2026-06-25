// Authentication & authorization middleware.
//
// `protect`        - verifies the JWT (from cookie OR Authorization header),
//                    loads the user, ensures the account is verified, and
//                    attaches the sanitized user to req.user.
// `authorize(...)` - guards a route to one or more roles. Use after `protect`.
//
// Example:
//   router.get("/admin/stuff", protect, authorize("admin"), handler)

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const extractToken = (req) => {
  const header = req.headers["authorization"];
  if (header && header.startsWith("Bearer ")) return header.slice(7);
  if (header) return header; // tolerate raw token in header (legacy clients)
  return req.cookies?.token || req.query?.token || null;
};

export const protect = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User no longer exists." });
    }
    if (user.status !== "verified") {
      return res.status(403).json({ error: "Account is not verified." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  if (!roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ error: "Forbidden. You do not have access to this resource." });
  }
  next();
};

// Default export kept for backward compatibility with existing imports.
export default protect;
