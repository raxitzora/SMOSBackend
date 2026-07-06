import oauth2Client from "../../config/google.js";

export const generateYouTubeAuthUrl = () => {
  const scopes = [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    state: "youtube",
  });

  return authUrl;
};