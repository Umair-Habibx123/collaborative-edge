// Centralized security middleware for the Collaborative Edge API.
// Wires helmet, rate limiting, NoSQL-injection sanitization and HTTP
// parameter-pollution protection. Kept Express 5-safe: `req.query` is a
// read-only getter in Express 5, so we sanitize objects *in place* instead
// of reassigning them (which is what crashes express-mongo-sanitize).

import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

// Recursively strip keys that MongoDB query operators rely on ($ and .)
// to neutralize NoSQL injection via request payloads.
const sanitizeInPlace = (obj) => {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
      continue;
    }
    const value = obj[key];
    if (value && typeof value === "object") sanitizeInPlace(value);
  }
};

export const sanitizeRequest = (req, _res, next) => {
  // req.body and req.params are plain writable objects.
  sanitizeInPlace(req.body);
  sanitizeInPlace(req.params);
  // req.query is a getter in Express 5 — mutate its contents, don't replace it.
  if (req.query && typeof req.query === "object") sanitizeInPlace(req.query);
  next();
};

// General API limiter — protects every route from abuse / scraping.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Stricter limiter for authentication endpoints to slow brute-force attacks.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
});

// Apply all baseline protections in one call from index.js.
export const applySecurity = (app) => {
  app.use(
    helmet({
      // Allow cross-origin loading of GridFS images/files served by the API.
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false,
    })
  );
  app.use(hpp());
  app.use(sanitizeRequest);
};
