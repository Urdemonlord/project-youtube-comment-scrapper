export interface Comment {
  id: string;
  text: string;
  author: string;
  publishedAt: string;
  likeCount: number;
  replyCount: number;
  toxicity?: ToxicityAnalysis;
  sentiment?: number; // -1 to 1
  categories?: string[];
}

export interface VideoDetails {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
}

export interface AnalysisResult {
  videoId: string;
  videoDetails?: VideoDetails;
  comments: Comment[];
  sentiment: SentimentAnalysis;
  topics: TopicAnalysis[];
  keywords: KeywordAnalysis[];
  toxicity: ToxicityOverall;
  timestamp: string;
}

export interface ToxicityAnalysis {
  overall: number; // 0 to 1 score
  categories: {
    identity_attack: number;
    insult: number;
    obscene: number;
    severe_toxicity: number;
    sexual_explicit: number;
    threat: number;
    toxicity: number;
  };
  confidence: number;
}

export interface ToxicityOverall {
  averageScore: number;
  distribution: ToxicityDistribution[];
  categoryCounts: { [category: string]: number };
  totalToxicComments: number;
  totalComments: number;
  percentage: number;
}

export interface ToxicityDistribution {
  level: string; // 'low', 'medium', 'high', 'severe'
  count: number;
  percentage: number;
}

export interface SentimentAnalysis {
  overall: number; // -1 to 1 score
  positive: number; // percentage
  neutral: number; // percentage
  negative: number; // percentage
  distribution: SentimentDistribution[];
}

export interface SentimentDistribution {
  sentiment: string; // 'very negative', 'negative', 'neutral', 'positive', 'very positive'
  count: number;
  percentage: number;
}

export interface TopicAnalysis {
  name: string;
  count: number;
  percentage: number;
  sentiment: number; // -1 to 1 score
}

export interface KeywordAnalysis {
  word: string;
  count: number;
  sentiment: number; // -1 to 1 score
}

export interface ApiError {
  statusCode: number;
  message: string;
  details?: string;
}

export interface AnalysisRequest {
  videoId: string;
  analysisPrompt?: string;
}

export enum AnalysisStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}