import pool from "../config/db.js";

import { getDashboard } from "./dashboard.service.js";
import { getLibraryStats } from "./library.service.js";

/**
 * Build Complete AI Context
 */
export const getAIContext = async (userId) => {
  /* --------------------------
     User
  -------------------------- */

  const userResult = await pool.query(
    `
    SELECT
      id,
      first_name,
      last_name,
      email
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  if (!userResult.rows.length) {
    throw new Error("User not found.");
  }

  const user = userResult.rows[0];

  /* --------------------------
     Connected Platforms
  -------------------------- */

  const platformResult = await pool.query(
    `
    SELECT
      platform_name,
      is_connected
    FROM platforms
    WHERE user_id = $1
    `,
    [userId]
  );

  const connectedPlatforms = {
    youtube: false,
    instagram: false,
    facebook: false,
    linkedin: false,
    x: false,
    tiktok: false,
  };

  platformResult.rows.forEach((platform) => {
    connectedPlatforms[
      platform.platform_name
    ] = platform.is_connected;
  });

  /* --------------------------
     YouTube Dashboard
  -------------------------- */

  let youtube = null;

  if (connectedPlatforms.youtube) {
    try {
      youtube = await getDashboard(
        userId,
        "youtube"
      );
    } catch (error) {
      youtube = null;
    }
  }

  /* --------------------------
     Library
  -------------------------- */

  const library =
    await getLibraryStats(userId);

  /* --------------------------
     Final Context
  -------------------------- */

  return {
    user: {
      id: user.id,

      name: `${user.first_name} ${user.last_name}`,

      email: user.email,
    },

    connectedPlatforms,

    youtube,

    library,
  };
};