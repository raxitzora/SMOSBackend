import jwt from "jsonwebtoken";

/**
 * Generate signed OAuth state
 */
export const generateOAuthState = ({ userId, platform }) => {
  return jwt.sign(
    {
      userId,
      platform,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "10m",
    }
  );
};

/**
 * Verify signed OAuth state
 */
export const verifyOAuthState = (state) => {
  return jwt.verify(
    state,
    process.env.JWT_SECRET
  );
};