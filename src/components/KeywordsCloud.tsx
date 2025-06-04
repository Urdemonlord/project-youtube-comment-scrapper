import React from 'react';
import { KeywordAnalysis } from '../types';
import { motion } from 'framer-motion';

interface KeywordsCloudProps {
  keywords: KeywordAnalysis[];
}

const KeywordsCloud: React.FC<KeywordsCloudProps> = ({ keywords }) => {
  // Sort keywords by count (descending) and take top 30
  const sortedKeywords = [...keywords]
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  // Function to determine font size based on count
  const getFontSize = (count: number): number => {
    const max = sortedKeywords[0]?.count || 1;
    const min = sortedKeywords[sortedKeywords.length - 1]?.count || 1;
    const normalized = (count - min) / (max - min);
    return 12 + normalized * 24; // Font sizes between 12px and 36px
  };

  // Function to determine color based on sentiment
  const getColor = (sentiment: number): string => {
    if (sentiment < -0.5) return '#ef4444'; // Very negative (red)
    if (sentiment < -0.1) return '#f97316'; // Negative (orange)
    if (sentiment < 0.1) return '#a3a3a3'; // Neutral (gray)
    if (sentiment < 0.5) return '#22c55e'; // Positive (green)
    return '#10b981'; // Very positive (emerald)
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-lg shadow-md p-5"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Terms</h3>
      
      {sortedKeywords.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2 p-4">
          {sortedKeywords.map((keyword, index) => (
            <motion.span
              key={keyword.word}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
              className="inline-block px-2 py-1 rounded-full"
              style={{
                fontSize: `${getFontSize(keyword.count)}px`,
                color: getColor(keyword.sentiment),
                backgroundColor: `${getColor(keyword.sentiment)}20`,
              }}
              title={`${keyword.word} (${keyword.count} mentions)`}
            >
              {keyword.word}
            </motion.span>
          ))}
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center">
          <p className="text-gray-500">No keyword data available</p>
        </div>
      )}
    </motion.div>
  );
};

export default KeywordsCloud;