import { OAuth2Client } from "google-auth-library";
import pool from "../config/db.js";
import { generateToken } from "../utils/jwt.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (idToken) => {
  // Verify Google ID Token
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google token");
  }

  const {
    sub: googleId,
    given_name: firstName,
    family_name: lastName,
    email,
    picture,
  } = payload;

  // Check if user already exists
  const existingUser = await pool.query(
    "SELECT * FROM users WHERE google_id = $1",
    [googleId]
  );

  let user;

  if (existingUser.rows.length > 0) {
    user = existingUser.rows[0];
  } else {
    // Create new user
    const newUser = await pool.query(
      `INSERT INTO users
      (google_id, first_name, last_name, email, profile_picture)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
      [googleId, firstName, lastName, email, picture]
    );

    user = newUser.rows[0];
  }

  // Generate JWT
  const token = generateToken(user);

  return {
    user,
    token,
  };
};