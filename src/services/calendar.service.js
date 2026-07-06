import pool from "../config/db.js";

/**
 * Get all scheduled posts for a month
 */
export const getMonthlyCalendar = async (userId, year, month) => {
  const result = await pool.query(
    `
    SELECT
      c.id,
      c.title,
      c.status,
      c.caption,

      cp.platform_name,
      cp.content_type,
      cp.platform_status,
      cp.scheduled_at,

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
      AND cp.scheduled_at IS NOT NULL
      AND EXTRACT(YEAR FROM cp.scheduled_at) = $2
      AND EXTRACT(MONTH FROM cp.scheduled_at) = $3

    ORDER BY cp.scheduled_at ASC
    `,
    [userId, year, month]
  );

  return result.rows;
};

/**
 * Get scheduled posts for a specific day
 */
export const getDayCalendar = async (userId, date) => {
  const result = await pool.query(
    `
    SELECT
      c.id,
      c.title,
      c.caption,

      cp.platform_name,
      cp.content_type,
      cp.platform_status,
      cp.scheduled_at,

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
      AND DATE(cp.scheduled_at) = $2

    ORDER BY cp.scheduled_at ASC
    `,
    [userId, date]
  );

  return result.rows;
};

/**
 * Get upcoming scheduled posts
 */
export const getUpcomingPosts = async (userId, limit = 10) => {
  const result = await pool.query(
    `
    SELECT
      c.id,
      c.title,
      c.status,

      cp.platform_name,
      cp.content_type,
      cp.scheduled_at,

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
      AND cp.scheduled_at IS NOT NULL
      AND cp.scheduled_at >= NOW()

    ORDER BY cp.scheduled_at ASC

    LIMIT $2
    `,
    [userId, limit]
  );

  return result.rows;
};