import express from "express";

import {
  getAllPlatforms,
  getSinglePlatform,
  disconnect,
  connectGooglePlatform,
  googleOAuthCallback,
  uploadYoutubeVideo,
} from "../controllers/platforms.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/google/connect", protect, connectGooglePlatform);

// Get all connected platforms
router.get("/google/callback", googleOAuthCallback);

router.get("/", protect, getAllPlatforms);

// Get single platform
router.get("/:platform", protect, getSinglePlatform);

// Disconnect platform
router.delete("/:platform/disconnect", protect, disconnect);

router.post(
  "/youtube/upload",
  protect,
  upload.single("video"),
  uploadYoutubeVideo
);

export default router;