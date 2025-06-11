import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Image, 
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Database,
  BarChart3
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { ScrapingSession } from '../../types';

interface ExportFormat {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  format: string;
  color: 'green' | 'red' | 'purple' | 'blue' | 'orange';
  features: string[];
}

interface ExportJob {
  id: string;
  title: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  createdAt: Date;
  downloadUrl?: string;
}

const ExportTab: React.FC = () => {
  const { sessions, addNotification } = useAppStore();
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);

  const exportFormats: ExportFormat[] = [
    {
      id: 'excel',
      title: 'Excel Export',
      description: 'Comprehensive data in spreadsheet format with multiple sheets',
      icon: FileSpreadsheet,
      format: 'XLSX',
      color: 'green',
      features: ['Multiple sheets', 'Formatted tables', 'Charts included', 'Raw data export'],
    },
    {
      id: 'pdf',
      title: 'PDF Report',
      description: 'Professional formatted report with charts and analysis',
      icon: FileText,
      format: 'PDF',
      color: 'red',
      features: ['Executive summary', 'Visual charts', 'Detailed analysis', 'Professional layout'],
    },
    {
      id: 'charts',
      title: 'Visual Charts',
      description: 'Export charts and visualizations as images',
      icon: Image,
      format: 'PNG/SVG',
      color: 'purple',
      features: ['High resolution', 'Multiple formats', 'Customizable themes', 'Batch export'],
    },
    {
      id: 'json',
      title: 'JSON Data',
      description: 'Raw data in JSON format for developers',
      icon: Database,
      format: 'JSON',
      color: 'blue',
      features: ['Complete dataset', 'API-ready format', 'Structured data', 'Easy integration'],
    },
    {
      id: 'dashboard',
      title: 'Interactive Dashboard',
      description: 'HTML dashboard with interactive elements',
      icon: BarChart3,
      format: 'HTML',
      color: 'orange',
      features: ['Interactive charts', 'Responsive design', 'Offline viewing', 'Custom branding'],
    },
  ];

  const handleExport = async (formatId: string) => {
    if (selectedSessions.length === 0) {      addNotification({
        type: 'warning',
        message: 'No Sessions Selected - Please select at least one session to export.',
      });
      return;
    }

    const format = exportFormats.find(f => f.id === formatId);
    if (!format) return;

    const newJob: ExportJob = {
      id: Date.now().toString(),
      title: `${format.title} - ${selectedSessions.length} session(s)`,
      format: format.format,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    };

    setExportJobs(prev => [newJob, ...prev]);    addNotification({
      type: 'info',
      message: `Export Started - Your ${format.title} export has been queued for processing.`,
    });

    // Simulate export progress
    simulateExportProgress(newJob.id);
  };

  const simulateExportProgress = (jobId: string) => {
    const updateProgress = (progress: number) => {
      setExportJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: 'processing', progress } : job
      ));
    };

    const intervals = [
      { delay: 500, progress: 25 },
      { delay: 1000, progress: 50 },
      { delay: 1500, progress: 75 },
      { delay: 2000, progress: 100 },
    ];

    intervals.forEach(({ delay, progress }) => {
      setTimeout(() => updateProgress(progress), delay);
    });

    setTimeout(() => {
      setExportJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              status: 'completed', 
              progress: 100,
              downloadUrl: `/api/export/${jobId}/download`
            } 
          : job
      ));      addNotification({
        type: 'success',
        message: 'Export Completed - Your export is ready for download.',
      });
    }, 2500);
  };

  const handleSessionToggle = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };
  const selectAllSessions = () => {
    setSelectedSessions(sessions.map((s: ScrapingSession) => s.id));
  };

  const clearSelection = () => {
    setSelectedSessions([]);
  };

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'processing':
        return <Play className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ExportJob['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
    }
  };

  const colorClasses = {
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Export & Reports
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Export your analysis results in various formats and track export progress
        </p>
      </div>

      {/* Session Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Sessions to Export
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={selectAllSessions}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Select All
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={clearSelection}
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              Clear
            </button>
          </div>
        </div>        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
          {sessions.map((session: ScrapingSession) => (
            <div
              key={session.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedSessions.includes(session.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              onClick={() => handleSessionToggle(session.id)}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedSessions.includes(session.id)}
                  onChange={() => handleSessionToggle(session.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {session.title || `Session ${session.id.slice(-8)}`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {session.result?.comments?.length || 0} comments • {session.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedSessions.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {selectedSessions.length} session(s) selected for export
            </p>
          </div>
        )}
      </motion.div>

      {/* Export Formats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exportFormats.map((exportType, index) => {
          const Icon = exportType.icon;
          
          return (
            <motion.div
              key={exportType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 ${colorClasses[exportType.color]} p-6 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[exportType.color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                  {exportType.format}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {exportType.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {exportType.description}
              </p>
              
              <ul className="space-y-1 mb-6">
                {exportType.features.map((feature, idx) => (
                  <li key={idx} className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleExport(exportType.id)}
                disabled={selectedSessions.length === 0}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Export Jobs */}
      {exportJobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Export History
          </h3>
          
          <div className="space-y-4">
            {exportJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4 flex-1">
                  {getStatusIcon(job.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {job.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {job.createdAt.toLocaleString()} • {job.format}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {job.status === 'processing' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {job.progress}%
                      </span>
                    </div>
                  )}
                  
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                  
                  {job.status === 'completed' && job.downloadUrl && (
                    <button                      onClick={() => {
                        // Simulate download
                        addNotification({
                          type: 'success',
                          message: 'Download Started - Your file download has started.',
                        });
                      }}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExportTab;
