import { google } from "googleapis";

/**
 * Create a new Google OAuth2 client
 * Each request gets its own client instance.
 */
export const createOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_CALLBACK_URL
  );
};