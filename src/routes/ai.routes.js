import express from "express";

import {
  sendMessage,
  getAllChats,
  getMessages,
  removeChat,
  voiceChat,
} from "../controllers/ai.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

import { uploadAudio } from "../middlewares/upload.middleware.js";
const router = express.Router();

/**
 * Send Message
 */
router.post(
  "/chat",
  protect,
  sendMessage
);

/**
 * Chat List
 */
router.get(
  "/chats",
  protect,
  getAllChats
);

/**
 * Chat Messages
 */
router.get(
  "/chats/:chatId",
  protect,
  getMessages
);

/**
 * Delete Chat
 */
router.delete(
  "/chats/:chatId",
  protect,
  removeChat
);

router.post(
  "/voice",
  protect,
  uploadAudio.single("audio"),
  voiceChat
);
export default router;