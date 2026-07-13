import {
  getYouTubeChannel,
  getLatestVideos,
} from "../youtube/youtube.service.js";

import pool from "../../config/db.js";

/* ===========================================
   Get Connected YouTube Tokens
=========================================== */

const getYouTubeTokens = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      access_token,
      refresh_token,
      token_expires_at

    FROM platforms

    WHERE
      user_id = $1
      AND platform_name = 'youtube'
      AND is_connected = true

    LIMIT 1
    `,
    [userId]
  );

  if (!result.rows.length) {
    throw new Error(
      "YouTube account is not connected."
    );
  }

  return {
    access_token:
      result.rows[0].access_token,

    refresh_token:
      result.rows[0].refresh_token,

    expiry_date:
      result.rows[0]
        .token_expires_at?.getTime(),
  };
};

/* ===========================================
   Execute Tool
=========================================== */

export const executeTool = async ({
  userId,
  tool,
  args = {},
}) => {

  switch (tool) {

    /* -------------------------
       YouTube Channel
    ------------------------- */

    case "youtube.channel": {

      const tokens =
        await getYouTubeTokens(userId);

      return await getYouTubeChannel(
        tokens
      );
    }

    /* -------------------------
       Latest Videos
    ------------------------- */

    case "youtube.latestVideos": {

      const tokens =
        await getYouTubeTokens(userId);

      return await getLatestVideos(
        tokens,
        args.limit || 5
      );
    }

    /* -------------------------
       Library Stats
    ------------------------- */

    case "library.stats": {

      const result = await pool.query(
        `
        SELECT

          COUNT(*) AS total,

          COUNT(*) FILTER (
            WHERE status='draft'
          ) AS drafts,

          COUNT(*) FILTER (
            WHERE status='scheduled'
          ) AS scheduled,

          COUNT(*) FILTER (
            WHERE status='published'
          ) AS published

        FROM content

        WHERE user_id = $1
        `,
        [userId]
      );

      return result.rows[0];
    }

    /* -------------------------
       Dashboard Summary
    ------------------------- */

    case "dashboard.summary": {

      const platformResult =
        await pool.query(
          `
          SELECT
            platform_name,
            account_name,
            followers,
            subscribers,
            total_posts,
            total_views

          FROM platforms

          WHERE user_id = $1
          `,
          [userId]
        );

      return platformResult.rows;
    }

    default:
      throw new Error(
        `Unknown Tool: ${tool}`

        
      );
  }
};