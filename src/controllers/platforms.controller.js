import fs from "fs";
import {
  getPlatforms,
  getPlatform,
  disconnectPlatform,
  savePlatformConnection
} from "../services/platforms.service.js";

import {
  generateOAuthState,
  verifyOAuthState,
} from "../utils/oauthState.js";

import {
  generateYouTubeAuthUrl,
  exchangeCodeForTokens,
  getYouTubeChannel,
    uploadYouTubeVideo as uploadVideoService,

} from "../integrations/youtube/youtube.service.js";



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

   const state = generateOAuthState({
  userId: req.user.id,
  platform: service,
});

    let authUrl;

    switch (service) {
      case "youtube":
        authUrl = generateYouTubeAuthUrl(state);
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

/**
 * Google OAuth Callback
 */
export const googleOAuthCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message: "Invalid OAuth callback.",
      });
    }

const { userId, platform } =
  verifyOAuthState(state);

    switch (platform) {
      case "youtube": {
        const tokens = await exchangeCodeForTokens(code);

        const channel = await getYouTubeChannel(tokens);
        console.log(channel);

        await savePlatformConnection({
          userId,
          platformName: "youtube",
          tokens,
          channel,
        });

        break;
      }

      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported platform.",
        });
    }

    return res.redirect(
      "http://localhost:5173/platforms"
    );

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Upload Video to Connected YouTube Channel
 */
export const uploadYoutubeVideo = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video file is required.",
      });
    }

    const {
      title,
      description,
      tags,
      privacyStatus = "private",
      categoryId = "22",
      madeForKids = false,
    } = req.body;

    // Get connected YouTube account
    const platform =
      await getPlatform(
        req.user.id,
        "youtube"
      );

    if (
      !platform ||
      !platform.is_connected
    ) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message:
          "YouTube account not connected.",
      });
    }

    const tokens = {
      access_token:
        platform.access_token,

      refresh_token:
        platform.refresh_token,

      expiry_date:
        platform.token_expires_at?.getTime(),
    };

    const uploadedVideo =
      await uploadVideoService({
        tokens,

        filePath: req.file.path,

        title,

        description,

        tags: tags
          ? JSON.parse(tags)
          : [],

        privacyStatus,

        categoryId,

        madeForKids:
          madeForKids === "true",
      });

    // Delete temp file
    fs.unlinkSync(req.file.path);

    return res.status(200).json({
      success: true,
      message:
        "Video uploaded successfully.",

      data: uploadedVideo,
    });

  } catch (error) {
    console.error(error);

    // Remove temp file if upload fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};