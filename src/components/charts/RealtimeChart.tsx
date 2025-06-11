import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format } from 'date-fns';

interface RealtimeChartProps {
  data: Array<{
    timestamp: Date;
    activeSessions: number;
    totalProgress: number;
    commentsProcessed: number;
  }>;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

const RealtimeChart: React.FC<RealtimeChartProps> = ({ data }) => {
  const formatTime = (timestamp: Date) => {
    return format(timestamp, 'HH:mm:ss');
  };

  const formattedData = data.map(item => ({
    ...item,
    time: formatTime(item.timestamp),
    timeValue: item.timestamp.getTime(),
  }));

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Time: {label}
          </p>          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'totalProgress' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
          </div>
          <p className="mt-4">Waiting for real-time data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="activeSessions"
            stroke="#3B82F6"
            fillOpacity={0.6}
            fill="url(#colorSessions)"
            name="Active Sessions"
          />
          <Area
            type="monotone"
            dataKey="totalProgress"
            stroke="#10B981"
            fillOpacity={0.6}
            fill="url(#colorProgress)"
            name="Progress"
          />
          <Area
            type="monotone"
            dataKey="commentsProcessed"
            stroke="#8B5CF6"
            fillOpacity={0.6}
            fill="url(#colorComments)"
            name="Comments/min"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RealtimeChart;
