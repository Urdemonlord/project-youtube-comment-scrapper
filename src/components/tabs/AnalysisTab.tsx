import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Settings, 
  Save, 
  RefreshCw,
  CheckCircle,
  Youtube
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAppStore } from '../../store/appStore';
import ProgressIndicator from '../ui/ProgressIndicator';
import ModelUploadWidget from '../widgets/ModelUploadWidget';
import { debounce } from '../../utils/classNames';
import { extractVideoId } from '../../utils/validators';
import { AnalysisSettings } from '../../types';

interface AnalysisFormData {
  videoUrl: string;
  settings: AnalysisSettings;
}

const AnalysisTab: React.FC = () => {  const { 
    createSession,
    updateSession,
    updateScrapingProgress,
    currentSessionId,
    scrapingProgress,
    addNotification
  } = useAppStore();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewData, setPreviewData] = useState<{ 
    title?: string; 
    thumbnail?: string;
    channelTitle?: string;
    viewCount?: string;
    commentCount?: string;
  } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<AnalysisFormData>({
    defaultValues: {
      videoUrl: '',
      settings: {        maxComments: 100,
        includeReplies: true,
        sortBy: 'relevance',
        language: 'en',
        customPrompt: '',
        analysisMethod: 'gemini',
        enableSentiment: true,
        enableToxicity: true,
        enableTopics: true,
        enableKeywords: true,
        enableUserBehavior: false,
      }
    }
  });

  const videoUrl = watch('videoUrl');
  const currentProgress = currentSessionId ? scrapingProgress[currentSessionId] : null;  // Debounced video preview
  const handleVideoPreview = async (url: string) => {
    const videoId = extractVideoId(url);
    if (videoId) {
      try {
        // Fetch video preview data
        const response = await fetch(`http://localhost:3000/video-preview/${videoId}`);
        if (response.ok) {
          const data = await response.json();
          setPreviewData(data);
        }
      } catch (error) {
        console.error('Preview fetch error:', error);
      }
    } else {
      setPreviewData(null);
    }
  };
  const debouncedPreview = debounce(handleVideoPreview as (...args: unknown[]) => unknown, 500) as (url: string) => Promise<void>;

  React.useEffect(() => {
    if (videoUrl) {
      debouncedPreview(videoUrl);
    }
  }, [videoUrl, debouncedPreview]);

  const onSubmit = async (data: AnalysisFormData) => {
    const videoId = extractVideoId(data.videoUrl);    if (!videoId) {
      addNotification({
        type: 'error',
        message: 'Invalid URL - Please enter a valid YouTube video URL',
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {      // Create new session
      const sessionId = createSession({
        videoId: videoId,
        videoUrl: data.videoUrl,
        title: previewData?.title || `Video ${videoId}`,
        settings: data.settings,
        status: 'scraping',
      });
      
      // Update session with settings
      updateSession(sessionId, {
        videoUrl: data.videoUrl,
        title: previewData?.title || `Video ${videoId}`,
        settings: data.settings,
        status: 'scraping',
      });

      // Start analysis process
      await startAnalysis(sessionId, videoId, data.settings);
      
    } catch (error) {      console.error('Analysis error:', error);
      addNotification({
        type: 'error',
        message: `Analysis Failed - ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startAnalysis = async (sessionId: string, videoId: string, settings: AnalysisSettings) => {
    const steps = [
      { name: 'Fetching video details...', progress: 10 },
      { name: 'Scraping comments...', progress: 30 },
      { name: 'Processing with AI...', progress: 60 },
      { name: 'Analyzing sentiment...', progress: 80 },
      { name: 'Finalizing results...', progress: 100 },
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];        updateScrapingProgress(sessionId, {
          status: i < steps.length - 1 ? 'scraping' : 'analyzing',
          progress: step.progress,
          currentStep: step.name,
          totalSteps: steps.length,
        });

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
      }      // Make actual API call
      console.log('📊 Sending analysis request with parameters:', {
        videoId,
        maxComments: settings.maxComments,
        includeReplies: settings.includeReplies,
        sortBy: settings.sortBy,
        analysisMethod: settings.analysisMethod
      });
      
      const response = await fetch('http://localhost:3000/analyze-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },        body: JSON.stringify({
          videoId,
          maxComments: settings.maxComments,
          includeReplies: settings.includeReplies,
          sortBy: settings.sortBy,
          analysisPrompt: settings.customPrompt,
          analysisMethod: settings.analysisMethod,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update session with results
      updateSession(sessionId, {
        status: 'completed',
        result,
        completedAt: new Date(),
      });      updateScrapingProgress(sessionId, {
        status: 'completed',
        progress: 100,
        currentStep: 'Analysis completed!',
      });addNotification({
        type: 'success',
        message: `Analysis Completed - Successfully analyzed ${result.comments?.length || 0} comments`,
      });

    } catch (error) {
      updateSession(sessionId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });      updateScrapingProgress(sessionId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  };

  const handleStop = () => {
    if (currentSessionId) {
      updateSession(currentSessionId, {
        status: 'error',
        error: 'Analysis stopped by user',
      });
        updateScrapingProgress(currentSessionId, {
        status: 'error',
        error: 'Analysis stopped by user',
      });
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          YouTube Comment Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Analyze sentiment, toxicity, and engagement patterns in YouTube comments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Video URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  YouTube Video URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Youtube className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('videoUrl', { 
                      required: 'YouTube URL is required',
                      validate: (value) => {
                        const videoId = extractVideoId(value);
                        return videoId ? true : 'Please enter a valid YouTube video URL';
                      }
                    })}
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                {errors.videoUrl && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.videoUrl.message}
                  </p>
                )}
              </div>

              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Comments
                  </label>                  <select
                    {...register('settings.maxComments')}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={20}>20 comments</option>
                    <option value={50}>50 comments</option>
                    <option value={100}>100 comments</option>
                    <option value={200}>200 comments</option>
                    <option value={500}>500 comments</option>
                    <option value={1000}>1000 comments</option>
                    <option value={2000}>2000 comments</option>
                  </select>
                </div>                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    {...register('settings.sortBy')}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="time">Most Recent</option>
                    <option value="rating">Top Comments</option>
                  </select>
                </div>
              </div>

              {/* Analysis Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Analysis Method
                </label>
                <select
                  {...register('settings.analysisMethod')}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="gemini">Gemini AI (Recommended)</option>
                  <option value="indobert">IndoBERT (Indonesian)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Gemini AI provides comprehensive analysis, IndoBERT is optimized for Indonesian language
                </p>
              </div>

              {/* Analysis Options */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Analysis Options
                </h3>                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register('settings.enableSentiment')}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Sentiment Analysis
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register('settings.enableToxicity')}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Toxicity Detection
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register('settings.enableTopics')}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Topic Modeling
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register('settings.enableKeywords')}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Keyword Extraction
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register('settings.includeReplies')}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Include Replies
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register('settings.enableUserBehavior')}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      User Behavior
                    </span>
                  </label>
                </div>
              </div>

              {/* Advanced Settings */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <Settings className="h-4 w-4" />
                  <span>Advanced Settings</span>
                </button>

                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Custom Analysis Prompt
                      </label>
                      <textarea
                        {...register('settings.customPrompt')}
                        rows={3}
                        placeholder="Custom instructions for AI analysis..."
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </button>

                <div className="flex items-center space-x-3">
                  {isAnalyzing && (
                    <button
                      type="button"
                      onClick={handleStop}
                      className="px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Stop
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isAnalyzing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    <span>{isAnalyzing ? 'Analyzing...' : 'Start Analysis'}</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Video Preview */}
          {previewData && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Video Preview
              </h3>
              <div className="space-y-3">
                <img
                  src={previewData.thumbnail}
                  alt={previewData.title}
                  className="w-full rounded-lg"
                />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {previewData.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {previewData.channelTitle}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{previewData.viewCount} views</span>
                    <span>{previewData.commentCount} comments</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Progress */}
          {currentProgress && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ProgressIndicator progress={currentProgress} variant="detailed" />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ModelUploadWidget />
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"
          >
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Analysis Tips
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-400 mt-2 space-y-1">
                  <li>• Start with 100 comments for faster results</li>
                  <li>• Include replies for deeper insights</li>
                  <li>• Use custom prompts for specific analysis</li>
                  <li>• Enable all features for comprehensive analysis</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisTab;
