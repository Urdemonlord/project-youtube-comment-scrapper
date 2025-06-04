import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ToxicityOverall } from '../types';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield } from 'lucide-react';

interface ToxicityChartProps {
  toxicity?: ToxicityOverall;
}

const TOXICITY_COLORS = {
  low: '#22c55e',      // Green
  medium: '#f59e0b',   // Yellow
  high: '#f97316',     // Orange
  severe: '#ef4444',   // Red
};

const ToxicityChart: React.FC<ToxicityChartProps> = ({ toxicity }) => {
  // Handle case where toxicity data is not available
  if (!toxicity) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-lg shadow-md p-5"
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No toxicity data available</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Provide default values to prevent destructuring errors
  const {
    distribution = [],
    averageScore = 0,
    totalToxicComments = 0,
    totalComments = 0,
    categoryCounts = {}
  } = toxicity || {};

  // Prepare category data for visualization
  const categoryData = Object.entries(categoryCounts).map(([category, count]) => ({
    category: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count,
    percentage: (count / totalComments) * 100
  })).sort((a, b) => b.count - a.count);

  const getToxicityLevelColor = (level: string) => {
    return TOXICITY_COLORS[level as keyof typeof TOXICITY_COLORS] || '#a3a3a3';
  };

  const getToxicityIcon = () => {
    if (averageScore > 0.7) return <AlertTriangle className="h-6 w-6 text-red-500" />;
    if (averageScore > 0.4) return <AlertTriangle className="h-6 w-6 text-orange-500" />;
    return <Shield className="h-6 w-6 text-green-500" />;
  };

  const getToxicityStatus = () => {
    if (averageScore > 0.7) return { label: 'High Toxicity', color: 'text-red-600', bg: 'bg-red-50' };
    if (averageScore > 0.4) return { label: 'Moderate Toxicity', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: 'Low Toxicity', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const status = getToxicityStatus();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-lg shadow-md p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Toxicity Analysis</h3>
        <div className={`flex items-center px-3 py-1 rounded-full ${status.bg}`}>
          {getToxicityIcon()}
          <span className={`ml-2 text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Average Score</p>
          <p className="text-xl font-bold text-gray-800">
            {(averageScore * 100).toFixed(1)}%
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Toxic Comments</p>
          <p className="text-xl font-bold text-red-600">
            {totalToxicComments}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Total Comments</p>
          <p className="text-xl font-bold text-gray-800">
            {totalComments}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Toxicity Rate</p>
          <p className="text-xl font-bold text-orange-600">
            {((totalToxicComments / totalComments) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Toxicity Level Distribution</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="level"
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} comments`, 'Count']}
                labelFormatter={(label) => `${label.charAt(0).toUpperCase() + label.slice(1)} Toxicity`}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getToxicityLevelColor(entry.level)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Toxicity Categories</h4>
          <div className="space-y-2">
            {categoryData.slice(0, 6).map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{category.category}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-800 w-12">
                    {category.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ToxicityChart;
