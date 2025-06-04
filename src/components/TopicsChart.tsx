import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TopicAnalysis } from '../types';
import { motion } from 'framer-motion';

interface TopicsChartProps {
  topics: TopicAnalysis[];
}

const TopicsChart: React.FC<TopicsChartProps> = ({ topics }) => {
  // Sort topics by count (descending) and take top 8
  const sortedTopics = [...topics]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map(topic => ({
      ...topic,
      // Convert sentiment from -1...1 to 0...1 range for color mapping
      normalizedSentiment: (topic.sentiment + 1) / 2
    }));

  const getBarColor = (normalizedSentiment: number) => {
    // Color gradient from red (negative) to green (positive)
    if (normalizedSentiment < 0.4) return '#ef4444'; // Red for negative
    if (normalizedSentiment < 0.6) return '#a3a3a3'; // Gray for neutral
    return '#22c55e'; // Green for positive
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-lg shadow-md p-5"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Discussion Topics</h3>
      
      <div className="h-64">
        {sortedTopics.length > 0 ? (
          <ResponsiveContainer width="100%\" height="100%">
            <BarChart
              data={sortedTopics}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'count' ? `${value} comments` : `${(value * 100).toFixed(1)}%`, 
                  name === 'count' ? 'Mentions' : 'Percentage'
                ]}
                labelFormatter={(label) => `Topic: ${label}`}
              />
              <Bar 
                dataKey="count" 
                name="Mentions"
                radius={[0, 4, 4, 0]}
              >
                {sortedTopics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.normalizedSentiment)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No topic data available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TopicsChart;