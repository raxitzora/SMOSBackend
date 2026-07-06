import {
  getPlatforms,
  getPlatform,
  connectPlatform,
  disconnectPlatform,
} from "../services/platforms.service.js";

import { generateYouTubeAuthUrl } from "../integrations/youtube/youtube.service.js";

/**
 * Get all connected platforms
 */
export const getAllPlatforms = async (req, res) => {
  try {
    const platforms = await getPlatforms(req.user.id);

    return res.status(200).json({
      success: true,
      data: platforms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get single platform
 */
export const getSinglePlatform = async (req, res) => {
  try {
    const { platform } = req.params;

    const platformData = await getPlatform(req.user.id, platform);

    if (!platformData) {
      return res.status(404).json({
        success: false,
        message: "Platform not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: platformData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Connect platform
 */
export const connect = async (req, res) => {
  try {
    const { platform } = req.params;

    const connectedPlatform = await connectPlatform(req.user.id, platform);

    return res.status(201).json({
      success: true,
      message: `${platform} connection initialized.`,
      data: connectedPlatform,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Disconnect platform
 */
export const disconnect = async (req, res) => {
  try {
    const { platform } = req.params;

    const disconnectedPlatform = await disconnectPlatform(
      req.user.id,
      platform
    );

    return res.status(200).json({
      success: true,
      message: `${platform} disconnected successfully.`,
      data: disconnectedPlatform,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Generate Google OAuth URL
 */
export const connectGooglePlatform = async (req, res) => {
  try {
    const { service } = req.query;

    if (!service) {
      return res.status(400).json({
        success: false,
        message: "Service is required.",
      });
    }

    let authUrl;

    switch (service) {
      case "youtube":
        authUrl = generateYouTubeAuthUrl();
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported Google service.",
        });
    }

    return res.status(200).json({
      success: true,
      authUrl,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};