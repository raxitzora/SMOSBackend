import pool from "../config/db.js";

/**
 * Get all connected platforms of a user
 */
export const getPlatforms = async (userId) => {
  const result = await pool.query(
    `
  SELECT
    id,
    platform_name,

    account_id,
    account_name,
    account_email,
    account_username,
    account_picture,
    account_url,

    followers,
    subscribers,

    total_posts,
    total_views,

    status,
    is_connected,

    created_at,
    updated_at

FROM platforms
WHERE user_id = $1
ORDER BY platform_name ASC
    `,
    [userId]
  );

  return result.rows;
};



export const getPlatform = async (
  userId,
  platformName
) => {
  const result = await pool.query(
    `
    SELECT
      id,
      platform_name,

      account_id,
      account_name,
      account_email,
      account_username,
      account_picture,
      account_url,

      followers,
      subscribers,

      total_posts,
      total_views,

      status,
      is_connected,

      created_at,
      updated_at

    FROM platforms

    WHERE
      user_id = $1
      AND platform_name = $2

    LIMIT 1
    `,
    [userId, platformName]
  );

  return result.rows[0] || null;
};


/**
 * Get platform including OAuth tokens.
 * Internal use only.
 */
export const getPlatformWithTokens = async (userId, platformName) => {
  const result = await pool.query(
    `
    SELECT *
    FROM platforms
    WHERE user_id = $1
    AND platform_name = $2
    LIMIT 1
    `,
    [userId, platformName]
  );

  return result.rows[0] || null;
};



/**
 * Disconnect platform
 */
export const disconnectPlatform = async (userId, platformName) => {
  const result = await pool.query(
    `
    UPDATE platforms
    SET
      is_connected = false,
      status = 'disconnected',
      access_token = NULL,
      refresh_token = NULL,
      token_expires_at = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE
      user_id = $1
      AND platform_name = $2
    RETURNING *
    `,
    [userId, platformName]
  );

  if (result.rows.length === 0) {
    throw new Error("Platform not found.");
  }

  return result.rows[0];
};

/**
 * Save or update OAuth platform connection
 */

export const savePlatformConnection = async ({
  userId,
  platformName,
  tokens,
  channel,
}) => {
  const result = await pool.query(
    `
    INSERT INTO platforms (
      user_id,
      platform_name,

      account_id,
      account_name,
      account_picture,
      account_url,

      subscribers,
      followers,

      total_posts,
      total_views,

      access_token,
      refresh_token,
      token_expires_at,

      status,
      is_connected,
      updated_at
    )
    VALUES (
      $1,
      $2,

      $3,
      $4,
      $5,
      $6,

      $7,
      $8,

      $9,
      $10,

      $11,
      $12,
      TO_TIMESTAMP($13 / 1000.0),

      'connected',
      true,
      CURRENT_TIMESTAMP
    )

    ON CONFLICT (user_id, platform_name)

    DO UPDATE SET
      account_id = EXCLUDED.account_id,
      account_name = EXCLUDED.account_name,
      account_picture = EXCLUDED.account_picture,
      account_url = EXCLUDED.account_url,

      subscribers = EXCLUDED.subscribers,
      followers = EXCLUDED.followers,

      total_posts = EXCLUDED.total_posts,
      total_views = EXCLUDED.total_views,

      access_token = EXCLUDED.access_token,

      refresh_token = COALESCE(
        EXCLUDED.refresh_token,
        platforms.refresh_token
      ),

      token_expires_at = EXCLUDED.token_expires_at,

      status = 'connected',

      is_connected = true,

      updated_at = CURRENT_TIMESTAMP

    RETURNING *;
    `,
    [
      userId,
      platformName,

      channel.id,
      channel.title,
      channel.thumbnail,
      channel.url,

      channel.subscribers,
      null,

      channel.videos,
      channel.views,

      tokens.access_token,
      tokens.refresh_token,
      tokens.expiry_date,
    ]
  );

  return result.rows[0];
};