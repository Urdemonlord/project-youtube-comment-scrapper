import React, { useMemo } from 'react';
import { Eye, Search } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { debounce } from '../../utils/classNames';

const ResultsTab: React.FC = () => {
  const { 
    sessions, 
    filters, 
    updateFilters, 
    sortBy, 
    setSortBy, 
    sortOrder, 
    setSortOrder,
    pagination,
    setPagination,
    currentSessionId 
  } = useAppStore();

  // Get current session results
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const allComments = useMemo(() => 
    currentSession?.result?.comments || [], 
    [currentSession?.result?.comments]
  );

  // Apply filters and search
  const filteredComments = useMemo(() => {
    let filtered = [...allComments];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(comment => 
        comment.text.toLowerCase().includes(searchLower) ||
        comment.author.toLowerCase().includes(searchLower)
      );
    }    // Sentiment filter
    if (filters.sentiment.length > 0) {
      filtered = filtered.filter(comment => {
        if (comment.sentiment === undefined) return false;
        const sentimentLabel = comment.sentiment > 0.1 ? 'positive' : 
                             comment.sentiment < -0.1 ? 'negative' : 'neutral';
        return filters.sentiment.includes(sentimentLabel);
      });
    }

    // Toxicity filter
    if (filters.toxicity.length > 0) {
      filtered = filtered.filter(comment => {
        if (!comment.toxicity) return false;
        
        const toxicity = comment.toxicity.overall;
        return filters.toxicity.some(range => {
          switch (range) {
            case 'low':
              return toxicity < 0.3;
            case 'medium':
              return toxicity >= 0.3 && toxicity < 0.7;
            case 'high':
              return toxicity >= 0.7;
            default:
              return false;
          }
        });
      });
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(comment => {
        const commentDate = new Date(comment.publishedAt);
        if (filters.dateRange.start && commentDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && commentDate > filters.dateRange.end) {
          return false;
        }
        return true;
      });
    }

    return filtered;
  }, [allComments, filters]);

  // Apply sorting
  const sortedComments = useMemo(() => {
    const sorted = [...filteredComments];
    sorted.sort((a, b) => {
      let aValue: number | string, bValue: number | string;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.publishedAt).getTime();
          bValue = new Date(b.publishedAt).getTime();
          break;
        case 'likes':
          aValue = a.likeCount;
          bValue = b.likeCount;
          break;
        case 'replies':
          aValue = a.replyCount;
          bValue = b.replyCount;
          break;
        case 'toxicity':
          aValue = a.toxicity?.overall || 0;
          bValue = b.toxicity?.overall || 0;
          break;
        default:
          aValue = new Date(a.publishedAt).getTime();
          bValue = new Date(b.publishedAt).getTime();
      }
      
      const modifier = sortOrder === 'asc' ? 1 : -1;
      return aValue < bValue ? -modifier : aValue > bValue ? modifier : 0;
    });
    
    return sorted;
  }, [filteredComments, sortBy, sortOrder]);

  // Pagination
  const paginatedComments = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    return sortedComments.slice(startIndex, startIndex + pagination.itemsPerPage);
  }, [sortedComments, pagination.currentPage, pagination.itemsPerPage]);

  // Update total items when sortedComments change
  React.useEffect(() => {
    setPagination({ totalItems: sortedComments.length });
  }, [sortedComments.length, setPagination]);  // Debounced search
  const handleSearch = (value: string) => {
    updateFilters({ search: value });
    setPagination({ currentPage: 1 });
  };
  const debouncedSearch = debounce(handleSearch as (...args: unknown[]) => unknown, 300) as (value: string) => void;

  const handleSortChange = (field: string) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (!currentSession) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Session Selected</h3>
          <p>Please start an analysis to view results</p>
        </div>
      </div>
    );
  }

  if (!currentSession.result) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Results Available</h3>
          <p>Analysis is still in progress or failed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analysis Results
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {sortedComments.length} comments found
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search comments..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Results List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Comments ({paginatedComments.length})
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleSortChange('date')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Sort by Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSortChange('likes')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Sort by Likes {sortBy === 'likes' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSortChange('toxicity')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Sort by Toxicity {sortBy === 'toxicity' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedComments.length > 0 ? (
            paginatedComments.map((comment) => (
              <div key={comment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.author}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                      {comment.text}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>👍 {comment.likeCount}</span>
                      <span>💬 {comment.replyCount}</span>                      {comment.sentiment !== undefined && (
                        <span className={`px-2 py-1 rounded-full ${
                          comment.sentiment > 0.1 ? 'bg-green-100 text-green-800' :
                          comment.sentiment < -0.1 ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {comment.sentiment > 0.1 ? 'positive' : 
                           comment.sentiment < -0.1 ? 'negative' : 'neutral'}
                        </span>
                      )}
                      {comment.toxicity && (
                        <span className={`px-2 py-1 rounded-full ${
                          comment.toxicity.overall > 0.7 ? 'bg-red-100 text-red-800' :
                          comment.toxicity.overall > 0.3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          Toxicity: {(comment.toxicity.overall * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Comments Found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {sortedComments.length > pagination.itemsPerPage && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, sortedComments.length)} of{' '}
            {sortedComments.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPagination({ currentPage: Math.max(1, pagination.currentPage - 1) })}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {pagination.currentPage} of {Math.ceil(sortedComments.length / pagination.itemsPerPage)}
            </span>
            <button
              onClick={() => setPagination({ currentPage: pagination.currentPage + 1 })}
              disabled={pagination.currentPage >= Math.ceil(sortedComments.length / pagination.itemsPerPage)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsTab;