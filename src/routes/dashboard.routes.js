import express from "express";

import { getDashboardData } from "../controllers/dashboard.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * Dashboard
 */
router.get("/:platform", protect, getDashboardData);

export default router;