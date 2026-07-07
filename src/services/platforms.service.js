import pool from "../config/db.js";

/**
 * Get all connected platforms of a user
 */
export const getPlatforms = async (userId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM platforms
    WHERE user_id = $1
    ORDER BY platform_name ASC
    `,
    [userId]
  );

  return result.rows;
};

/**
 * Get one platform
 */
export const getPlatform = async (userId, platformName) => {
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
 * Create platform connection
 * (OAuth implementation will come later)
 */


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
/**
 * Save or Update OAuth Platform Connection
 */
export const savePlatformConnection = async ({
  userId,
  platformName,
  tokens,
  channel,
}) => {
  const existing = await getPlatform(userId, platformName);

  if (existing) {
    const result = await pool.query(
      `
      UPDATE platforms
      SET
        account_id = $1,
        account_name = $2,
        account_picture = $3,
        account_url = $4,

        subscribers = $5,
        followers = $6,

        total_posts = $7,
        total_views = $8,

        access_token = $9,
        refresh_token = COALESCE($10, refresh_token),
        token_expires_at = TO_TIMESTAMP($11 / 1000.0),

        status = 'connected',
        is_connected = true,
        updated_at = CURRENT_TIMESTAMP

      WHERE
        user_id = $12
        AND platform_name = $13

      RETURNING *
      `,
      [
        channel.id,
        channel.title,
        channel.thumbnail,
        channel.url,

        channel.subscribers,
        channel.subscribers,

        channel.videos,
        channel.views,

        tokens.access_token,
        tokens.refresh_token,
        tokens.expiry_date,

        userId,
        platformName,
      ]
    );

    return result.rows[0];
  }

  const result = await pool.query(
    `
    INSERT INTO platforms
    (
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
      is_connected
    )
    VALUES
    (
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
      true
    )
    RETURNING *
    `,
    [
      userId,
      platformName,

      channel.id,
      channel.title,
      channel.thumbnail,
      channel.url,

      channel.subscribers,
      channel.subscribers,

      channel.videos,
      channel.views,

      tokens.access_token,
      tokens.refresh_token,
      tokens.expiry_date,
    ]
  );

  return result.rows[0];
};