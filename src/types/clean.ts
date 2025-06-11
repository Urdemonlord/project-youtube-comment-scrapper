// Core interfaces for the YouTube Comment Analyzer

export interface ToxicityAnalysis {
  overall: number;
  severe_toxicity: number;
  obscene: number;
  threat: number;
  insult: number;
  identity_attack: number;
  sexual_explicit: number;
}

export interface SentimentAnalysis {
  positive: number;
  negative: number;
  neutral: number;
  overall: number;
}

export interface TopicAnalysis {
  topic: string;
  weight: number;
  keywords: string[];
}

export interface KeywordAnalysis {
  word: string;
  frequency: number;
  sentiment: number;
}

export interface ToxicityOverall {
  averageScore: number;
  distribution: {
    low: number;
    medium: number;
    high: number;
  };
  flaggedComments: number;
}

export interface EngagementAnalysis {
  averageLikes: number;
  averageReplies: number;
  topCommenters: string[];
  engagementRate: number;
}

export interface UserBehaviorAnalysis {
  mostActiveUsers: Array<{
    username: string;
    commentCount: number;
    averageSentiment: number;
  }>;
  userTypes: {
    influencers: number;
    regular: number;
    trolls: number;
  };
}

export interface TrendAnalysis {
  period: string;
  sentiment: number;
  toxicity: number;
  engagement: number;
  commentCount: number;
}

export interface StatisticsData {
  totalComments: number;
  averageSentiment: number;
  averageToxicity: number;
  averageEngagement: number;
  topKeywords: KeywordAnalysis[];
}

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
  // New fields for enhanced features
  authorThumbnail?: string;
  isInfluencer?: boolean;
  engagementScore?: number;
  authorChannelId?: string;
  parentId?: string; // For reply comments
  moderationStatus?: 'approved' | 'flagged' | 'hidden' | 'pending';
}

export interface VideoDetails {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  // Enhanced fields
  description?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  duration?: string;
  tags?: string[];
  categoryId?: string;
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
  // New analysis fields
  engagement: EngagementAnalysis;
  userBehavior: UserBehaviorAnalysis;
  trends: TrendAnalysis[];
  statistics: StatisticsData;
}

export interface ScrapingSession {
  id: string;
  videoId: string;
  videoUrl?: string;
  title?: string;
  status: 'idle' | 'scraping' | 'analyzing' | 'completed' | 'error';
  createdAt: Date;
  completedAt?: Date;
  result?: AnalysisResult;
  settings: AnalysisSettings;
  error?: string;
}

export interface AnalysisSettings {
  maxComments: number;
  includeReplies: boolean;
  sortBy: 'time' | 'relevance' | 'rating';
  language?: string;
  customPrompt?: string;
  enableSentiment: boolean;
  enableToxicity: boolean;
  enableTopics: boolean;
  enableKeywords: boolean;
  enableUserBehavior: boolean;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  mode: 'light' | 'dark' | 'auto';
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  sound: boolean;
}

export interface DashboardSettings {
  defaultView: 'grid' | 'list';
  itemsPerPage: number;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface UserPreferences {
  theme: Theme;
  language: string;
  notifications: NotificationSettings;
  dashboard: DashboardSettings;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator' | 'analyst' | 'viewer';
  permissions: Permission[];
  preferences: UserPreferences;
  createdAt: Date;
  lastLogin?: Date;
  avatar?: string;
}

export interface ExportSettings {
  defaultFormat: 'xlsx' | 'csv' | 'json' | 'pdf';
  includeCharts: boolean;
  template: string;
  autoSchedule: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
}
