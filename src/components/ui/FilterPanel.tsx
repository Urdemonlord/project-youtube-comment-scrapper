import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const FilterPanel: React.FC = () => {
  const { filters, updateFilters } = useAppStore();

  const handleSentimentChange = (sentiment: string, checked: boolean) => {
    const newSentiments = checked
      ? [...filters.sentiment, sentiment]
      : filters.sentiment.filter(s => s !== sentiment);
    
    updateFilters({ sentiment: newSentiments });
  };

  const handleToxicityChange = (toxicity: string, checked: boolean) => {
    const newToxicity = checked
      ? [...filters.toxicity, toxicity]
      : filters.toxicity.filter(t => t !== toxicity);
    
    updateFilters({ toxicity: newToxicity });
  };

  const clearAllFilters = () => {
    updateFilters({
      dateRange: { start: null, end: null },
      sentiment: [],
      toxicity: [],
      search: '',
    });
  };

  const hasActiveFilters = 
    filters.sentiment.length > 0 ||
    filters.toxicity.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.search;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          >
            <X className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateFilters({
                dateRange: {
                  ...filters.dateRange,
                  start: e.target.value ? new Date(e.target.value) : null
                }
              })}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              placeholder="Start date"
            />
            <input
              type="date"
              value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateFilters({
                dateRange: {
                  ...filters.dateRange,
                  end: e.target.value ? new Date(e.target.value) : null
                }
              })}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              placeholder="End date"
            />
          </div>
        </div>

        {/* Sentiment Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sentiment
          </label>
          <div className="space-y-2">
            {[
              { value: 'positive', label: 'Positive', color: 'text-green-600' },
              { value: 'neutral', label: 'Neutral', color: 'text-yellow-600' },
              { value: 'negative', label: 'Negative', color: 'text-red-600' },
            ].map((sentiment) => (
              <label key={sentiment.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.sentiment.includes(sentiment.value)}
                  onChange={(e) => handleSentimentChange(sentiment.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className={`text-sm ${sentiment.color} dark:opacity-80`}>
                  {sentiment.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Toxicity Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Toxicity Level
          </label>
          <div className="space-y-2">
            {[
              { value: 'low', label: 'Low (< 30%)', color: 'text-green-600' },
              { value: 'medium', label: 'Medium (30-70%)', color: 'text-yellow-600' },
              { value: 'high', label: 'High (> 70%)', color: 'text-red-600' },
            ].map((toxicity) => (
              <label key={toxicity.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.toxicity.includes(toxicity.value)}
                  onChange={(e) => handleToxicityChange(toxicity.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className={`text-sm ${toxicity.color} dark:opacity-80`}>
                  {toxicity.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-wrap gap-2">
            {filters.sentiment.map(sentiment => (
              <span
                key={sentiment}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
              >
                {sentiment}
                <button
                  onClick={() => handleSentimentChange(sentiment, false)}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            
            {filters.toxicity.map(toxicity => (
              <span
                key={toxicity}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
              >
                {toxicity} toxicity
                <button
                  onClick={() => handleToxicityChange(toxicity, false)}
                  className="ml-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            
            {(filters.dateRange.start || filters.dateRange.end) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                <Calendar className="h-3 w-3 mr-1" />
                Date range
                <button
                  onClick={() => updateFilters({ dateRange: { start: null, end: null } })}
                  className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FilterPanel;
