// Core interfaces for the YouTube Comment Analyzer

export interface ToxicityAnalysis {
  overall: number;
  severe_toxicity: number;
  obscene: number;
  threat: number;
  insult: number;
  identity_attack: number;
  sexual_explicit: number;
  categories: {
    identity_attack: number;
    insult: number;
    obscene: number;
    severe_toxicity: number;
    sexual_explicit: number;
    threat: number;
  };
  confidence: number;
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
  count: number;
  sentiment: number;
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
  totalToxicComments: number;
  totalComments: number;
  categoryCounts: {
    identity_attack: number;
    insult: number;
    obscene: number;
    severe_toxicity: number;
    sexual_explicit: number;
    threat: number;
  };
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

// Notification system
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  timestamp: Date;
  read?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

// Export functionality
export interface ExportFormat {
  type: 'xlsx' | 'csv' | 'json' | 'pdf';
  label: string;
  mimeType: string;
}

export interface ExportOptions {
  format: ExportFormat;
  includeCharts: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: {
    sentiment?: string[];
    toxicity?: string[];
    authors?: string[];
  };
}

// Chart data interfaces
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

// Settings configuration
export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  settings: SettingsItem[];
}

export interface SettingsItem {
  id: string;
  label: string;
  description?: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'range';
  value?: string | number | boolean;
  defaultValue?: string | number | boolean;
  options?: SettingsOption[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  transform?: (value: string | number | boolean) => string | number | boolean;
}

export interface SettingsOption {
  label: string;
  value: string | number | boolean;
  description?: string;
}

// Configuration interfaces
export interface AppConfig {
  version: string;
  buildDate: string;
  features: {
    enableUserManagement: boolean;
    enableExport: boolean;
    enableNotifications: boolean;
    enableThemes: boolean;
  };
  limits: {
    maxCommentsPerSession: number;
    maxConcurrentSessions: number;
    maxStoredSessions: number;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  ui: {
    defaultTheme: string;
    availableLanguages: string[];
    dateFormat: string;
  };
}

export interface GlobalSettings {
  app: AppConfig;
  user: UserPreferences;
  analysis: AnalysisSettings;
  export: ExportSettings;
  notifications: NotificationSettings;
}

// Store related interfaces
export interface AppState {
  // Sessions
  sessions: ScrapingSession[];
  currentSessionId: string | null;
  
  // Analysis
  currentAnalysis: AnalysisResult | null;
  isAnalyzing: boolean;
  
  // Comments and filtering
  comments: Comment[];
  filteredComments: Comment[];
  filters: {
    search: string;
    sentiment: string[];
    toxicity: string[];
    dateRange: {
      start: Date | null;
      end: Date | null;
    };
  };
  
  // UI state
  activeTab: string;
  loading: boolean;
  notifications: Notification[];
  
  // Settings
  settings: Record<string, string | number | boolean>;
  
  // Pagination and sorting
  sortBy: string;
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
  };
  
  // Actions
  setActiveTab: (tab: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setLoading: (loading: boolean) => void;
  setSessions: (sessions: ScrapingSession[]) => void;
  addSession: (session: ScrapingSession) => void;
  updateSession: (id: string, updates: Partial<ScrapingSession>) => void;
  removeSession: (id: string) => void;
  setCurrentSessionId: (id: string | null) => void;
  setComments: (comments: Comment[]) => void;
  setFilteredComments: (comments: Comment[]) => void;
  updateFilters: (filters: Partial<AppState['filters']>) => void;
  clearFilters: () => void;
  updateSettings: (settings: Record<string, string | number | boolean>) => void;
  setSortBy: (sortBy: string) => void;
  updatePagination: (pagination: Partial<AppState['pagination']>) => void;
  
  // New actions for enhanced features
  createSession: (session: Omit<ScrapingSession, 'id' | 'createdAt'>) => string;
  updateScrapingProgress: (sessionId: string, progress: Partial<{
    status: ScrapingSession['status'];
    completedAt: Date;
    error: string;
    result: AnalysisResult;
  }>) => void;
}

// API related interfaces
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface AnalysisRequest {
  videoId: string;
  videoUrl?: string;
  analysisPrompt?: string;
  maxComments?: number;
  includeReplies?: boolean;
  settings?: AnalysisSettings;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

// Props interfaces for components
export interface TabProps {
  className?: string;
}

export interface StatisticCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ComponentType<{ className?: string }>;
}

export interface TrendChartProps {
  data: ChartData;
  type?: 'line' | 'bar' | 'area';
  height?: number;
}

export interface ActivityFeedProps {
  activities: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: Date;
    user?: string;
  }>;
}

export interface CommentCardProps {
  comment: Comment;
  onSelect?: (selected: boolean) => void;
  selected?: boolean;
  showActions?: boolean;
}

export interface FilterPanelProps {
  filters: AppState['filters'];
  onFiltersChange: (filters: Partial<AppState['filters']>) => void;
  onClearFilters: () => void;
}

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

// Progress tracking interface
export interface ScrapingProgress {
  sessionId: string;
  status: 'initializing' | 'scraping' | 'processing' | 'analyzing' | 'completed' | 'error';
  progress: number; // 0-100
  currentStep: string;
  commentsScraped: number;
  totalComments?: number;
  estimatedTimeRemaining?: number;
  error?: string;
}