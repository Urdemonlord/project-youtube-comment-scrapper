import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SentimentAnalysis, SentimentDistribution } from '../types';
import { motion } from 'framer-motion';

interface SentimentChartProps {
  sentiment: SentimentAnalysis;
}

const COLORS = {
  'very negative': '#ef4444', // Red
  'negative': '#f97316',     // Orange
  'neutral': '#a3a3a3',      // Gray
  'positive': '#22c55e',     // Green
  'very positive': '#10b981', // Emerald
};

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const SentimentChart: React.FC<SentimentChartProps> = ({ sentiment }) => {
  const { distribution } = sentiment;
  
  // Filter out zero values for better visualization
  const chartData = distribution.filter(item => item.count > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-lg shadow-md p-5"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Sentiment Distribution</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="percentage"
              nameKey="sentiment"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.sentiment as keyof typeof COLORS] || '#a3a3a3'} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
              labelFormatter={(label) => `${label.charAt(0).toUpperCase() + label.slice(1)}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Overall Sentiment</p>
          <div className="text-2xl font-bold">
            {sentiment.overall > 0.3 ? '😄 Positive' : 
             sentiment.overall < -0.3 ? '😞 Negative' : 
             '😐 Neutral'}
          </div>
          <p className="text-sm text-gray-700">Score: {sentiment.overall.toFixed(2)}</p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Top Sentiment</p>
          {chartData.length > 0 ? (
            <div className="text-2xl font-bold">
              {chartData.reduce((a, b) => a.percentage > b.percentage ? a : b).sentiment}
            </div>
          ) : (
            <div className="text-2xl font-bold">N/A</div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SentimentChart;