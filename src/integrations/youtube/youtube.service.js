import { google } from "googleapis";
import { createOAuthClient } from "../../config/google.js";
import fs from "fs";

/**
 * Convert Google API errors into user-friendly errors.
 */
const handleGoogleApiError = (error) => {
  const status = error?.code || error?.response?.status;

  switch (status) {
    case 400:
      throw new Error("Invalid request sent to YouTube.");

    case 401:
      throw new Error(
        "Your YouTube connection has expired. Please reconnect your account."
      );

    case 403:
      throw new Error(
        "YouTube access was denied or API quota has been exceeded."
      );

    case 404:
      throw new Error("Requested YouTube resource was not found.");

    case 429:
      throw new Error(
        "Too many requests were sent to YouTube. Please try again later."
      );

    case 500:
    case 502:
    case 503:
      throw new Error(
        "YouTube is temporarily unavailable. Please try again later."
      );

    default:
      console.error("Google API Error:", error);

      throw new Error(
        "Unexpected error communicating with YouTube."
      );
  }
};

/**
 * Generate YouTube OAuth URL
 */
export const generateYouTubeAuthUrl = (state) => {
  const oauth2Client = createOAuthClient();

  const scopes = [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    state,
  });
};

/**
 * Exchange authorization code for tokens
 */
export const exchangeCodeForTokens = async (code) => {
  try {
    const oauth2Client = createOAuthClient();

    const { tokens } = await oauth2Client.getToken(code);

    return tokens;
  } catch (error) {
    handleGoogleApiError(error);
  }
};

/**
 * Create YouTube Client
 */
const getYouTubeClient = (tokens) => {
  const oauth2Client = createOAuthClient();

  oauth2Client.setCredentials(tokens);

  return google.youtube({
    version: "v3",
    auth: oauth2Client,
  });
};




/**
 * Get Authenticated Channel
 */
export const getYouTubeChannel = async (tokens) => {
  try {
    const youtube = getYouTubeClient(tokens);

    const response = await youtube.channels.list({
      part: ["snippet", "statistics", "contentDetails"],
      mine: true,
    });

    if (!response.data.items?.length) {
      throw new Error("No YouTube channel found.");
    }

    const channel = response.data.items[0];

    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail:
        channel.snippet.thumbnails?.high?.url ||
        channel.snippet.thumbnails?.default?.url ||
        null,
      subscribers: Number(channel.statistics.subscriberCount || 0),
      videos: Number(channel.statistics.videoCount || 0),
      views: Number(channel.statistics.viewCount || 0),
      uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
      url: `https://www.youtube.com/channel/${channel.id}`,
    };
  } catch (error) {
    handleGoogleApiError(error);
  }
};

/**
 * Get Latest Uploaded Videos
 */
export const getLatestVideos = async (
  tokens,
  limit = 10
) => {
  try {
    const youtube = getYouTubeClient(tokens);

    const channel = await getYouTubeChannel(tokens);

    // Upload playlist
    const uploads = await youtube.playlistItems.list({
      part: ["snippet"],
      playlistId: channel.uploadsPlaylistId,
      maxResults: limit,
    });

    if (!uploads.data.items?.length) {
      return [];
    }

    const videoIds = uploads.data.items
      .map((video) => video.snippet.resourceId.videoId)
      .join(",");

    const videos = await youtube.videos.list({
      part: [
        "snippet",
        "contentDetails",
        "statistics",
      ],
      id: videoIds,
    });

    return videos.data.items.map((video) => {
      return {
        id: video.id,

        title: video.snippet.title,

        description: video.snippet.description,

        thumbnail:
          video.snippet.thumbnails?.high?.url ||
          video.snippet.thumbnails?.medium?.url ||
          video.snippet.thumbnails?.default?.url,

        publishedAt: video.snippet.publishedAt,

        views: Number(
          video.statistics.viewCount || 0
        ),

        likes: Number(
          video.statistics.likeCount || 0
        ),

        comments: Number(
          video.statistics.commentCount || 0
        ),

        url: `https://www.youtube.com/watch?v=${video.id}`,
      };
    });
  } catch (error) {
    handleGoogleApiError(error)
  }
};




/**
 * Upload Video to YouTube
 */
export const uploadYouTubeVideo = async ({
  tokens,
  filePath,
  title,
  description,
  tags = [],
  privacyStatus = "private",
  categoryId = "22", // People & Blogs
  madeForKids = false,
}) => {
  try {
    const youtube = getYouTubeClient(tokens);

    const response = await youtube.videos.insert({
      part: [
        "snippet",
        "status",
      ],

      requestBody: {
        snippet: {
          title,
          description,
          tags,
          categoryId,
        },

        status: {
          privacyStatus,
          selfDeclaredMadeForKids: madeForKids,
        },
      },

      media: {
        body: fs.createReadStream(filePath),
      },
    });

    const video = response.data;

    return {
      id: video.id,

      url: `https://www.youtube.com/watch?v=${video.id}`,

      title,

      privacyStatus,

      uploaded: true,
    };
  } catch (error) {
    // You can handle or log the error here if needed
    handleGoogleApiError(error);
  }
};

export const publishToYouTube = async ({
    platform,
    filePath,
    title,
    description,
    tags,
    privacyStatus,
    categoryId,
    madeForKids,
}) => {

    const tokens = {
        access_token: platform.access_token,
        refresh_token: platform.refresh_token,
        expiry_date: platform.token_expires_at?.getTime(),
    };

    return uploadYouTubeVideo({
        tokens,
        filePath,
        title,
        description,
        tags,
        privacyStatus,
        categoryId,
        madeForKids,
    });
};