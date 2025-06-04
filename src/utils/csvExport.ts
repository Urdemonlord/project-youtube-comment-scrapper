// CSV Export utility for machine learning data
import { Comment, AnalysisResult } from '../types';

export interface MLExportData {
  comment_id: string;
  comment_text: string;
  author: string;
  published_at: string;
  like_count: number;
  reply_count: number;
  video_id: string;
  video_title: string;
  channel_title: string;
  sentiment_score: number;
  sentiment_label: string;
  toxicity_overall: number;
  toxicity_identity_attack: number;
  toxicity_insult: number;
  toxicity_obscene: number;
  toxicity_severe_toxicity: number;
  toxicity_sexual_explicit: number;
  toxicity_threat: number;
  toxicity_confidence: number;
  is_toxic: number;
  is_positive: number;
  is_negative: number;
  is_neutral: number;
  text_length: number;
  word_count: number;
  exclamation_count: number;
  question_count: number;
  caps_ratio: number;
  categories: string;
  analysis_timestamp: string;
}

export function convertToCSV(data: MLExportData[]): string {
  if (data.length === 0) return '';

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header as keyof MLExportData];
        // Escape quotes and wrap in quotes if contains comma or quote
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  return csvContent;
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function exportToML(analysisResult: AnalysisResult): MLExportData[] {
  return analysisResult.comments.map((comment: Comment) => ({
    comment_id: comment.id,
    comment_text: comment.text.replace(/\n/g, ' ').replace(/\r/g, ''),
    author: comment.author,
    published_at: comment.publishedAt,
    like_count: comment.likeCount,
    reply_count: comment.replyCount,
    
    video_id: analysisResult.videoId,
    video_title: analysisResult.videoDetails?.title || '',
    channel_title: analysisResult.videoDetails?.channelTitle || '',
      sentiment_score: comment.sentiment || 0,
    sentiment_label: (comment.sentiment || 0) > 0.2 ? 'positive' : 
                    (comment.sentiment || 0) < -0.2 ? 'negative' : 'neutral',
    
    toxicity_overall: comment.toxicity?.overall || 0,
    toxicity_identity_attack: comment.toxicity?.categories?.identity_attack || 0,
    toxicity_insult: comment.toxicity?.categories?.insult || 0,
    toxicity_obscene: comment.toxicity?.categories?.obscene || 0,
    toxicity_severe_toxicity: comment.toxicity?.categories?.severe_toxicity || 0,
    toxicity_sexual_explicit: comment.toxicity?.categories?.sexual_explicit || 0,
    toxicity_threat: comment.toxicity?.categories?.threat || 0,
    toxicity_confidence: comment.toxicity?.confidence || 0,
      is_toxic: (comment.toxicity?.overall || 0) > 0.5 ? 1 : 0,
    is_positive: (comment.sentiment || 0) > 0.2 ? 1 : 0,
    is_negative: (comment.sentiment || 0) < -0.2 ? 1 : 0,
    is_neutral: ((comment.sentiment || 0) >= -0.2 && (comment.sentiment || 0) <= 0.2) ? 1 : 0,
    
    text_length: comment.text.length,
    word_count: comment.text.split(/\s+/).length,
    exclamation_count: (comment.text.match(/!/g) || []).length,
    question_count: (comment.text.match(/\?/g) || []).length,
    caps_ratio: (comment.text.match(/[A-Z]/g) || []).length / comment.text.length,
    
    categories: (comment.categories || []).join('; '),
    analysis_timestamp: analysisResult.timestamp
  }));
}
