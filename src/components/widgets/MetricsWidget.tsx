import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Zap, 
  TrendingUp, 
  Users,
  MessageSquare,
  AlertTriangle,
  ThumbsUp
} from 'lucide-react';
import { ScrapingSession } from '../../types';
import { formatNumber, formatPercentage } from '../../utils/classNames';

interface MetricsWidgetProps {
  sessions: ScrapingSession[];
}

const MetricsWidget: React.FC<MetricsWidgetProps> = ({ sessions }) => {
  const completedSessions = sessions.filter(s => s.status === 'completed' && s.result);
  
  // Calculate metrics
  const totalComments = completedSessions.reduce((acc, session) => 
    acc + (session.result?.comments?.length || 0), 0
  );
  
  const totalLikes = completedSessions.reduce((acc, session) => 
    acc + (session.result?.comments?.reduce((sum, comment) => sum + comment.likeCount, 0) || 0), 0
  );
  
  const avgSentiment = completedSessions.length > 0 ? 
    completedSessions.reduce((acc, session) => {
      if (!session.result?.sentiment) return acc;
      return acc + session.result.sentiment.positive / (session.result.sentiment.positive + session.result.sentiment.neutral + session.result.sentiment.negative);
    }, 0) / completedSessions.length : 0;
  
  const avgToxicity = completedSessions.length > 0 ?
    completedSessions.reduce((acc, session) => 
      acc + (session.result?.toxicity?.averageScore || 0), 0
    ) / completedSessions.length : 0;
  
  const uniqueAuthors = new Set(
    completedSessions.flatMap(session => 
      session.result?.comments?.map(comment => comment.author) || []
    )
  ).size;
  
  const avgCommentsPerVideo = completedSessions.length > 0 ? totalComments / completedSessions.length : 0;
  
  const avgLikesPerComment = totalComments > 0 ? totalLikes / totalComments : 0;
  
  const highToxicitySessions = completedSessions.filter(session => 
    (session.result?.toxicity?.averageScore || 0) > 0.5
  ).length;

  const metrics = [
    {
      label: 'Total Comments',
      value: formatNumber(totalComments, 'compact'),
      icon: MessageSquare,
      color: 'blue',
      description: 'Comments analyzed',
    },
    {
      label: 'Unique Users',
      value: formatNumber(uniqueAuthors),
      icon: Users,
      color: 'green',
      description: 'Distinct commenters',
    },
    {
      label: 'Avg. Sentiment',
      value: formatPercentage(avgSentiment),
      icon: TrendingUp,
      color: avgSentiment > 0.6 ? 'green' : avgSentiment > 0.4 ? 'yellow' : 'red',
      description: 'Positive sentiment rate',
    },
    {
      label: 'Toxicity Rate',
      value: formatPercentage(avgToxicity),
      icon: AlertTriangle,
      color: avgToxicity < 0.3 ? 'green' : avgToxicity < 0.6 ? 'yellow' : 'red',
      description: 'Average toxicity level',
    },
    {
      label: 'Engagement',
      value: formatNumber(avgLikesPerComment, 'standard'),
      icon: ThumbsUp,
      color: 'purple',
      description: 'Avg. likes per comment',
    },
    {
      label: 'Risk Videos',
      value: `${highToxicitySessions}/${completedSessions.length}`,
      icon: Target,
      color: highToxicitySessions > completedSessions.length * 0.3 ? 'red' : 'green',
      description: 'High toxicity videos',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Metrics
        </h3>
        <Zap className="h-5 w-5 text-yellow-500" />
      </div>

      {completedSessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No data available</p>
          <p className="text-sm mt-1">Complete an analysis to see metrics</p>
        </div>
      ) : (
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getColorClasses(metric.color)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {metric.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {metric.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </p>
                </div>
              </motion.div>
            );
          })}
          
          {/* Summary Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatNumber(avgCommentsPerVideo, 'standard')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Avg. comments per video
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {completedSessions.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Completed analyses
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsWidget;
