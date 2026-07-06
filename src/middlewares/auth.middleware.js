import pool from "../config/db.js";
import { verifyToken } from "../utils/jwt.js";

export const protect = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    // Verify JWT
    const decoded = verifyToken(token);

    // Find user
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Attach user to request
    req.user = result.rows[0];

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};