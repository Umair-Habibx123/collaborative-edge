// AI assistant: forwards a chat to Google Gemini on the server, so the API key never
// reaches the browser. Only signed-in users can call it, and it is rate limited.
//
// POST /api/ai/chat
//   body: { history: [{ role: "user" | "model", parts: [{ text }] }],
//           message: string,
//           images: [{ data: base64, mimeType: "image/png" | ... }] }
//   reply: Gemini's server-sent events stream (text/event-stream), passed through as is.

import express from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MAX_HISTORY = 30;           // earlier turns sent for context
const MAX_TEXT = 8000;            // characters per message
const MAX_IMAGES = 4;
const MAX_IMAGE_BASE64 = 7_000_000; // about 5 MB per image
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages. Please wait a minute and try again." },
});

const asText = (value) => (typeof value === "string" ? value.slice(0, MAX_TEXT) : "");

function cleanHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-MAX_HISTORY)
    .filter((turn) => turn && (turn.role === "user" || turn.role === "model") && Array.isArray(turn.parts))
    .map((turn) => ({
      role: turn.role,
      parts: turn.parts.map((part) => ({ text: asText(part?.text) })).filter((part) => part.text),
    }))
    .filter((turn) => turn.parts.length > 0);
}

function cleanImages(images) {
  if (!Array.isArray(images)) return [];
  return images
    .slice(0, MAX_IMAGES)
    .filter((img) => img && IMAGE_TYPES.has(img.mimeType) && typeof img.data === "string" && img.data.length <= MAX_IMAGE_BASE64)
    .map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data } }));
}

router.post("/ai/chat", protect, chatLimiter, async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "The AI assistant isn't set up on this server." });
  }

  const { history, message, images } = req.body ?? {};
  const imageParts = cleanImages(images);
  const text = asText(message) || (imageParts.length ? "Please describe or analyze these images" : "");
  if (!text) {
    return res.status(400).json({ error: "Type a message or attach an image." });
  }

  // Gemini expects the conversation to start with the user.
  const past = cleanHistory(history);
  while (past.length && past[0].role !== "user") past.shift();

  const body = {
    contents: [...past, { role: "user", parts: [{ text }, ...imageParts] }],
    generationConfig: { maxOutputTokens: 1000, temperature: 1.9 },
  };

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(body),
      }
    );

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      console.error(`Gemini request failed (${upstream.status}):`, detail.slice(0, 500));
      return res.status(502).json({ error: "The AI service couldn't answer right now. Please try again." });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");
    for await (const chunk of upstream.body) {
      res.write(chunk);
    }
    res.end();
  } catch (error) {
    console.error("Gemini request error:", error);
    if (!res.headersSent) {
      res.status(502).json({ error: "The AI service couldn't answer right now. Please try again." });
    } else {
      res.end();
    }
  }
});

export default router;
