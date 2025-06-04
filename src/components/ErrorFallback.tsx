import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertOctagon className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Something went wrong</h2>
        
        <p className="text-gray-600 text-center mb-4">
          We encountered an error while processing your request
        </p>
        
        <div className="bg-red-50 p-3 rounded-md mb-6">
          <p className="text-sm text-red-700 font-mono overflow-auto">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={resetErrorBoundary}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;