import pool from "../config/db.js";

/**
 * Get dashboard stats for Content Library
 */
export const getLibraryStats = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'draft') AS drafts,
      COUNT(*) FILTER (WHERE status = 'scheduled') AS scheduled,
      COUNT(*) FILTER (WHERE status = 'published') AS published
    FROM content
    WHERE user_id = $1
    `,
    [userId]
  );

  return {
  total: Number(result.rows[0].total),
  drafts: Number(result.rows[0].drafts),
  scheduled: Number(result.rows[0].scheduled),
  published: Number(result.rows[0].published),
};
};

/**
 * Get all content
 */
export const getLibraryItems = async (
  userId,
  {
    page = 1,
    limit = 12,
    search = "",
    status = "",
    platform = "",
  } = {}
) => {
  const offset = (page - 1) * limit;

  let whereClause = `WHERE c.user_id = $1`;
  const values = [userId];
  let index = 2;

  if (search) {
    whereClause += ` AND c.title ILIKE $${index}`;
    values.push(`%${search}%`);
    index++;
  }

  if (status) {
    whereClause += ` AND c.status = $${index}`;
    values.push(status);
    index++;
  }

  if (platform) {
    whereClause += ` AND cp.platform_name = $${index}`;
    values.push(platform);
    index++;
  }

  // Total Records
  const totalQuery = `
    SELECT COUNT(DISTINCT c.id) AS total
    FROM content c
    LEFT JOIN content_platforms cp
    ON cp.content_id = c.id
    ${whereClause}
  `;

  const totalResult = await pool.query(totalQuery, values);
  const total = Number(totalResult.rows[0].total);

  // Pagination
  values.push(limit);
  values.push(offset);

  const dataQuery = `
    SELECT
      c.id,
      c.title,
      c.description,
      c.caption,
      c.hashtags,
      c.status,
      c.created_at,

      cp.platform_name,
      cp.content_type,
      cp.platform_status,

      (
        SELECT file_url
        FROM content_assets
        WHERE content_id = c.id
          AND asset_type = 'thumbnail'
        LIMIT 1
      ) AS thumbnail

    FROM content c

    LEFT JOIN content_platforms cp
      ON cp.content_id = c.id

    ${whereClause}

    ORDER BY c.created_at DESC

    LIMIT $${index}
    OFFSET $${index + 1}
  `;

  const result = await pool.query(dataQuery, values);

  return {
    items: result.rows,

    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single content
 */
export const getLibraryItem = async (userId, contentId) => {
  const contentResult = await pool.query(
    `
    SELECT *
    FROM content
    WHERE id = $1
      AND user_id = $2
    `,
    [contentId, userId]
  );

  if (contentResult.rows.length === 0) {
    return null;
  }

  const platformsResult = await pool.query(
    `
    SELECT *
    FROM content_platforms
    WHERE content_id = $1
    `,
    [contentId]
  );

  const assetsResult = await pool.query(
    `
    SELECT *
    FROM content_assets
    WHERE content_id = $1
    `,
    [contentId]
  );

  return {
    ...contentResult.rows[0],
    platforms: platformsResult.rows,
    assets: assetsResult.rows,
  };
};

export const createLibraryItem = async ({
  userId,
  title,
  description,
  caption,
  hashtags,
  status,
  platforms,
  assets,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Create content
    const contentResult = await client.query(
      `
      INSERT INTO content
      (
        user_id,
        title,
        description,
        caption,
        hashtags,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        userId,
        title,
        description,
        caption,
        hashtags,
        status || "draft",
      ]
    );

    const content = contentResult.rows[0];

    // Save selected platforms
    if (platforms?.length) {
      for (const platform of platforms) {
        await client.query(
          `
       INSERT INTO content_platforms
(
    content_id,
    platform_name,
    content_type,
    platform_status,
    scheduled_at
)
VALUES ($1,$2,$3,$4,$5)
          `,
       [
    content.id,
    platform.platform_name,
    platform.content_type,
    status || "draft",
    platform.scheduled_at || null,
]
        );
      }
    }

    // Save uploaded assets
    if (assets?.length) {
      for (const asset of assets) {
        await client.query(
          `
          INSERT INTO content_assets
          (
            content_id,
            asset_type,
            file_name,
            file_url
          )
          VALUES ($1,$2,$3,$4)
          `,
          [
            content.id,
            asset.asset_type,
            asset.file_name,
            asset.file_url,
          ]
        );
      }
    }

    await client.query("COMMIT");

    return content;

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateLibraryItem = async (
  userId,
  contentId,
  data
) => {
  const result = await pool.query(
    `
    UPDATE content
    SET
      title = $1,
      description = $2,
      caption = $3,
      hashtags = $4,
      status = $5,
      updated_at = NOW()
    WHERE id = $6
    AND user_id = $7
    RETURNING *
    `,
    [
      data.title,
      data.description,
      data.caption,
      data.hashtags,
      data.status,
      contentId,
      userId,
    ]
  );

  return result.rows[0];
};

export const deleteLibraryItem = async (
  userId,
  contentId
) => {
  const result = await pool.query(
    `
    DELETE FROM content
    WHERE id = $1
    AND user_id = $2
    RETURNING *
    `,
    [contentId, userId]
  );

  return result.rows[0];
};