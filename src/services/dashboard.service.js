import pool from "../config/db.js";

/**
 * Get Dashboard Data
 */
export const getDashboard = async (userId, platform) => {
  // -----------------------------
  // Get Platform Details
  // -----------------------------
  const platformResult = await pool.query(
    `
    SELECT
      account_name,
      account_email,
      account_picture,
      is_connected,

      followers,
      subscribers,
      total_posts,
      total_views

    FROM platforms

    WHERE user_id = $1
      AND platform_name = $2
    `,
    [userId, platform]
  );

  if (platformResult.rows.length === 0) {
    throw new Error(`${platform} platform not found.`);
  }

  const platformData = platformResult.rows[0];

  // -----------------------------
  // Get Recent Posts
  // -----------------------------
  const recentPostsResult = await pool.query(
    `
    SELECT
      c.id,
      c.title,
      c.status,

      cp.content_type,
      cp.platform_status,
      cp.published_at,

      (
        SELECT file_url
        FROM content_assets
        WHERE content_id = c.id
          AND asset_type = 'thumbnail'
        LIMIT 1
      ) AS thumbnail

    FROM content c

    INNER JOIN content_platforms cp
      ON cp.content_id = c.id

    WHERE c.user_id = $1
      AND cp.platform_name = $2

    ORDER BY c.created_at DESC

    LIMIT 10
    `,
    [userId, platform]
  );

  // -----------------------------
  // Build Dashboard Response
  // -----------------------------
  return {
    account: {
      name: platformData.account_name,
      email: platformData.account_email,
      picture: platformData.account_picture,
      connected: platformData.is_connected,
    },

    stats: {
      followers: Number(platformData.followers),
      subscribers: Number(platformData.subscribers),
      totalPosts: Number(platformData.total_posts),
      totalViews: Number(platformData.total_views),
    },

    recentPosts: recentPostsResult.rows.map((post) => ({
      id: post.id,
      title: post.title,
      status: post.status,

      contentType: post.content_type,
      platformStatus: post.platform_status,

      publishedAt: post.published_at,

      thumbnail: post.thumbnail,

      // Placeholder metrics until live platform sync is implemented
      views: 0,
      likes: 0,
      comments: 0,
    })),
  };
};