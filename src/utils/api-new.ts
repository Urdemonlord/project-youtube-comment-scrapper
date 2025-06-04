import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { ApiError, AnalysisRequest, AnalysisResult } from '../types';
import { toast } from 'react-toastify';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 120000, // Increase timeout to 2 minutes for analysis
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding auth headers or handling requests
api.interceptors.request.use(
  config => {
    console.log('🚀 Making API request to:', config.url);
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ API response received:', response.status);
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ API Error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. The analysis is taking too long. Please try again.';
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      errorMessage = 'Network error. Please check if the server is running.';
    } else if (error.response) {
      // Server responded with an error status
      const status = error.response.status;
      
      if (status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        errorMessage = 'Resource not found.';
      } else if (status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (status >= 500) {
        errorMessage = 'Server error. Please try again later.';      }
      
      const data = error.response.data as { message?: string };
      if (data && data.message) {
        errorMessage = data.message;
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'No response from server. Please check your connection and ensure the server is running.';
    }
    
    // Show error notification
    toast.error(errorMessage);
    
    return Promise.reject({
      statusCode: error.response?.status || 500,
      message: errorMessage,
      details: error.message
    } as ApiError);
  }
);

// API functions
export const analyzeComments = async (data: AnalysisRequest): Promise<AnalysisResult> => {
  console.log('📊 Starting comment analysis for:', data.videoId);
  try {
    const response = await api.post<AnalysisResult>('/analyze-comments', data);
    console.log('✅ Analysis completed successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw error;
  }
};

export const getAnalysisHistory = async (): Promise<AnalysisResult[]> => {
  const response = await api.get<AnalysisResult[]>('/analysis-history');
  return response.data;
};

export const getAnalysisById = async (id: string): Promise<AnalysisResult> => {
  const response = await api.get<AnalysisResult>(`/analysis/${id}`);
  return response.data;
};

export const exportToExcel = async (analysisId: string): Promise<Blob> => {
  const response = await api.get(`/export-excel/${analysisId}`, {
    responseType: 'blob'
  });
  return response.data;
};

export default api;
