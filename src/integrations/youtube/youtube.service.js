import { google } from "googleapis";
import oauth2Client from "../../config/google.js";

/**
 * Generate YouTube OAuth URL
 */
export const generateYouTubeAuthUrl = (state) => {
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
  const { tokens } = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);

  return tokens;
};

/**
 * Create YouTube Client
 */
const getYouTubeClient = (tokens) => {
  oauth2Client.setCredentials(tokens);

  return google.youtube({
    version: "v3",
    auth: oauth2Client,
  });
};

/**
 * Convert ISO8601 Duration to Seconds
 */
const durationToSeconds = (duration) => {
  const match = duration.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  );

  if (!match) return 0;

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Get Authenticated Channel
 */
export const getYouTubeChannel = async (tokens) => {
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

  subscribers: Number(
    channel.statistics.subscriberCount || 0
  ),

  videos: Number(
    channel.statistics.videoCount || 0
  ),

  views: Number(
    channel.statistics.viewCount || 0
  ),

  uploadsPlaylistId:
    channel.contentDetails.relatedPlaylists.uploads,

  url: `https://www.youtube.com/channel/${channel.id}`,
};
};

/**
 * Get Latest Uploaded Videos
 */
export const getLatestVideos = async (
  tokens,
  limit = 10
) => {
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
    const duration = durationToSeconds(
      video.contentDetails.duration
    );

    return {
      id: video.id,

      title: video.snippet.title,

      description: video.snippet.description,

      thumbnail:
        video.snippet.thumbnails?.high?.url ||
        video.snippet.thumbnails?.medium?.url ||
        video.snippet.thumbnails?.default?.url,

      publishedAt: video.snippet.publishedAt,

      duration,

      contentType:
        duration <= 60 ? "short" : "video",



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
};