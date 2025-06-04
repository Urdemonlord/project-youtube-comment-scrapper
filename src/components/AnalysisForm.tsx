import React, { useState } from 'react';
import { useAnalysis } from '../hooks/useAnalysis';
import { sanitizeInput } from '../utils/validators';
import { Search, AlertTriangle, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnalysisResult } from '../types';

interface AnalysisFormProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({ onAnalysisComplete }) => {
  const [videoInput, setVideoInput] = useState('');
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [inputError, setInputError] = useState('');
  const { submitAnalysis, isLoading } = useAnalysis();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError('');
    
    if (!videoInput.trim()) {
      setInputError('Please enter a YouTube video URL or ID');
      return;
    }
    
    // Sanitize inputs
    const sanitizedVideoInput = sanitizeInput(videoInput);
    const sanitizedPrompt = sanitizeInput(analysisPrompt);
    
    const result = await submitAnalysis(sanitizedVideoInput, sanitizedPrompt);
    if (result) {
      onAnalysisComplete(result);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md p-6 w-full max-w-xl"
    >
      <div className="flex items-center mb-6">
        <Youtube className="h-8 w-8 mr-3 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-800">YouTube Toxicity Analyzer</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="videoInput" className="block text-sm font-medium text-gray-700 mb-1">
            YouTube Video URL or ID
          </label>
          <div className="relative">
            <input
              id="videoInput"
              type="text"
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
              className={`w-full px-4 py-3 pl-10 rounded-md border ${
                inputError ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              disabled={isLoading}
            />
            <Youtube className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          </div>
          {inputError && (
            <div className="flex items-center mt-1 text-red-500 text-sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {inputError}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="analysisPrompt" className="block text-sm font-medium text-gray-700 mb-1">
            Analysis Prompt (Optional)
          </label>
          <textarea
            id="analysisPrompt"
            value={analysisPrompt}
            onChange={(e) => setAnalysisPrompt(e.target.value)}
            placeholder="Specify what aspects of the comments you'd like to analyze (e.g., toxicity levels, specific topics, emotional patterns)..."
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
            disabled={isLoading}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            Characters: {analysisPrompt.length}/500
          </p>
          <div className="mt-2 text-xs text-gray-600">
            <p className="font-medium mb-1">💡 Suggested prompts:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Focus on detecting cyberbullying and harassment patterns</li>
              <li>Analyze emotional intensity and aggressive language</li>
              <li>Identify constructive vs destructive criticism</li>
              <li>Examine cultural sensitivity and inclusive language</li>
            </ul>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-md bg-blue-600 text-white font-medium flex items-center justify-center transition-all duration-200 ${
            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Comments...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Analyze Comments
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default AnalysisForm;