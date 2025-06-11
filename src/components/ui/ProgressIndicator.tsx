import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';
import { cn } from '../../utils/classNames';

interface ProgressIndicatorProps {
  progress: {
    status: 'idle' | 'scraping' | 'analyzing' | 'completed' | 'error';
    progress: number;
    currentStep: string;
    totalSteps: number;
    error?: string;
  };
  className?: string;
  variant?: 'compact' | 'detailed' | 'minimal';
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  className,
  variant = 'detailed'
}) => {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'idle':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'scraping':
      case 'analyzing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'idle':
        return 'bg-gray-200 dark:bg-gray-700';
      case 'scraping':
      case 'analyzing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-200 dark:bg-gray-700';
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'idle':
        return 'Ready';
      case 'scraping':
        return 'Scraping Comments...';
      case 'analyzing':
        return 'Analyzing Data...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        {getStatusIcon()}
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {progress.status === 'idle' ? 'Ready' : `${Math.round(progress.progress)}%`}
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-3', className)}>
        {getStatusIcon()}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getStatusText()}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(progress.progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className={cn('h-2 rounded-full', getStatusColor())}
              initial={{ width: 0 }}
              animate={{ width: `${progress.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {getStatusText()}
          </h3>
        </div>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {Math.round(progress.progress)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <motion.div
            className={cn('h-3 rounded-full', getStatusColor())}
            initial={{ width: 0 }}
            animate={{ width: `${progress.progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {progress.currentStep}
        </span>
        <span className="text-gray-500 dark:text-gray-500">
          Step {Math.min(Math.ceil((progress.progress / 100) * progress.totalSteps), progress.totalSteps)} of {progress.totalSteps}
        </span>
      </div>

      {/* Error Message */}
      {progress.status === 'error' && progress.error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
        >
          <p className="text-sm text-red-700 dark:text-red-400">
            {progress.error}
          </p>
        </motion.div>
      )}

      {/* Steps Indicator */}
      {progress.status !== 'idle' && (
        <div className="mt-4 flex justify-between">
          {Array.from({ length: progress.totalSteps }, (_, i) => {
            const stepProgress = Math.min(Math.max((progress.progress - (i * (100 / progress.totalSteps))) / (100 / progress.totalSteps), 0), 1);
            const isCompleted = stepProgress >= 1;
            const isActive = stepProgress > 0 && stepProgress < 1;
            
            return (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors duration-300',
                  isCompleted 
                    ? getStatusColor().replace('bg-', 'bg-') 
                    : isActive 
                      ? 'bg-blue-300 dark:bg-blue-600' 
                      : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
