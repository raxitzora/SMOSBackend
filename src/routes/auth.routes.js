import express from "express";

import {
  loginWithGoogle,
  getCurrentUser,
  logout,

  //FOR DEVELOPER ONLY
  devLogin,
} from "../controllers/auth.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Google Login
router.post("/google", loginWithGoogle);

//FOR DEVELOPER ONLY
router.post("/dev-login", devLogin);

// Get Logged In User
router.get("/me", protect, getCurrentUser);

// Logout
router.post("/logout", logout);

export default router;