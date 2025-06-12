import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import {
  addModel,
  listModels,
  activateModel,
  deleteModel,
  getActiveModel,
  MODELS_DIR,
} from './modelManager.js';
import { analyzeWithIndoBert } from './indoBertAnalyzer.js';

dotenv.config();

if (process.env.NODE_ENV === "production" && process.env.DEBUG !== "true") {
  console.log = () => {};
}

const app = express();
const port = 3000;

const upload = multer({
  dest: MODELS_DIR,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pkl', '.pt', '.h5', '.joblib'];
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Unsupported model format'));
  },
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize API keys with validation
if (!process.env.YOUTUBE_API_KEY || !process.env.GEMINI_API_KEY) {
  console.error('❌ Error: Missing required API keys in .env file');
  console.error('Please create a .env file with YOUTUBE_API_KEY and GEMINI_API_KEY');
  process.exit(1);
}

// Debug: Show first 10 characters of API keys for troubleshooting
console.log(`🔑 YouTube API Key: ${process.env.YOUTUBE_API_KEY.substring(0, 10)}...`);
console.log(`🔑 Gemini API Key: ${process.env.GEMINI_API_KEY.substring(0, 10)}...`);

// ⚠️  WARNING: Check if using compromised keys
const COMPROMISED_KEY_PREFIX = 'AIzaSyCHzP';
if (process.env.YOUTUBE_API_KEY.startsWith(COMPROMISED_KEY_PREFIX)) {
  console.error('🚨 WARNING: You are using a COMPROMISED API key!');
  console.error('🚨 This key was previously exposed in public code and may be disabled.');
  console.error('🚨 Please generate NEW API keys immediately!');
  console.error('🚨 YouTube API: https://console.cloud.google.com/apis/credentials');
  console.error('🚨 Gemini API: https://makersuite.google.com/app/apikey');
}

// Initialize YouTube API client
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// Initialize Gemini API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Extracts the first balanced JSON object from a string
function extractBalancedJson(str) {
  const start = str.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    const char = str[i];
    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth === 0) return str.slice(start, i + 1);
    }
  }
  return null;
}

// Safely parse JSON with cleanup and fallback evaluation
function parseJsonSafe(str) {
  const attempts = [];
  attempts.push(str);
  attempts.push(
    str
      .replace(/```(?:json)?/gi, '') // strip code fences
      .replace(/,\s*(?=[}\]])/g, '') // remove trailing commas
      .replace(/[\u0000-\u001F\u007F-\u009F]+/g, '') // remove control chars
  );

  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt);
    } catch {}
  }

  for (const attempt of attempts) {
    try {
      // eslint-disable-next-line no-new-func
      return Function('return (' + attempt + ')')();
    } catch {}
  }

  throw new Error('Unable to parse JSON');
}

// Helper function to analyze text with Gemini API for sentiment and toxicity
async function analyzeWithGemini(texts, analysisPrompt = '') {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      console.log(`🔍 Analyzing ${texts.length} comments with Gemini 2.0 Flash (attempt ${attempt + 1}/${maxRetries})...`);
      
      // Add exponential backoff delay for retries
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000; // 2s, 4s, 8s + random jitter
        console.log(`⏳ Waiting ${(delay/1000).toFixed(1)}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Sanitize input texts
      const sanitizedTexts = texts.map(text => 
        text
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
          .replace(/&amp;/g, '&') // Fix HTML entities
          .replace(/<br>/g, ' ') // Remove HTML line breaks
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/http[s]?:\/\/[^\s]*/g, '[URL]') // Replace URLs
          .trim()
      );
      
      const batchText = sanitizedTexts.join('\n---COMMENT_SEPARATOR---\n');
      const prompt = `
Analyze these YouTube comments for sentiment and toxicity. Return valid JSON only.

{
  "comments": [
    {
      "text": "exact comment text",
      "sentiment": number between -1 and 1,
      "toxicity": {
        "overall": number between 0 and 1,
        "categories": {
          "identity_attack": 0.1,
          "insult": 0.1,
          "obscene": 0.1,
          "severe_toxicity": 0.1,
          "sexual_explicit": 0.1,
          "threat": 0.1,
          "toxicity": 0.1
        },
        "confidence": 0.8
      },
      "categories": ["general"]
    }
  ],
  "overall_sentiment": {
    "score": 0,
    "distribution": { "very_negative": 0, "negative": 0, "neutral": 1, "positive": 0, "very_positive": 0 }
  },
  "toxicity_summary": {
    "average_score": 0.1,
    "distribution": { "low": 1, "medium": 0, "high": 0, "severe": 0 },
    "category_counts": { "identity_attack": 0, "insult": 0, "obscene": 0, "severe_toxicity": 0, "sexual_explicit": 0, "threat": 0 }
  },
  "topics": [{ "name": "general discussion", "count": 1, "sentiment": 0 }],
  "keywords": [{ "word": "comment", "count": 1, "sentiment": 0 }]
}

Additional context: ${analysisPrompt}

Comments:
${batchText}
`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // Reduced timeout

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.3, // Slightly higher for variation
              topK: 20,
              topP: 0.8,
              maxOutputTokens: 4096, // Reduced for faster response
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      const data = await response.json();
      
      console.log('📊 Gemini 2.0 Flash Response Status:', response.status);
      
      if (!response.ok) {
        if (response.status === 503) {
          console.warn('⚠️ Gemini API overloaded (503), will retry with longer delay...');
          throw new Error(`Gemini API overloaded (503)`);
        } else if (response.status === 429) {
          console.warn('⚠️ Rate limited (429), will retry...');
          throw new Error(`Rate limited (429)`);
        } else {
          console.error('❌ Gemini API Error:', data);
          throw new Error(`Gemini API returned ${response.status}: ${JSON.stringify(data)}`);
        }
      }
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const responseText = data.candidates[0].content.parts[0].text;
        console.log('📝 Raw Gemini Response:', responseText.substring(0, 300) + '...');
            try {
          // Clean up the response text
          const cleanText = responseText
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
            .replace(/\\n/g, ' ')  // Replace newlines with spaces
            .replace(/&amp;/g, '&') // Fix HTML entities
            .replace(/<br>/g, ' ') // Remove HTML tags
            .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
            .replace(/http[s]?:\/\/[^\s]*/g, '[URL]'); // Replace URLs

          // Try to extract JSON using balanced braces
          const jsonStr = extractBalancedJson(cleanText);
          if (jsonStr) {
            console.log('🔍 Cleaned JSON:', jsonStr.substring(0, 200) + '...');
            
            const parsedData = parseJsonSafe(jsonStr);
            
            // Validate required fields
            if (!parsedData.comments || !Array.isArray(parsedData.comments)) {
              throw new Error('Invalid response structure: missing comments array');
            }
            
            // Clean up comment texts
            parsedData.comments = parsedData.comments.map(comment => ({
              ...comment,
              text: comment.text
                .replace(/&amp;/g, '&')
                .replace(/<br>/g, ' ')
                .replace(/<[^>]*>/g, '')
                .trim()
            }));
            
            console.log('✅ Successfully parsed and validated Gemini response');
            return parsedData;
          } else {
            console.error('❌ No valid JSON found in cleaned response');
            throw new Error('No valid JSON found in cleaned response');
          }
        } catch (parseError) {
          console.error('❌ JSON parsing failed:', parseError.message);
          throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
        }
      }
      
      throw new Error('Invalid response format from Gemini API');
    } catch (error) {
      attempt++;
      console.error(`❌ Gemini API Error (attempt ${attempt}):`, error.message);
      
      if (attempt < maxRetries) {
        // Longer delay for server overload errors
        if (error.message.includes('503') || error.message.includes('429')) {
          const backoffDelay = Math.pow(2, attempt) * 3000 + Math.random() * 2000; // 6s, 12s, 24s + random
          console.log(`⏳ Server overloaded, retrying in ${(backoffDelay/1000).toFixed(1)} seconds...`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        } else {
          const delay = attempt * 2000;
          console.log(`⏳ Retrying in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } else {
        // After all retries failed, return fallback analysis
        console.warn('⚠️ All Gemini retries failed, using fallback analysis...');
        return createFallbackAnalysis(texts);
      }
    }
  }
}

// Fallback analysis function when Gemini API fails
function createFallbackAnalysis(texts) {
  console.log('🔄 Creating fallback analysis for', texts.length, 'comments');
  
  // Simple keyword-based analysis
  const toxicKeywords = ['hate', 'stupid', 'idiot', 'trash', 'terrible', 'awful', 'worst', 'sucks', 'bad', 'damn', 'shit', 'fuck'];
  const positiveKeywords = ['good', 'great', 'awesome', 'amazing', 'love', 'best', 'fantastic', 'excellent', 'wonderful', 'perfect'];
  const negativeKeywords = ['bad', 'hate', 'terrible', 'awful', 'worst', 'horrible', 'disgusting', 'annoying', 'boring'];
  
  return {
    comments: texts.map(text => {
      const lowerText = text.toLowerCase();
      
      // Simple sentiment calculation
      const positiveCount = positiveKeywords.filter(word => lowerText.includes(word)).length;
      const negativeCount = negativeKeywords.filter(word => lowerText.includes(word)).length;
      const sentiment = positiveCount > negativeCount ? 0.3 : negativeCount > positiveCount ? -0.3 : 0;
      
      // Simple toxicity calculation
      const toxicCount = toxicKeywords.filter(word => lowerText.includes(word)).length;
      const toxicityScore = Math.min(toxicCount * 0.3, 0.8);
      
      return {
        text,
        sentiment,
        toxicity: {
          overall: toxicityScore,
          categories: {
            identity_attack: toxicityScore > 0.5 ? 0.3 : 0.1,
            insult: toxicityScore > 0.3 ? 0.4 : 0.1,
            obscene: lowerText.includes('shit') || lowerText.includes('fuck') ? 0.6 : 0.1,
            severe_toxicity: toxicityScore > 0.7 ? 0.3 : 0.1,
            sexual_explicit: 0.1,
            threat: lowerText.includes('kill') || lowerText.includes('die') ? 0.5 : 0.1,
            toxicity: toxicityScore
          },
          confidence: 0.6
        },
        categories: toxicityScore > 0.3 ? ['potentially toxic'] : ['general']
      };
    }),
    overall_sentiment: {
      score: texts.reduce((sum, text) => {
        const lowerText = text.toLowerCase();
        const positiveCount = positiveKeywords.filter(word => lowerText.includes(word)).length;
        const negativeCount = negativeKeywords.filter(word => lowerText.includes(word)).length;
        return sum + (positiveCount > negativeCount ? 0.3 : negativeCount > positiveCount ? -0.3 : 0);
      }, 0) / texts.length,
      distribution: {
        very_negative: Math.floor(texts.length * 0.1),
        negative: Math.floor(texts.length * 0.2),
        neutral: Math.floor(texts.length * 0.4),
        positive: Math.floor(texts.length * 0.2),
        very_positive: Math.floor(texts.length * 0.1)
      }
    },
    toxicity_summary: {
      average_score: 0.25,
      distribution: {
        low: Math.floor(texts.length * 0.7),
        medium: Math.floor(texts.length * 0.2),
        high: Math.floor(texts.length * 0.1),
        severe: 0
      },
      category_counts: {
        identity_attack: Math.floor(texts.length * 0.05),
        insult: Math.floor(texts.length * 0.15),
        obscene: Math.floor(texts.length * 0.1),
        severe_toxicity: Math.floor(texts.length * 0.02),
        sexual_explicit: Math.floor(texts.length * 0.03),
        threat: Math.floor(texts.length * 0.01)
      }
    },
    topics: [
      { name: "general discussion", count: Math.floor(texts.length * 0.6), sentiment: 0 },
      { name: "reactions", count: Math.floor(texts.length * 0.4), sentiment: 0.1 }
    ],
    keywords: [
      { word: "video", count: Math.floor(texts.length * 0.3), sentiment: 0.1 },
      { word: "good", count: Math.floor(texts.length * 0.2), sentiment: 0.5 },
      { word: "comment", count: texts.length, sentiment: 0 }
    ]
  };
}

// Fetch comments with optional pagination
async function fetchComments(videoId, maxComments = 100, includeReplies = false) {
  const comments = [];
  let pageToken;

  while (comments.length < maxComments) {
    const response = await youtube.commentThreads.list({
      part: includeReplies ? ['snippet', 'replies'] : ['snippet'],
      videoId,
      maxResults: Math.min(100, maxComments - comments.length),
      pageToken
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

// Store analysis results temporarily
const analysisCache = new Map();

// ---- Model management endpoints ----
app.get('/models', (req, res) => {
  const userId = req.query.userId || 'default';
  res.json({ models: listModels(userId) });
});

app.post('/models/upload', upload.single('model'), (req, res) => {
  const userId = req.body.userId || 'default';
  if (!req.file) return res.status(400).json({ error: 'File required' });
  const uniqueName = `${uuidv4()}${path.extname(req.file.originalname)}`;
  const destPath = path.join(MODELS_DIR, uniqueName);
  fs.renameSync(req.file.path, destPath);
  const model = addModel(userId, req.file.originalname, destPath);
  console.log(`📥 Model uploaded by ${userId}: ${req.file.originalname}`);
  res.json({ success: true, model });
});

app.post('/models/activate', (req, res) => {
  const { userId = 'default', modelId } = req.body;
  if (!modelId) return res.status(400).json({ error: 'modelId required' });
  activateModel(modelId, userId);
  console.log(`⚡ Model ${modelId} activated for ${userId}`);
  res.json({ success: true });
});

app.delete('/models/:id', (req, res) => {
  const userId = req.query.userId || 'default';
  deleteModel(req.params.id, userId);
  console.log(`🗑️ Model ${req.params.id} deleted for ${userId}`);
  res.json({ success: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Endpoint to analyze YouTube comments
app.post('/analyze-comments', async (req, res) => {
  const startTime = Date.now();

  try {
  const {
    videoId,
    analysisPrompt = "",
    userId = "default",
    maxComments = 100,
    analysisMethod = "gemini",
    includeReplies = false
  } = req.body;
  const activeModel = getActiveModel(userId);
  if (activeModel) {
    console.log(`🤖 Using custom model ${activeModel.fileName} for ${userId}`);
  }
  console.log(`🎬 Starting analysis for video: ${videoId}`);

    if (!videoId) {
      return res.status(400).json({ 
        error: 'Video ID is required',
        details: 'Please provide a valid YouTube video ID'
      });
    }

    // Set longer timeout for this endpoint
    req.setTimeout(300000); // 5 minutes

    // Fetch video details
    console.log('📺 Fetching video details...');
    const videoResponse = await youtube.videos.list({
      part: ['snippet'],
      id: [videoId]
    });

    const video = videoResponse.data.items[0];
    if (!video) {
      console.error(`❌ Video not found: ${videoId}`);
      return res.status(404).json({ 
        error: 'Video not found',
        details: 'The specified video could not be found. Please check the video ID.'
      });
    }
    
    console.log(`📺 Video found: ${video.snippet.title}`);
    
    // Fetch comments
    console.log('💬 Fetching comments...');
    const comments = await fetchComments(videoId, maxComments, includeReplies);

    console.log(`💬 Fetched ${comments.length} comments`);

    if (comments.length === 0) {
      return res.status(400).json({ 
        error: 'No comments found for this video',
        details: 'The video might have comments disabled or no comments yet.'
      });
    }

    // Analyze with Gemini 2.0 Flash (now includes fallback)
    console.log('🔄 Starting AI analysis...');
    const texts = comments.map(comment => comment.text);

    let analysisResult;
    let usingFallback = false;
    
    try {
    try {
      if (analysisMethod === "indobert") {
        analysisResult = await analyzeWithIndoBert(texts);
      } else {
        analysisResult = await analyzeWithGemini(texts, analysisPrompt);
      }
    } catch (error) {
      console.warn("⚠️ Gemini analysis completely failed, using fallback...");
      analysisResult = createFallbackAnalysis(texts);
      usingFallback = true;
    }
    
    // Build comprehensive result structure
    const totalComments = comments.length;
    const result = {
      videoId,
      videoDetails: {
        id: video.id,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url
      },
      comments: comments.map((comment, index) => ({
        ...comment,
        sentiment: analysisResult.comments[index]?.sentiment || 0,
        toxicity: analysisResult.comments[index]?.toxicity || {
          overall: 0.1,
          categories: {
            identity_attack: 0.1, insult: 0.1, obscene: 0.1,
            severe_toxicity: 0.1, sexual_explicit: 0.1, threat: 0.1, toxicity: 0.1
          },
          confidence: 0.5
        },
        categories: analysisResult.comments[index]?.categories || ['general']
      })),
      sentiment: {
        overall: analysisResult.overall_sentiment?.score || 0,
        positive: Math.round((analysisResult.overall_sentiment?.distribution?.positive || 0) / totalComments * 100),
        neutral: Math.round((analysisResult.overall_sentiment?.distribution?.neutral || totalComments * 0.6) / totalComments * 100),
        negative: Math.round((analysisResult.overall_sentiment?.distribution?.negative || 0) / totalComments * 100),
        distribution: Object.entries(analysisResult.overall_sentiment?.distribution || {}).map(([sentiment, count]) => ({
          sentiment,
          count,
          percentage: count / totalComments
        }))
      },
      topics: (analysisResult.topics || []).map(topic => ({
        ...topic,
        percentage: topic.count / totalComments
      })),
      keywords: analysisResult.keywords || [],
      toxicity: {
        averageScore: analysisResult.toxicity_summary?.average_score || 0.2,
        distribution: Object.entries(analysisResult.toxicity_summary?.distribution || {}).map(([level, count]) => ({
          level,
          count,
          percentage: count / totalComments
        })),
        categoryCounts: analysisResult.toxicity_summary?.category_counts || {},
        totalToxicComments: Object.values(analysisResult.toxicity_summary?.category_counts || {}).reduce((a, b) => a + b, 0),
        totalComments,
        percentage: Math.round((Object.values(analysisResult.toxicity_summary?.category_counts || {}).reduce((a, b) => a + b, 0) / totalComments) * 100)
      },
      timestamp: new Date().toISOString(),
      metadata: {
        analysisMethod: usingFallback ? "keyword-based" : (analysisMethod === "indobert" ? "indobert" : "gemini-2.0-flash"),
        processingTime: ((Date.now() - startTime) / 1000).toFixed(2) + "s",
        modelVersion: usingFallback ? "fallback-v1" : (analysisMethod === "indobert" ? "indobert-base-p1" : "gemini-2.0-flash-exp")
      }
    };

    // Cache the result
    analysisCache.set(videoId, result);

    const processingTime = (Date.now() - startTime) / 1000;
    console.log(`✅ Analysis completed in ${processingTime}s (${usingFallback ? 'fallback' : 'Gemini 2.0 Flash'})`);

    res.json(result);
  } catch (error) {
    const processingTime = (Date.now() - startTime) / 1000;
    console.error(`❌ Analysis failed after ${processingTime}s:`, error);
    
    res.status(500).json({ 
      error: 'Failed to analyze comments', 
      details: error.message,
      processingTime: `${processingTime}s`
    });
  }
});

// Endpoint to export analysis to Excel (ML-ready format)
app.get('/export-excel/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const analysisResult = analysisCache.get(videoId);
    
    if (!analysisResult) {
      return res.status(404).json({ 
        error: 'Analysis not found',
        details: 'Please run the analysis first before exporting to Excel.'
      });
    }

    console.log(`📊 Exporting analysis for video ${videoId} to Excel...`);

    // Prepare data for Excel export
    const excelData = analysisResult.comments.map((comment, index) => ({
      'Comment ID': comment.id,
      'Author': comment.author,
      'Text': comment.text,
      'Published At': comment.publishedAt,
      'Like Count': comment.likeCount,
      'Reply Count': comment.replyCount,
      'Sentiment Score': comment.sentiment,
      'Toxicity Overall': comment.toxicity.overall,
      'Identity Attack': comment.toxicity.categories.identity_attack,
      'Insult': comment.toxicity.categories.insult,
      'Obscene': comment.toxicity.categories.obscene,
      'Severe Toxicity': comment.toxicity.categories.severe_toxicity,
      'Sexual Explicit': comment.toxicity.categories.sexual_explicit,
      'Threat': comment.toxicity.categories.threat,
      'Confidence': comment.toxicity.confidence,
      'Categories': comment.categories.join(', ')
    }));

    // Create workbook
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    
    // Add comments data sheet
    const commentsSheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, commentsSheet, 'Comments Analysis');
    
    // Add summary sheet
    const summaryData = [
      { Metric: 'Video ID', Value: analysisResult.videoId },
      { Metric: 'Video Title', Value: analysisResult.videoDetails.title },
      { Metric: 'Channel', Value: analysisResult.videoDetails.channelTitle },
      { Metric: 'Total Comments', Value: analysisResult.comments.length },
      { Metric: 'Overall Sentiment', Value: analysisResult.sentiment.overall },
      { Metric: 'Positive %', Value: analysisResult.sentiment.positive },
      { Metric: 'Neutral %', Value: analysisResult.sentiment.neutral },
      { Metric: 'Negative %', Value: analysisResult.sentiment.negative },
      { Metric: 'Average Toxicity', Value: analysisResult.toxicity.averageScore },
      { Metric: 'Toxic Comments %', Value: analysisResult.toxicity.percentage },
      { Metric: 'Analysis Method', Value: analysisResult.metadata.analysisMethod },
      { Metric: 'Processing Time', Value: analysisResult.metadata.processingTime },
      { Metric: 'Analysis Date', Value: analysisResult.timestamp }
    ];
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers for file download
    const filename = `youtube-analysis-${videoId}-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    console.log(`✅ Excel export completed: ${filename}`);
    res.send(buffer);
    
  } catch (error) {
    console.error('❌ Excel export failed:', error);
    res.status(500).json({ 
      error: 'Failed to export to Excel', 
      details: error.message 
    });
  }
});

// Handle server errors gracefully
app.use((error, req, res, next) => {
  console.error('💥 Unhandled server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    details: 'An unexpected error occurred while processing your request'
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 YouTube API Key: ${process.env.YOUTUBE_API_KEY ? 'Configured' : 'Missing'}`);
  console.log(`🤖 Gemini API Key: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Missing'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Server shutting down gracefully...');
  process.exit(0);
});
