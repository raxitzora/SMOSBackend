import express from "express";

import {
  getStats,
  getAllItems,
  getSingleItem,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/library.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * Content Library Stats
 */
router.get("/stats", protect, getStats);

/**
 * Get All Content
 */
router.get("/", protect, getAllItems);

/**
 * Get Single Content
 */
router.get("/:id", protect, getSingleItem);

/**
 * Create Content
 */
router.post("/", protect, createItem);

/**
 * Update Content
 */
router.put("/:id", protect, updateItem);

/**
 * Delete Content
 */
router.delete("/:id", protect, deleteItem);

export default router;