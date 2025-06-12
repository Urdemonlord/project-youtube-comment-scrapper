import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

const ORDER_MAP = {
  top: 'relevance',
  new: 'time'
};

export async function fetchComments(videoId, maxComments = 100, includeReplies = false, sortBy = 'top') {
  const order = ORDER_MAP[sortBy] || 'relevance';
  const comments = [];
  let pageToken;

  while (comments.length < maxComments) {
    const response = await youtube.commentThreads.list({
      part: includeReplies ? ['snippet', 'replies'] : ['snippet'],
      videoId,
      maxResults: Math.min(100, maxComments - comments.length),
      pageToken,
      order
    });

    for (const item of response.data.items) {
      if (comments.length >= maxComments) break;
      const top = item.snippet.topLevelComment.snippet;
      comments.push({
        id: item.id,
        text: top.textDisplay,
        author: top.authorDisplayName,
        publishedAt: top.publishedAt,
        likeCount: top.likeCount,
        replyCount: item.snippet.totalReplyCount
      });
      if (includeReplies && item.replies && item.replies.comments) {
        for (const reply of item.replies.comments) {
          if (comments.length >= maxComments) break;
          comments.push({
            id: reply.id,
            text: reply.snippet.textDisplay,
            author: reply.snippet.authorDisplayName,
            publishedAt: reply.snippet.publishedAt,
            likeCount: reply.snippet.likeCount,
            replyCount: 0
          });
        }
      }
    }

    pageToken = response.data.nextPageToken;
    if (!pageToken) break;
  }

  return comments;
}
