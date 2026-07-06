import express from "express";

import {
  getAllPlatforms,
  getSinglePlatform,
  connect,
  disconnect,
  connectGooglePlatform,
} from "../controllers/platforms.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/google/connect", protect, connectGooglePlatform);


// Get all connected platforms
router.get("/", protect, getAllPlatforms);

// Get single platform
router.get("/:platform", protect, getSinglePlatform);

// Connect platform
router.post("/:platform/connect", protect, connect);

// Disconnect platform
router.delete("/:platform/disconnect", protect, disconnect);

export default router;