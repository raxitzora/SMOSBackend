import pool from "../config/db.js";

import {
  getLatestVideos,
} from "../integrations/youtube/youtube.service.js";

/**
 * Get Dashboard Data
 */
export const getDashboard = async (
  userId,
  platform
) => {
  const result = await pool.query(
    `
    SELECT
      account_name,
      account_email,
      account_picture,

      access_token,
      refresh_token,
      token_expires_at,

      is_connected,

      followers,
      subscribers,
      total_posts,
      total_views

    FROM platforms

    WHERE
      user_id = $1
      AND platform_name = $2

    LIMIT 1
    `,
    [userId, platform]
  );

  if (result.rows.length === 0) {
    throw new Error(`${platform} platform not found.`);
  }

  const platformData = result.rows[0];

  // -----------------------------
  // Fetch Latest Videos Live
  // -----------------------------

  let recentPosts = [];

  if (
    platform === "youtube" &&
    platformData.access_token
  ) {
    recentPosts = await getLatestVideos({
      access_token: platformData.access_token,
      refresh_token: platformData.refresh_token,
      expiry_date:
        platformData.token_expires_at?.getTime(),
    });
  }

  // -----------------------------
  // Dashboard Response
  // -----------------------------

  return {
account: {
  id: platformData.account_id,
  url: platformData.account_url,
  name: platformData.account_name,
  email: platformData.account_email,
  picture: platformData.account_picture,
  connected: platformData.is_connected,
},

    stats: {
      followers: Number(
        platformData.followers || 0
      ),

      subscribers: Number(
        platformData.subscribers || 0
      ),

      totalPosts: Number(
        platformData.total_posts || 0
      ),

      totalViews: Number(
        platformData.total_views || 0
      ),
    },

    recentPosts,
  };
};