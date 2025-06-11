import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { formatNumber } from '../../utils/classNames';

const PaginationControls: React.FC = () => {
  const { pagination, setPagination } = useAppStore();
  
  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);
  const currentPage = pagination.currentPage;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPagination({ currentPage: page });
    }
  };

  const changeItemsPerPage = (itemsPerPage: number) => {
    setPagination({ 
      itemsPerPage, 
      currentPage: 1 // Reset to first page when changing items per page
    });
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * pagination.itemsPerPage + 1;
  const endItem = Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems);

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center justify-between">
        {/* Items info */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{formatNumber(startItem)}</span> to{' '}
            <span className="font-medium">{formatNumber(endItem)}</span> of{' '}
            <span className="font-medium">{formatNumber(pagination.totalItems)}</span> results
          </div>
          
          {/* Items per page selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Per page:
            </label>
            <select
              value={pagination.itemsPerPage}
              onChange={(e) => changeItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center space-x-2">
          {/* First page */}
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          {/* Previous page */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {getPageNumbers().map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <span className="px-3 py-1 text-gray-500 dark:text-gray-400">...</span>
                ) : (
                  <button
                    onClick={() => goToPage(page as number)}
                    className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Next page */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Last page */}
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;
