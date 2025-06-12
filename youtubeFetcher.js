import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

export const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

const ORDER_MAP = {
  relevance: 'relevance',
  time: 'time',
  rating: 'rating'
};

export async function fetchComments(videoId, maxComments = 100, sortBy = 'relevance', youtubeClient = youtube) {
  const comments = [];
  let pageToken;
  const order = ORDER_MAP[sortBy] || 'relevance';

  while (comments.length < maxComments) {
    const response = await youtubeClient.commentThreads.list({
      part: ['snippet'],
      videoId,
      maxResults: Math.min(100, maxComments - comments.length),
      pageToken,
      order
    });

    comments.push(
      ...response.data.items.map(item => ({
        id: item.id,
        text: item.snippet.topLevelComment.snippet.textDisplay,
        author: item.snippet.topLevelComment.snippet.authorDisplayName,
        publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
        likeCount: item.snippet.topLevelComment.snippet.likeCount,
        replyCount: item.snippet.totalReplyCount
      }))
    );

    pageToken = response.data.nextPageToken;
    if (!pageToken) break;
  }

  return comments;
}
