// Error Analysis Dashboard Component
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Activity,
  TrendingUp,
  FileText,
  Code,
  RefreshCw
} from 'lucide-react';
import { ErrorAnalyzer, generateErrorReport } from '../../utils/errorAnalyzer';

const ErrorAnalysisTab: React.FC = () => {
  const [errorAnalyzer] = useState(() => ErrorAnalyzer.getInstance());
  const [errorReport, setErrorReport] = useState(generateErrorReport());
  const [isRefreshing, setIsRefreshing] = useState(false);
  useEffect(() => {
    // Run import/export analysis
    errorAnalyzer.analyzeImportExportErrors();
    
    // Subscribe to new errors
    const unsubscribe = errorAnalyzer.onError(() => {
      setErrorReport(generateErrorReport());
    });

    return unsubscribe;
  }, [errorAnalyzer]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate analysis refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    errorAnalyzer.analyzeImportExportErrors();
    setErrorReport(generateErrorReport());
    setIsRefreshing(false);
  };

  const handleResolveError = (errorId: string) => {
    errorAnalyzer.resolveError(errorId, 'Manually resolved by user');
    setErrorReport(generateErrorReport());
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'import': return <Code className="h-4 w-4" />;
      case 'build': return <Activity className="h-4 w-4" />;
      case 'runtime': return <AlertTriangle className="h-4 w-4" />;
      case 'api': return <TrendingUp className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Error Analysis & Monitoring
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive error tracking and resolution for the YouTube Comment Analyzer
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Analyzing...' : 'Refresh Analysis'}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Errors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{errorReport.stats.total}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">{errorReport.criticalErrors.length}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{errorReport.stats.resolved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unresolved</p>
              <p className="text-2xl font-bold text-orange-600">{errorReport.stats.unresolved}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </motion.div>
      </div>

      {/* Error Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Analysis Summary
        </h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-300">{errorReport.summary}</p>
        </div>

        {errorReport.recommendations.length > 0 && (
          <div className="mt-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Recommendations
            </h4>
            <ul className="space-y-2">
              {errorReport.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      {/* Critical Errors */}
      {errorReport.criticalErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Critical Errors Requiring Immediate Attention
          </h3>
          <div className="space-y-4">
            {errorReport.criticalErrors.map((error) => (
              <div
                key={error.id}
                className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getTypeIcon(error.type)}
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-300">
                        {error.message}
                      </h4>
                      {error.file && (
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                          File: {error.file} {error.line && `(Line ${error.line})`}
                        </p>
                      )}
                      {error.resolution && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                          <strong>Resolution:</strong> {error.resolution}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleResolveError(error.id)}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Error Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Errors by Type
          </h3>
          <div className="space-y-3">
            {Object.entries(errorReport.stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(type)}
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {type}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Errors by Severity
          </h3>
          <div className="space-y-3">
            {Object.entries(errorReport.stats.bySeverity).map(([severity, count]) => (
              <div key={severity} className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(severity)}`}>
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ErrorAnalysisTab;
