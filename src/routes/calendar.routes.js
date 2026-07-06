import express from "express";

import {
  getCalendar,
  getDay,
  getUpcoming,
} from "../controllers/calendar.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * Monthly Calendar
 */
router.get("/", protect, getCalendar);

/**
 * Single Day
 */
router.get("/day", protect, getDay);

/**
 * Upcoming Posts
 */
router.get("/upcoming", protect, getUpcoming);

export default router;