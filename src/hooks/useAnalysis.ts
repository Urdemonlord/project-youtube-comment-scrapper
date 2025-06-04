import { useState, useCallback } from 'react';
import { useQuery, useMutation, QueryClient } from 'react-query';
import { analyzeComments, getAnalysisById, exportToExcel } from '../utils/api';
import { AnalysisRequest, AnalysisResult, AnalysisStatus, ApiError } from '../types';
import { extractVideoId, analysisRequestSchema } from '../utils/validators';
import { toast } from 'react-toastify';

const queryClient = new QueryClient();

export function useAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [currentVideoId, setCurrentVideoId] = useState<string>('');

  // Mutation for analyzing comments
  const analysisMutation = useMutation<AnalysisResult, ApiError, AnalysisRequest>(
    analyzeComments,
    {
      onMutate: () => {
        setStatus(AnalysisStatus.LOADING);
      },
      onSuccess: (data) => {
        setStatus(AnalysisStatus.SUCCESS);
        queryClient.invalidateQueries(['analysisHistory']);
        return data;
      },
      onError: () => {
        setStatus(AnalysisStatus.ERROR);
      }
    }
  );

  // Query for fetching a specific analysis by ID
  const getAnalysis = (id: string) => {
    return useQuery<AnalysisResult, ApiError>(
      ['analysis', id],
      () => getAnalysisById(id),
      {
        enabled: !!id,
        refetchOnWindowFocus: false,
        retry: 1
      }
    );
  };

  // Function to handle form submission
  const submitAnalysis = useCallback(async (input: string, analysisPrompt?: string): Promise<AnalysisResult | null> => {
    try {
      // Validate input
      const videoId = extractVideoId(input);
      if (!videoId) {
        toast.error('Invalid YouTube video URL or ID');
        return null;
      }

      // Validate the request using Zod
      const validationResult = analysisRequestSchema.safeParse({ videoId, analysisPrompt });
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
        toast.error(errorMessage);
        return null;
      }

      setCurrentVideoId(videoId);
      
      // Execute the analysis
      const result = await analysisMutation.mutateAsync({
        videoId,
        analysisPrompt: analysisPrompt?.trim() || undefined
      });
      
      return result;
    } catch (error) {
      console.error('Analysis submission error:', error);
      return null;
    }
  }, [analysisMutation]);

  // Function to export analysis to Excel
  const exportAnalysis = useCallback(async (analysisId: string): Promise<void> => {
    try {
      const blob = await exportToExcel(analysisId);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `youtube-analysis-${analysisId}.xlsx`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Export successful!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analysis');
    }
  }, []);

  return {
    status,
    currentVideoId,
    submitAnalysis,
    getAnalysis,
    exportAnalysis,
    isLoading: status === AnalysisStatus.LOADING,
    isSuccess: status === AnalysisStatus.SUCCESS,
    isError: status === AnalysisStatus.ERROR,
    ...analysisMutation
  };
}