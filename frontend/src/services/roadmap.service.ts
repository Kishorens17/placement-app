import api from './api';
import type { RoadmapDataResponse } from '../types';

export const roadmapService = {
  async getRoadmap(): Promise<RoadmapDataResponse> {
    const response = await api.get<RoadmapDataResponse>('/roadmap');
    return response.data;
  },

  async updateProgress(payload: {
    conceptName: string;
    completed?: boolean;
    progressPercentage?: number;
    notes?: string;
  }) {
    const response = await api.put('/roadmap/progress', payload);
    return response.data;
  },

  async getAIGuide(payload: {
    conceptName: string;
    currentProgress?: number;
    notes?: string;
  }): Promise<{ conceptName: string; guide: string }> {
    const response = await api.post<{ conceptName: string; guide: string }>('/roadmap/ai-guide', payload);
    return response.data;
  },
};
