import { z } from 'zod';

// YouTube video ID validator
export const videoIdSchema = z.string()
  .min(11, 'YouTube video ID must be at least 11 characters')
  .max(11, 'YouTube video ID must be at most 11 characters')
  .regex(/^[a-zA-Z0-9_-]{11}$/, 'Invalid YouTube video ID format');

// Analysis prompt validator
export const analysisPromptSchema = z.string()
  .max(500, 'Analysis prompt must be at most 500 characters')
  .optional();

// Combined schema for analysis request
export const analysisRequestSchema = z.object({
  videoId: videoIdSchema,
  analysisPrompt: analysisPromptSchema
});

// Validate a YouTube video URL and extract the ID
export function extractVideoId(url: string): string | null {
  // Handle various YouTube URL formats
  const regexes = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/user\/\S+\/\S+\/|youtube\.com\/user\/\S+\/|youtube\.com\/\S+\/\S+\/|youtube\.com\/\S+\/|youtube\.com\/attribution_link\?a=\S+&u=\/watch\?v=|youtube\.com\/attribution_link\?a=\S+&u=%2Fwatch%3Fv%3D|youtube\.com\/attribution_link\?u=%2Fwatch%3Fv%3D|youtube\.com\/attribution_link\?u=\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/
  ];

  for (const regex of regexes) {
    const match = url.match(regex);
    if (match) {
      return match[1];
    }
  }

  // If the input is exactly 11 characters and matches the video ID format, assume it's a valid ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
}

// Validate input and sanitize
export function sanitizeInput(input: string): string {
  // Remove potential HTML/script tags
  return input
    .replace(/<[^>]*>/g, '')
    .trim();
}