import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ScrapingSession, Comment, AnalysisSettings, User, ExportSettings, Notification } from '../types';

export interface AppState {
  // Active tab management
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Session management
  sessions: ScrapingSession[];
  activeSessionId: string | null;
  addSession: (session: ScrapingSession) => void;
  updateSession: (id: string, updates: Partial<ScrapingSession>) => void;
  removeSession: (id: string) => void;
  setActiveSession: (id: string | null) => void;
  createSession: (session: Omit<ScrapingSession, 'id' | 'createdAt'>) => string;
  updateProgress: (sessionId: string, progress: number) => void;

  // Analysis settings
  analysisSettings: AnalysisSettings;
  updateAnalysisSettings: (settings: Partial<AnalysisSettings>) => void;

  // Comments and results
  comments: Comment[];
  filteredComments: Comment[];
  setComments: (comments: Comment[]) => void;
  setFilteredComments: (comments: Comment[]) => void;
  // UI state
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
    // Filtering and sorting
  filters: {
    search: string;
    sentiment: string[];
    toxicity: string[];
    dateRange: { start: Date | null; end: Date | null };
  };
  updateFilters: (filters: Partial<AppState['filters']>) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // Pagination
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
  };
  setPagination: (pagination: Partial<AppState['pagination']>) => void;
  
  // Current session reference
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
    // Progress tracking
  progress: number;
  setProgress: (progress: number) => void;  scrapingProgress: Record<string, {
    status: 'idle' | 'scraping' | 'analyzing' | 'completed' | 'error';
    progress: number;
    currentStep: string;
    totalSteps: number;
    error?: string;
  }>;
  updateScrapingProgress: (sessionId: string, progress: Partial<AppState['scrapingProgress'][string]>) => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;

  // User management
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  removeUser: (id: string) => void;

  // Export settings
  exportSettings: ExportSettings;
  updateExportSettings: (settings: Partial<ExportSettings>) => void;

  // Statistics
  statistics: {
    totalComments: number;
    totalSessions: number;
    averageScore: number;
    lastAnalysis: Date | null;
  };
  updateStatistics: (stats: Partial<AppState['statistics']>) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        activeTab: 'analysis',
        sessions: [],
        activeSessionId: null,
        comments: [],
        filteredComments: [],        isAnalyzing: false,
        progress: 0,
        error: null,
        notifications: [],
        users: [],
        currentUser: null,
        scrapingProgress: {},        currentSessionId: null,
        filters: {
          search: '',
          sentiment: [],
          toxicity: [],
          dateRange: { start: null, end: null },
        },
        sortBy: 'publishedAt',
        sortOrder: 'desc',
        pagination: {
          currentPage: 1,
          itemsPerPage: 20,
          totalItems: 0,
        },
        statistics: {
          totalComments: 0,
          totalSessions: 0,
          averageScore: 0,
          lastAnalysis: null,
        },
        analysisSettings: {
          maxComments: 100,
          includeReplies: true,
          sortBy: 'relevance',
          language: 'en',
          enableSentiment: true,
          enableToxicity: true,
          enableTopics: true,
          enableKeywords: true,
          enableUserBehavior: true,
        },        exportSettings: {
          defaultFormat: 'csv',
          includeCharts: true,
          template: 'standard',
          autoSchedule: false,
        },

        // Actions
        setActiveTab: (tab: string) => set({ activeTab: tab }),

        addSession: (session: ScrapingSession) =>
          set((state) => ({
            sessions: [...state.sessions, session],
            statistics: {
              ...state.statistics,
              totalSessions: state.statistics.totalSessions + 1,
            },
          })),

        updateSession: (id: string, updates: Partial<ScrapingSession>) =>
          set((state) => ({
            sessions: state.sessions.map((session) =>
              session.id === id ? { ...session, ...updates } : session
            ),
          })),

        removeSession: (id: string) =>
          set((state) => ({
            sessions: state.sessions.filter((session) => session.id !== id),
            activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
          })),        setActiveSession: (id: string | null) => set({ activeSessionId: id }),

        createSession: (sessionData: Omit<ScrapingSession, 'id' | 'createdAt'>) => {
          const newSession: ScrapingSession = {
            ...sessionData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
          };
          set((state) => ({
            sessions: [...state.sessions, newSession],
            currentSessionId: newSession.id,
            statistics: {
              ...state.statistics,
              totalSessions: state.statistics.totalSessions + 1,
            },
          }));
          return newSession.id;
        },

        updateProgress: (sessionId: string, progress: number) => {
          set((state) => ({
            scrapingProgress: {
              ...state.scrapingProgress,
              [sessionId]: {
                ...state.scrapingProgress[sessionId],
                progress,
              },
            },
          }));
        },

        updateAnalysisSettings: (settings: Partial<AnalysisSettings>) =>
          set((state) => ({
            analysisSettings: { ...state.analysisSettings, ...settings },
          })),

        setComments: (comments: Comment[]) =>
          set((state) => ({
            comments,
            filteredComments: comments,
            statistics: {
              ...state.statistics,
              totalComments: comments.length,
              lastAnalysis: new Date(),
            },
          })),        setFilteredComments: (filteredComments: Comment[]) =>
          set({ filteredComments }),

        setIsAnalyzing: (isAnalyzing: boolean) => set({ isAnalyzing }),

        updateFilters: (filterUpdates: Partial<AppState['filters']>) =>
          set((state) => ({
            filters: { ...state.filters, ...filterUpdates },
          })),

        setSortBy: (sortBy: string) => set({ sortBy }),

        setSortOrder: (sortOrder: 'asc' | 'desc') => set({ sortOrder }),

        setPagination: (paginationUpdates: Partial<AppState['pagination']>) =>
          set((state) => ({
            pagination: { ...state.pagination, ...paginationUpdates },
          })),

        setCurrentSessionId: (currentSessionId: string | null) => set({ currentSessionId }),

        setProgress: (progress: number) => set({ progress }),

        updateScrapingProgress: (sessionId: string, progressUpdate: Partial<AppState['scrapingProgress'][string]>) =>
          set((state) => ({
            scrapingProgress: {
              ...state.scrapingProgress,
              [sessionId]: {
                ...state.scrapingProgress[sessionId],
                ...progressUpdate,
              },
            },
          })),

        setError: (error: string | null) => set({ error }),

        addNotification: (notification) => {
          const id = Math.random().toString(36).substr(2, 9);
          set((state) => ({
            notifications: [
              ...state.notifications,
              { ...notification, id, timestamp: new Date() },
            ],
          }));
        },

        removeNotification: (id: string) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),

        setCurrentUser: (currentUser: User | null) => set({ currentUser }),

        addUser: (user: User) =>
          set((state) => ({ users: [...state.users, user] })),

        updateUser: (id: string, updates: Partial<User>) =>
          set((state) => ({
            users: state.users.map((user) =>
              user.id === id ? { ...user, ...updates } : user
            ),
            currentUser:
              state.currentUser?.id === id
                ? { ...state.currentUser, ...updates }
                : state.currentUser,
          })),

        removeUser: (id: string) =>
          set((state) => ({
            users: state.users.filter((user) => user.id !== id),
            currentUser: state.currentUser?.id === id ? null : state.currentUser,
          })),

        updateExportSettings: (settings: Partial<ExportSettings>) =>
          set((state) => ({
            exportSettings: { ...state.exportSettings, ...settings },
          })),

        updateStatistics: (stats: Partial<AppState['statistics']>) =>
          set((state) => ({
            statistics: { ...state.statistics, ...stats },
          })),
      }),
      {
        name: 'youtube-comment-analyzer-store',
        partialize: (state) => ({
          sessions: state.sessions,
          analysisSettings: state.analysisSettings,
          exportSettings: state.exportSettings,
          users: state.users,
          currentUser: state.currentUser,
          statistics: state.statistics,
        }),
      }
    )
  )
);