import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrapingSession } from '../../types';
import { cn } from '../../utils/classNames';

interface ActivityFeedProps {
  sessions: ScrapingSession[];
  maxItems?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ sessions, maxItems = 10 }) => {
  // Create activity items from sessions
  const activityItems = sessions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, maxItems)
    .map(session => {
      const baseActivity = {
        id: session.id,
        sessionId: session.id,
        timestamp: session.createdAt,
        videoId: session.videoId,
        title: session.title || `Video ${session.videoId}`,
      };

      // Create different activity types based on session status and results
      const activities = [];

      // Session started
      activities.push({
        ...baseActivity,
        type: 'session_started',
        title: 'Analysis Started',
        description: `Started analyzing comments for "${baseActivity.title}"`,
        icon: Clock,
        color: 'blue',
      });

      // Session completed
      if (session.status === 'completed' && session.result) {
        activities.push({
          ...baseActivity,
          id: `${session.id}_completed`,
          timestamp: session.completedAt || session.createdAt,
          type: 'session_completed',
          title: 'Analysis Completed',
          description: `Analyzed ${session.result.comments.length} comments with ${Math.round(session.result.sentiment?.positive * 100 || 0)}% positive sentiment`,
          icon: CheckCircle,
          color: 'green',
        });

        // High toxicity alert
        if (session.result.toxicity?.averageScore > 0.7) {
          activities.push({
            ...baseActivity,
            id: `${session.id}_toxicity`,
            timestamp: session.completedAt || session.createdAt,
            type: 'high_toxicity',
            title: 'High Toxicity Detected',
            description: `${Math.round(session.result.toxicity.averageScore * 100)}% average toxicity rate detected`,
            icon: AlertCircle,
            color: 'red',
          });
        }        // Engagement insights
        const avgLikes = session.result.comments.reduce((acc: number, comment: { likeCount: number }) => acc + comment.likeCount, 0) / session.result.comments.length;
        if (avgLikes > 10) {
          activities.push({
            ...baseActivity,
            id: `${session.id}_engagement`,
            timestamp: session.completedAt || session.createdAt,
            type: 'high_engagement',
            title: 'High Engagement Detected',
            description: `Average ${Math.round(avgLikes)} likes per comment`,
            icon: TrendingUp,
            color: 'purple',
          });
        }
      }

      // Session error
      if (session.status === 'error') {
        activities.push({
          ...baseActivity,
          id: `${session.id}_error`,
          type: 'session_error',
          title: 'Analysis Failed',
          description: session.error || 'Unknown error occurred',
          icon: AlertCircle,
          color: 'red',
        });
      }

      return activities;
    })
    .flat()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, maxItems);

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
          Recent Activity
        </h3>
        <BarChart3 className="h-5 w-5 text-gray-400" />
      </div>

      {activityItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activityItems.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className={cn('p-2 rounded-lg flex-shrink-0', getColorClasses(activity.color))}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                      {activity.videoId}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Session: {activity.sessionId.slice(-8)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
