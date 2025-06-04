import React from 'react';
import { AnalysisResult } from '../types';
import { Download, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';
import VideoPreview from './VideoPreview';
import SentimentChart from './SentimentChart';
import TopicsChart from './TopicsChart';
import KeywordsCloud from './KeywordsCloud';
import CommentList from './CommentList';
import ToxicityChart from './ToxicityChart';
import { useAnalysis } from '../hooks/useAnalysis';
import { exportToML, convertToCSV, downloadCSV } from '../utils/csvExport';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onNewAnalysis: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onNewAnalysis }) => {
  const { exportAnalysis } = useAnalysis();
  
  const handleExport = async () => {
    await exportAnalysis(result.videoId);
  };
  
  const handleCSVExport = () => {
    const mlData = exportToML(result);
    const csvContent = convertToCSV(mlData);
    const filename = `youtube_analysis_${result.videoId}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto"
    >
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Analysis Results</h2>
        
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </button>
          
          <button
            onClick={handleCSVExport}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export ML Data (CSV)
          </button>
          
          <button
            onClick={onNewAnalysis}
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            New Analysis
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="space-y-6">
        {/* Video preview */}
        {result.videoDetails && (
          <VideoPreview videoDetails={result.videoDetails} />
        )}
        
        {/* Analysis timestamp */}
        <div className="text-sm text-gray-500 italic text-center">
          Analysis performed on {new Date(result.timestamp).toLocaleString()}
        </div>
        
        {/* Charts and visualizations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SentimentChart sentiment={result.sentiment} />
          <TopicsChart topics={result.topics} />
        </div>
        
        {/* Toxicity Analysis */}
        <ToxicityChart toxicity={result.toxicity} />
        
        {/* Keywords cloud */}
        <KeywordsCloud keywords={result.keywords} />
        
        {/* Sample comments */}
        <CommentList comments={result.comments} />
      </div>
    </motion.div>
  );
};

export default AnalysisResults;