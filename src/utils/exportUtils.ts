// Export Utilities for YouTube Comment Analyzer
import type { ScrapingSession, AnalysisResult } from '../types';

export interface ExportData {
  sessions: ScrapingSession[];
  analysisResults?: AnalysisResult[];
  exportMetadata: {
    exportedAt: Date;
    totalSessions: number;
    exportedBy: string;
    appVersion: string;
  };
}

// CSV Export Generator
export const generateCSV = (data: ExportData): string => {
  const headers = [
    'Session ID',
    'Video Title',
    'Video ID',
    'Video URL',
    'Created At',
    'Status',
    'Comments Count',
    'Avg Sentiment',
    'Positive Comments',
    'Negative Comments',
    'Neutral Comments',
    'Toxicity Rate',
    'High Toxicity Count',
    'Duration (minutes)'
  ];

  const rows = data.sessions.map(session => {
    const result = session.result;
    const createdAt = session.createdAt instanceof Date ? session.createdAt : new Date(session.createdAt);
    const completedAt = session.completedAt ? (session.completedAt instanceof Date ? session.completedAt : new Date(session.completedAt)) : null;
    const duration = completedAt ? Math.round((completedAt.getTime() - createdAt.getTime()) / (1000 * 60)) : 0;    return [
      session.id,
      session.title || 'Untitled',
      session.videoId || 'N/A',
      session.videoUrl || 'N/A',
      createdAt.toISOString(),
      session.status,
      result?.comments?.length || 0,
      result?.sentiment?.overall || 0,
      result?.sentiment?.positive || 0,
      result?.sentiment?.negative || 0,
      result?.sentiment?.neutral || 0,
      result?.toxicity?.averageScore || 0,
      result?.toxicity?.totalToxicComments || 0,
      duration
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma or quote
      const stringCell = String(cell);
      if (stringCell.includes(',') || stringCell.includes('"') || stringCell.includes('\n')) {
        return `"${stringCell.replace(/"/g, '""')}"`;
      }
      return stringCell;
    }).join(','))
    .join('\n');

  return csvContent;
};

// JSON Export Generator
export const generateJSON = (data: ExportData): string => {
  const exportObject = {
    metadata: data.exportMetadata,
    sessions: data.sessions.map(session => ({
      ...session,
      createdAt: session.createdAt instanceof Date ? session.createdAt.toISOString() : session.createdAt,
      completedAt: session.completedAt ? (session.completedAt instanceof Date ? session.completedAt.toISOString() : session.completedAt) : null,
    })),    summary: {
      totalSessions: data.sessions.length,
      completedSessions: data.sessions.filter(s => s.status === 'completed').length,
      failedSessions: data.sessions.filter(s => s.status === 'error').length,
      totalComments: data.sessions.reduce((sum, s) => sum + (s.result?.comments?.length || 0), 0),
      avgSentiment: data.sessions.reduce((sum, s) => sum + (s.result?.sentiment?.overall || 0), 0) / data.sessions.length,
      avgToxicity: data.sessions.reduce((sum, s) => sum + (s.result?.toxicity?.averageScore || 0), 0) / data.sessions.length
    }
  };

  return JSON.stringify(exportObject, null, 2);
};

// Excel Data Structure Generator
export const generateExcelData = (data: ExportData) => {
  // Sessions Sheet
  const sessionsData = data.sessions.map(session => {
    const result = session.result;
    const createdAt = session.createdAt instanceof Date ? session.createdAt : new Date(session.createdAt);
    const completedAt = session.completedAt ? (session.completedAt instanceof Date ? session.completedAt : new Date(session.completedAt)) : null;    return {
      'Session ID': session.id,
      'Video Title': session.title || 'Untitled',
      'Video ID': session.videoId || 'N/A',
      'Video URL': session.videoUrl || 'N/A',
      'Created At': createdAt.toLocaleDateString(),
      'Status': session.status,
      'Comments Count': result?.comments?.length || 0,
      'Overall Sentiment': result?.sentiment?.overall || 0,
      'Positive %': result?.sentiment?.positive || 0,
      'Negative %': result?.sentiment?.negative || 0,
      'Neutral %': result?.sentiment?.neutral || 0,
      'Toxicity Rate': result?.toxicity?.averageScore || 0,
      'High Toxicity Count': result?.toxicity?.totalToxicComments || 0,
      'Duration (min)': completedAt ? Math.round((completedAt.getTime() - createdAt.getTime()) / (1000 * 60)) : 0
    };
  });
  // Comments Sheet (for completed sessions)
  const commentsData: Array<Record<string, string | number>> = [];
  data.sessions.forEach(session => {
    if (session.result?.comments) {
      session.result.comments.forEach(comment => {
        commentsData.push({
          'Session ID': session.id,
          'Video Title': session.title || 'Untitled',
          'Author': comment.author,
          'Comment Text': comment.text,
          'Published At': comment.publishedAt,
          'Likes': comment.likeCount || 0,
          'Replies': comment.replyCount || 0,
          'Sentiment': comment.sentiment || 0,
          'Toxicity Score': comment.toxicity?.overall || 0,
          'Is Toxic': (comment.toxicity?.overall || 0) > 0.5 ? 'Yes' : 'No'
        });
      });
    }
  });
  // Summary Sheet
  const summaryData = [{
    'Export Date': data.exportMetadata.exportedAt.toLocaleDateString(),
    'Exported By': data.exportMetadata.exportedBy,
    'App Version': data.exportMetadata.appVersion,
    'Total Sessions': data.sessions.length,
    'Completed Sessions': data.sessions.filter(s => s.status === 'completed').length,
    'Failed Sessions': data.sessions.filter(s => s.status === 'error').length,
    'Total Comments': data.sessions.reduce((sum, s) => sum + (s.result?.comments?.length || 0), 0),
    'Average Sentiment': (data.sessions.reduce((sum, s) => sum + (s.result?.sentiment?.overall || 0), 0) / data.sessions.length).toFixed(2),
    'Average Toxicity': (data.sessions.reduce((sum, s) => sum + (s.result?.toxicity?.averageScore || 0), 0) / data.sessions.length).toFixed(2)
  }];

  return {
    sessions: sessionsData,
    comments: commentsData,
    summary: summaryData
  };
};

// Text Report Generator
export const generateTextReport = (data: ExportData): string => {
  const completedSessions = data.sessions.filter(s => s.status === 'completed');
  const totalComments = data.sessions.reduce((sum, s) => sum + (s.result?.comments?.length || 0), 0);
  const avgSentiment = data.sessions.reduce((sum, s) => sum + (s.result?.sentiment?.overall || 0), 0) / data.sessions.length;
  const avgToxicity = data.sessions.reduce((sum, s) => sum + (s.result?.toxicity?.averageScore || 0), 0) / data.sessions.length;

  const report = `
YOUTUBE COMMENT ANALYSIS REPORT
${data.exportMetadata.exportedAt.toLocaleDateString()} ${data.exportMetadata.exportedAt.toLocaleTimeString()}

Generated by: ${data.exportMetadata.exportedBy}
App Version: ${data.exportMetadata.appVersion}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Total Sessions: ${data.sessions.length}
• Completed Sessions: ${completedSessions.length}
• Failed Sessions: ${data.sessions.filter(s => s.status === 'error').length}
• Total Comments Analyzed: ${totalComments.toLocaleString()}
• Average Sentiment Score: ${avgSentiment.toFixed(2)} (-1 to 1 scale)
• Average Toxicity Rate: ${(avgToxicity * 100).toFixed(1)}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SESSION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.sessions.map(session => {
  const result = session.result;
  const createdAt = session.createdAt instanceof Date ? session.createdAt : new Date(session.createdAt);
  
  return `
Session: ${session.title || 'Untitled'}
  ID: ${session.id}
  Video ID: ${session.videoId || 'N/A'}
  Created: ${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}
  Status: ${session.status.toUpperCase()}
  Comments: ${result?.comments?.length || 0}
  Sentiment: ${result?.sentiment?.overall?.toFixed(2) || 'N/A'}
  Toxicity: ${result?.toxicity?.averageScore ? (result.toxicity.averageScore * 100).toFixed(1) + '%' : 'N/A'}
  ${result?.sentiment ? `
  Sentiment Breakdown:
    • Positive: ${result.sentiment.positive || 0}%
    • Negative: ${result.sentiment.negative || 0}%
    • Neutral: ${result.sentiment.neutral || 0}%` : ''}
  ${result?.toxicity ? `
  Toxicity Analysis:
    • High Toxicity Comments: ${result.toxicity.totalToxicComments || 0}
    • Overall Rate: ${(result.toxicity.averageScore * 100).toFixed(1)}%` : ''}
`;
}).join('\n──────────────────────────────────────────────────────────────────────────────\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSIGHTS & RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${avgSentiment > 0.1 ? '✅ Overall sentiment is positive' : avgSentiment < -0.1 ? '⚠️  Overall sentiment is negative' : 'ℹ️  Overall sentiment is neutral'}
${avgToxicity > 0.3 ? '⚠️  High toxicity detected - consider content moderation' : avgToxicity > 0.1 ? 'ℹ️  Moderate toxicity levels detected' : '✅ Low toxicity levels - healthy community'}
${totalComments > 1000 ? '📊 Large dataset - results are statistically significant' : '📊 Consider collecting more comments for better insights'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Report generated by YouTube Comment Analyzer
For more detailed analysis, use the Excel or CSV export options.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  return report.trim();
};

// File Download Utility
export const downloadFile = (content: string | Blob, filename: string, mimeType: string) => {
  try {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup URL object after a short delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
};

// Generate filename with timestamp
export const generateFilename = (type: string, baseName = 'youtube-analysis'): string => {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  
  return `${baseName}-${timestamp}-${time}.${type}`;
};

// Validate export data
export const validateExportData = (data: ExportData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.sessions || data.sessions.length === 0) {
    errors.push('No sessions to export');
  }
  
  if (!data.exportMetadata) {
    errors.push('Missing export metadata');
  }
  
  if (!data.exportMetadata?.exportedBy) {
    errors.push('Missing user information');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
