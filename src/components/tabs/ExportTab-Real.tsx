import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Database,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Video,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { 
  generateCSV, 
  generateJSON, 
  generateExcelData, 
  generateTextReport,
  downloadFile,
  generateFilename,
  validateExportData,
  type ExportData 
} from '../../utils/exportUtils';
import type { ScrapingSession } from '../../types';

// Safe date formatting utility
const formatDate = (date: Date | string | number | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    if (date instanceof Date) {
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    }
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleDateString();
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'Date Error';
  }
};

const formatDateTime = (date: Date | string | number | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleString();
  } catch {
    return 'Date Error';
  }
};

interface ExportJob {
  id: string;
  type: 'csv' | 'excel' | 'json' | 'text' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sessionIds: string[];
  createdAt: Date;
  completedAt?: Date;
  progress: number;
  error?: string;
  filename?: string;
}

const ExportTab: React.FC = () => {
  const { sessions, currentUser, addNotification } = useAppStore();
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const safeSessions: ScrapingSession[] = sessions || [];

  const handleSessionToggle = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const selectAllSessions = () => {
    setSelectedSessions(safeSessions.map(s => s.id));
  };

  const clearSelection = () => {
    setSelectedSessions([]);
  };

  // Real export implementation with actual file generation
  const handleRealExport = async (type: ExportJob['type']) => {
    if (selectedSessions.length === 0) {
      addNotification({
        type: 'warning',
        message: 'Please select at least one session to export'
      });
      return;
    }

    setIsExporting(true);
    
    const newJob: ExportJob = {
      id: `export_${Date.now()}`,
      type,
      status: 'processing',
      sessionIds: [...selectedSessions],
      createdAt: new Date(),
      progress: 0
    };

    setExportJobs(prev => [newJob, ...prev]);

    try {
      // Progress tracking
      const updateProgress = (progress: number) => {
        setExportJobs(prev => prev.map(job => 
          job.id === newJob.id ? { ...job, progress } : job
        ));
      };

      updateProgress(10);
      addNotification({
        type: 'info',
        message: `Starting ${type.toUpperCase()} export...`
      });

      // Prepare export data
      const selectedSessionsData = safeSessions.filter(s => 
        selectedSessions.includes(s.id)
      );
        const exportData: ExportData = {
        sessions: selectedSessionsData,
        exportMetadata: {
          exportedAt: new Date(),
          totalSessions: selectedSessionsData.length,
          exportedBy: currentUser?.username || 'Unknown User',
          appVersion: '1.0.0'
        }
      };

      // Validate data
      const validation = validateExportData(exportData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      updateProgress(30);

      // Generate file based on type
      let filename: string;
      let content: string | Blob;
      let mimeType: string;

      switch (type) {
        case 'csv':
          filename = generateFilename('csv', 'youtube-analysis');
          content = generateCSV(exportData);
          mimeType = 'text/csv;charset=utf-8;';
          updateProgress(80);
          break;

        case 'json':
          filename = generateFilename('json', 'youtube-analysis');
          content = generateJSON(exportData);
          mimeType = 'application/json;charset=utf-8;';
          updateProgress(80);
          break;        case 'excel': {
          filename = generateFilename('xlsx', 'youtube-analysis');
          const excelData = generateExcelData(exportData);
          
          // Create workbook with multiple sheets
          const wb = XLSX.utils.book_new();
          
          // Sessions sheet
          const sessionsWS = XLSX.utils.json_to_sheet(excelData.sessions);
          XLSX.utils.book_append_sheet(wb, sessionsWS, 'Sessions');
          
          // Comments sheet (if available)
          if (excelData.comments.length > 0) {
            const commentsWS = XLSX.utils.json_to_sheet(excelData.comments);
            XLSX.utils.book_append_sheet(wb, commentsWS, 'Comments');
          }
          
          // Summary sheet
          const summaryWS = XLSX.utils.json_to_sheet(excelData.summary);
          XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
          
          updateProgress(70);
          
          // Generate Excel file
          const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          content = new Blob([excelBuffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          });
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          updateProgress(80);
          break;
        }

        case 'text':
          filename = generateFilename('txt', 'youtube-analysis-report');
          content = generateTextReport(exportData);
          mimeType = 'text/plain;charset=utf-8;';
          updateProgress(80);
          break;

        case 'pdf':
          // For now, generate a formatted text file
          // In production, you'd use jsPDF or similar
          filename = generateFilename('txt', 'youtube-analysis-report');
          content = generateTextReport(exportData);
          mimeType = 'text/plain;charset=utf-8;';
          updateProgress(80);
          addNotification({
            type: 'info',
            message: 'PDF export generated as text file (PDF library not installed)'
          });
          break;

        default:
          throw new Error(`Unsupported export type: ${type}`);
      }

      updateProgress(90);

      // Download the file
      const downloadSuccess = downloadFile(content, filename, mimeType);
      
      if (!downloadSuccess) {
        throw new Error('File download failed');
      }

      updateProgress(100);

      // Update job status
      setExportJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { 
              ...job, 
              status: 'completed' as const,
              completedAt: new Date(),
              progress: 100,
              filename
            }
          : job
      ));

      addNotification({
        type: 'success',
        message: `✅ ${type.toUpperCase()} file "${filename}" downloaded successfully!`
      });

    } catch (error) {
      console.error('Export error:', error);
      
      setExportJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { 
              ...job, 
              status: 'failed' as const,
              error: error instanceof Error ? error.message : 'Export failed'
            }
          : job
      ));

      addNotification({
        type: 'error',
        message: `❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const retryExport = (job: ExportJob) => {
    // Re-select the same sessions and retry
    setSelectedSessions(job.sessionIds);
    handleRealExport(job.type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Export & Reports
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Export analysis results and generate downloadable reports ({safeSessions.length} sessions available)
          </p>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            id: 'csv', 
            name: 'CSV Export', 
            icon: FileSpreadsheet, 
            description: 'Comma-separated values for data analysis',
            color: 'green'
          },
          { 
            id: 'excel', 
            name: 'Excel Workbook', 
            icon: Database, 
            description: 'Full Excel file with multiple sheets',
            color: 'blue'
          },
          { 
            id: 'json', 
            name: 'JSON Data', 
            icon: BarChart3, 
            description: 'Machine-readable format for developers',
            color: 'purple'
          },
          { 
            id: 'text', 
            name: 'Text Report', 
            icon: FileText, 
            description: 'Human-readable analysis summary',
            color: 'red'
          }
        ].map(format => {
          const Icon = format.icon;
          return (
            <motion.div
              key={format.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border p-6 hover:shadow-md transition-shadow"
            >
              <Icon className={`h-8 w-8 text-${format.color}-600 mb-3`} />
              <h3 className="text-lg font-semibold mb-2">{format.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{format.description}</p>
              <button 
                onClick={() => handleRealExport(format.id as ExportJob['type'])}
                disabled={isExporting || selectedSessions.length === 0}
                className={`w-full px-4 py-2 rounded font-medium transition-colors flex items-center justify-center space-x-2 ${
                  isExporting || selectedSessions.length === 0
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : `bg-${format.color}-600 text-white hover:bg-${format.color}-700`
                }`}
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download {format.name}</span>
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Session Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Sessions to Export</h3>
            <div className="flex space-x-2">
              <button
                onClick={selectAllSessions}
                disabled={safeSessions.length === 0}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                disabled={selectedSessions.length === 0}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {selectedSessions.length} of {safeSessions.length} sessions selected
          </p>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {safeSessions.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <Video className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>No analysis sessions available</p>
              <p className="text-sm">Run some analysis first to export data</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {safeSessions.map((session) => (
                <div key={session.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedSessions.includes(session.id)}
                      onChange={() => handleSessionToggle(session.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {session.title || 'Untitled Session'}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(session.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <Video className="h-3 w-3 mr-1" />
                          {session.result?.comments?.length || 0} comments
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        session.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                          : session.status === 'error'
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                          : session.status === 'scraping'
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Export Jobs History */}
      {exportJobs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export History</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Recent export jobs and downloads</p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
            {exportJobs.map((job) => (
              <div key={job.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(job.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {job.type.toUpperCase()} Export
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {job.sessionIds.length} sessions • {formatDateTime(job.createdAt)}
                      </p>
                      {job.filename && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          File: {job.filename}
                        </p>
                      )}
                      {job.status === 'processing' && (
                        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress}%` }}
                          ></div>
                        </div>
                      )}
                      {job.error && (
                        <p className="text-xs text-red-500 mt-1">
                          Error: {job.error}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {job.status === 'completed' && (
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Downloaded
                      </span>
                    )}
                    {job.status === 'failed' && (
                      <button 
                        onClick={() => retryExport(job)}
                        disabled={isExporting}
                        className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportTab;
