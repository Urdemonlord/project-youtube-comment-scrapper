import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { ScrapingSession } from '../../types';

interface TrendChartProps {
  sessions: ScrapingSession[];
}

const TrendChart: React.FC<TrendChartProps> = ({ sessions }) => {
  // Process sessions data for trend analysis
  const processedData = sessions
    .filter(session => session.result && session.status === 'completed')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((session, index) => {
      const result = session.result!;
      const date = new Date(session.createdAt);
      
      // Calculate sentiment score (-1 to 1)
      const sentimentScore = result.sentiment ? 
        (result.sentiment.positive - result.sentiment.negative) / 
        (result.sentiment.positive + result.sentiment.neutral + result.sentiment.negative) : 0;
      
      // Calculate toxicity percentage
      const toxicityScore = result.toxicity ? result.toxicity.averageScore * 100 : 0;
        // Calculate engagement rate
      const avgLikes = result.comments.reduce((acc: number, comment: { likeCount: number }) => acc + comment.likeCount, 0) / result.comments.length || 0;
      const engagementScore = Math.min(avgLikes * 10, 100); // Normalize to 0-100
      
      return {
        date: format(date, 'MMM dd'),
        timestamp: date.getTime(),
        sessionIndex: index + 1,
        sentiment: Math.round(sentimentScore * 100), // Convert to percentage
        toxicity: Math.round(toxicityScore),
        engagement: Math.round(engagementScore),
        comments: result.comments.length,
      };
    });

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          {payload.map((entry, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">
                {entry.name}: 
              </span>
              <span className="font-medium" style={{ color: entry.color }}>
                {entry.value}
                {entry.name !== 'Comments' ? '%' : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (processedData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
          </div>
          <p className="mt-4">No completed analyses yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
            domain={[-100, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="sentiment"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Sentiment"
          />
          <Line
            type="monotone"
            dataKey="toxicity"
            stroke="#EF4444"
            strokeWidth={2}
            dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Toxicity"
          />
          <Line
            type="monotone"
            dataKey="engagement"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Engagement"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
