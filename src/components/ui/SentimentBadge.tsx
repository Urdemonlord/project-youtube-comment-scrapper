import React from 'react';
import { cn } from '../../utils/classNames';

interface SentimentBadgeProps {
  label: 'positive' | 'neutral' | 'negative';
  score: number;
}

const SentimentBadge: React.FC<SentimentBadgeProps> = ({ label, score }) => {
  const sentiments = {
    positive: { emoji: '☺️', color: 'text-green-500' },
    neutral: { emoji: '😐', color: 'text-gray-500' },
    negative: { emoji: '😡', color: 'text-red-500' },
  } as const;

  const { emoji, color } = sentiments[label];
  const title = `Probability: ${(score * 100).toFixed(2)}%`;

  return (
    <span className={cn('text-lg', color)} title={title}>
      {emoji}
    </span>
  );
};

export default SentimentBadge;
