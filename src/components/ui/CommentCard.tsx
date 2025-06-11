import React from 'react';
import { motion } from 'framer-motion';
import { 
  ThumbsUp, 
  MessageCircle, 
  AlertTriangle, 
  TrendingUp,
  User,
  Calendar,
  Eye,
  Share2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from '../../types';
import { formatNumber, formatPercentage, cn } from '../../utils/classNames';

interface CommentCardProps {
  comment: Comment;
  isSelected?: boolean;
  onSelect?: () => void;
  onPreview?: () => void;
  compact?: boolean;
  detailed?: boolean;
  showActions?: boolean;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  isSelected = false,
  onSelect,
  onPreview,
  compact = false,
  detailed = false,
  showActions = false,
}) => {
  const getSentimentColor = (sentiment?: number) => {
    if (!sentiment) return 'text-gray-500';
    if (sentiment > 0.1) return 'text-green-500';
    if (sentiment < -0.1) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getToxicityColor = (toxicity?: number) => {
    if (!toxicity) return 'text-gray-500';
    if (toxicity < 0.3) return 'text-green-500';
    if (toxicity < 0.7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSentimentLabel = (sentiment?: number) => {
    if (!sentiment) return 'Neutral';
    if (sentiment > 0.1) return 'Positive';
    if (sentiment < -0.1) return 'Negative';
    return 'Neutral';
  };

  const getToxicityLabel = (toxicity?: number) => {
    if (!toxicity) return 'Safe';
    if (toxicity < 0.3) return 'Safe';
    if (toxicity < 0.7) return 'Moderate';
    return 'High Risk';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all duration-200',
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
        detailed ? 'p-6' : compact ? 'p-3' : 'p-4'
      )}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <div className="flex-1">
            <CommentContent />
          </div>
        </div>
      )}

      {!onSelect && <CommentContent />}
    </motion.div>
  );

  function CommentContent() {
    return (
      <>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {comment.author}
              </span>
            </div>
            {comment.authorThumbnail && (
              <img
                src={comment.authorThumbnail}
                alt={comment.author}
                className="w-6 h-6 rounded-full"
              />
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(comment.publishedAt), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Comment Text */}
        <div className="mb-3">
          <p className={cn(
            'text-gray-700 dark:text-gray-300',
            compact ? 'text-sm line-clamp-2' : detailed ? 'text-base' : 'text-sm',
            detailed && 'leading-relaxed'
          )}>
            {comment.text}
          </p>
        </div>

        {/* Metrics */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Likes */}
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <ThumbsUp className="h-4 w-4" />
              <span className="text-sm">{formatNumber(comment.likeCount)}</span>
            </div>

            {/* Replies */}
            {comment.replyCount > 0 && (
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{formatNumber(comment.replyCount)}</span>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          <div className="flex items-center space-x-3">
            {/* Sentiment */}
            {comment.sentiment !== undefined && !compact && (
              <div className="flex items-center space-x-1">
                <TrendingUp className={cn('h-4 w-4', getSentimentColor(comment.sentiment))} />
                <span className={cn('text-xs font-medium', getSentimentColor(comment.sentiment))}>
                  {detailed ? formatPercentage(Math.abs(comment.sentiment)) : getSentimentLabel(comment.sentiment)}
                </span>
              </div>
            )}

            {/* Toxicity */}
            {comment.toxicity && !compact && (
              <div className="flex items-center space-x-1">
                <AlertTriangle className={cn('h-4 w-4', getToxicityColor(comment.toxicity.overall))} />
                <span className={cn('text-xs font-medium', getToxicityColor(comment.toxicity.overall))}>
                  {detailed ? formatPercentage(comment.toxicity.overall) : getToxicityLabel(comment.toxicity.overall)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Analysis */}
        {detailed && comment.toxicity && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Toxicity Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(comment.toxicity.categories).map(([category, score]) => (
                <div key={category} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {category.replace('_', ' ')}:
                  </span>
                  <span className={cn('font-medium', getToxicityColor(score))}>
                    {formatPercentage(score)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories/Tags */}
        {comment.categories && comment.categories.length > 0 && !compact && (
          <div className="mt-3 flex flex-wrap gap-1">
            {comment.categories.slice(0, detailed ? 10 : 3).map((category) => (
              <span
                key={category}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
              >
                {category}
              </span>
            ))}
            {!detailed && comment.categories.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{comment.categories.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                <Eye className="h-4 w-4" />
                <span>View Thread</span>
              </button>
              <button className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
            
            {onPreview && (
              <button
                onClick={onPreview}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                View Details
              </button>
            )}
          </div>
        )}
      </>
    );
  }
};

export default CommentCard;
