import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/classNames';

interface StatisticCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  className?: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color,
  className
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (changeType === 'negative') {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getChangeTextColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {change && (
            <div className="flex items-center mt-2 space-x-1">
              {getChangeIcon()}
              <span className={cn('text-sm font-medium', getChangeTextColor())}>
                {change}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                vs last period
              </span>
            </div>
          )}
        </div>
        
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatisticCard;
