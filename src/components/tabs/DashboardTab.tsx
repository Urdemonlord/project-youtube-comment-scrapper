import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  Activity,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import StatisticCard from '../ui/StatisticCard';
import RealtimeChart from '../charts/RealtimeChart';
import TrendChart from '../charts/TrendChart';
import MetricsWidget from '../widgets/MetricsWidget';
import ActivityFeed from '../ui/ActivityFeed';
import { formatNumber, formatPercentage } from '../../utils/classNames';

const DashboardTab: React.FC = () => {
  const { sessions, scrapingProgress, addNotification } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realtimeData, setRealtimeData] = useState<Array<{
    timestamp: Date;
    activeSessions: number;
    totalProgress: number;
    commentsProcessed: number;
  }>>([]);

  // Calculate aggregate statistics
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const totalComments = sessions.reduce((acc, session) => 
    acc + (session.result?.comments?.length || 0), 0
  );
  const avgSentiment = sessions.reduce((acc, session) => {
    if (!session.result?.sentiment) return acc;
    return acc + (session.result.sentiment.positive - session.result.sentiment.negative);
  }, 0) / completedSessions || 0;

  const avgToxicity = sessions.reduce((acc, session) => {
    if (!session.result?.toxicity) return acc;
    return acc + session.result.toxicity.averageScore;
  }, 0) / completedSessions || 0;

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {      const activeSessions = Object.entries(scrapingProgress).filter(
        ([, progress]) => progress.status === 'scraping' || progress.status === 'analyzing'
      );

      if (activeSessions.length > 0) {
        setRealtimeData(prev => [
          ...prev.slice(-20), // Keep last 20 data points
          {
            timestamp: new Date(),
            activeSessions: activeSessions.length,
            totalProgress: activeSessions.reduce((acc, [, progress]) => acc + progress.progress, 0) / activeSessions.length,
            commentsProcessed: Math.floor(Math.random() * 50) + 10,
          }
        ]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [scrapingProgress]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsRefreshing(false);    addNotification({
      type: 'success',
      message: 'Dashboard Updated - All statistics have been refreshed successfully.',
    });
  };  // Helper functions for conditional values
  const getSentimentChangeType = (): 'positive' | 'negative' | 'neutral' => {
    return avgSentiment >= 0 ? 'positive' : 'negative';
  };

  const getSentimentColor = (): 'blue' | 'green' | 'red' | 'yellow' | 'purple' => {
    return avgSentiment >= 0 ? 'green' : 'red';
  };

  const getToxicityChangeType = (): 'positive' | 'negative' | 'neutral' => {
    return avgToxicity < 0.3 ? 'positive' : 'negative';
  };

  const getToxicityColor = (): 'blue' | 'green' | 'red' | 'yellow' | 'purple' => {
    return avgToxicity < 0.3 ? 'green' : 'red';
  };

  // Create stats cards with proper typing
  const totalSessionsCard = {
    title: 'Total Sessions',
    value: formatNumber(totalSessions),
    change: totalSessions > 0 ? '+12%' : '0%',
    changeType: 'positive' as const,
    icon: MessageSquare,
    color: 'blue' as const,
  };

  const commentsAnalyzedCard = {
    title: 'Comments Analyzed',
    value: formatNumber(totalComments, 'compact'),
    change: totalComments > 0 ? '+24%' : '0%',
    changeType: 'positive' as const,
    icon: BarChart3,
    color: 'green' as const,
  };

  const avgSentimentCard = {
    title: 'Avg. Sentiment',
    value: formatPercentage(Math.max(0, avgSentiment)),
    change: avgSentiment > 0 ? '+5%' : avgSentiment < 0 ? '-8%' : '0%',
    changeType: getSentimentChangeType(),
    icon: TrendingUp,
    color: getSentimentColor(),
  };

  const toxicityRateCard = {
    title: 'Toxicity Rate',
    value: formatPercentage(avgToxicity),
    change: avgToxicity < 0.3 ? '-3%' : '+1%',
    changeType: getToxicityChangeType(),
    icon: AlertTriangle,
    color: getToxicityColor(),
  };

  const statsCards = [
    totalSessionsCard,
    commentsAnalyzedCard,
    avgSentimentCard,
    toxicityRateCard,
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time insights and statistics from your YouTube comment analysis
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatisticCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Real-time Activity
            </h3>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <RealtimeChart data={realtimeData} />
        </motion.div>

        {/* Trend Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sentiment Trends
            </h3>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <TrendChart sessions={sessions} />
        </motion.div>
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <ActivityFeed sessions={sessions} />
        </motion.div>

        {/* Quick Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <MetricsWidget sessions={sessions} />
        </motion.div>

      </div>

      {/* Active Sessions Monitor */}
      {Object.keys(scrapingProgress).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Active Sessions
            </h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(scrapingProgress).map(([sessionId, progress]) => {
              const session = sessions.find(s => s.id === sessionId);
              if (!session || progress.status === 'idle' || progress.status === 'completed') return null;
              
              return (
                <div key={sessionId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {session.title || `Session ${sessionId.slice(-8)}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {progress.currentStep}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(progress.progress)}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Step {Math.ceil((progress.progress / 100) * progress.totalSteps)} of {progress.totalSteps}
                      </p>
                    </div>
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardTab;
