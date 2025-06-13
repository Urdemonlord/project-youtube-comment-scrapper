import React, { useState } from 'react';
import { Comment } from '../types';
import { ThumbsUp, MessageSquare, Clock, ChevronDown, ChevronUp, Filter, AlertTriangle, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SentimentBadge from './ui/SentimentBadge';

interface CommentListProps {
  comments: Comment[];
}

type SortOption = 'date' | 'likes' | 'replies' | 'toxicity' | 'sentiment';

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  const [expanded, setExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date');

  // Number of comments to show when not expanded
  const previewCount = 3;
  
  // Sort comments based on selected option
  const sortedComments = [...comments].sort((a, b) => {
    switch(sortBy) {
      case 'likes':
        return b.likeCount - a.likeCount;
      case 'replies':
        return b.replyCount - a.replyCount;
      case 'toxicity':
        return (b.toxicity?.overall || 0) - (a.toxicity?.overall || 0);
      case 'sentiment':
        return (b.sentiment || 0) - (a.sentiment || 0);
      case 'date':
      default:
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
  });

  // Comments to display based on expanded state
  const displayedComments = expanded ? sortedComments : sortedComments.slice(0, previewCount);
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get toxicity indicator
  const getToxicityIndicator = (toxicity?: { overall: number }) => {
    if (!toxicity) return null;
    const score = toxicity.overall;
    if (score > 0.7) return { icon: AlertTriangle, color: 'text-red-500', label: 'High Risk' };
    if (score > 0.4) return { icon: AlertTriangle, color: 'text-orange-500', label: 'Moderate' };
    return { icon: Shield, color: 'text-green-500', label: 'Safe' };
  };

  // Get sentiment label for SentimentBadge
  const getSentimentLabel = (
    sentiment?: number
  ): 'positive' | 'neutral' | 'negative' | null => {
    if (sentiment === undefined) return null;
    if (sentiment > 0.2) return 'positive';
    if (sentiment < -0.2) return 'negative';
    return 'neutral';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white rounded-lg shadow-md p-5"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Sample Comments ({comments.length})</h3>
        
        <div className="relative inline-block text-left">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-1 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm text-gray-600 bg-white border-none focus:ring-0 focus:outline-none pr-8 py-1"
            >
              <option value="date">Latest</option>
              <option value="likes">Most Liked</option>
              <option value="replies">Most Replies</option>
              <option value="toxicity">Most Toxic</option>
              <option value="sentiment">Most Positive</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <AnimatePresence>
          {displayedComments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between mb-2">
                <h4 className="font-medium text-gray-800">{comment.author}</h4>
                <div className="flex items-center space-x-2">
                  {/* Toxicity Indicator */}
                  {(() => {
                    const toxicityInfo = getToxicityIndicator(comment.toxicity);
                    if (toxicityInfo) {
                      const ToxicityIcon = toxicityInfo.icon;
                      return (
                        <div className={`flex items-center ${toxicityInfo.color}`} title={`Toxicity: ${toxicityInfo.label}`}>
                          <ToxicityIcon className="h-3 w-3" />
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  {/* Sentiment Indicator */}
                  {(() => {
                    const computedLabel = getSentimentLabel(comment.sentimentScore);
                    if (computedLabel) {
                      return (
                        <SentimentBadge label={computedLabel} score={comment.sentimentScore!} />
                      );
                    }
                    return null;
                  })()}
                  
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(comment.publishedAt)}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-2">{comment.text}</p>
              
              <div className="flex items-center text-xs text-gray-500 space-x-4">
                <span className="flex items-center">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  {comment.likeCount} likes
                </span>
                <span className="flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {comment.replyCount} replies
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {comments.length > previewCount && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {expanded ? (
              <>
                Show Less <ChevronUp className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Show All Comments <ChevronDown className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default CommentList;