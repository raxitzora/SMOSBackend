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
export const connectPlatform = async (userId, platformName) => {
  const existing = await getPlatform(userId, platformName);

  if (existing) {
    throw new Error(`${platformName} is already connected.`);
  }

  const result = await pool.query(
    `
    INSERT INTO platforms
    (
      user_id,
      platform_name,
      status,
      is_connected
    )
    VALUES
    (
      $1,
      $2,
      'pending',
      false
    )
    RETURNING *
    `,
    [userId, platformName]
  );

  return result.rows[0];
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