import { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AnalysisForm from './components/AnalysisForm';
import AnalysisResults from './components/AnalysisResults';
import ErrorFallback from './components/ErrorFallback';
import { AnalysisResult } from './types';
import { motion } from 'framer-motion';

// Initialize Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="min-h-screen bg-gray-100 py-8 px-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <header className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                YouTube Comment Toxicity & Sentiment Analyzer
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Advanced AI-powered analysis of YouTube comments with toxicity detection, sentiment analysis, topic modeling, and ML-ready data export for content moderation and research.
              </p>
            </header>

            <main>
              {analysisResult ? (
                <AnalysisResults 
                  result={analysisResult} 
                  onNewAnalysis={handleNewAnalysis} 
                />
              ) : (
                <div className="flex justify-center">
                  <AnalysisForm onAnalysisComplete={handleAnalysisComplete} />
                </div>
              )}
            </main>

            <footer className="mt-12 text-center text-sm text-gray-500">
              <p>© {new Date().getFullYear()} YouTube Comment Toxicity & Sentiment Analyzer. All rights reserved.</p>
              <p className="mt-1">Powered by Google Gemini AI for advanced content analysis</p>
            </footer>
          </motion.div>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;