import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import {
  getUserRoadmap,
  updateUserConceptProgress,
  generateConceptAIGuide,
} from '../services/roadmap.service.js';

export async function getRoadmapController(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const roadmapData = await getUserRoadmap(userId);
    return res.json(roadmapData);
  } catch (error: any) {
    console.error('getRoadmapController error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch roadmap data' });
  }
}

export async function updateProgressController(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { conceptName, completed, progressPercentage, notes } = req.body;

    if (!conceptName) {
      return res.status(400).json({ error: 'conceptName is required' });
    }

    const updated = await updateUserConceptProgress(userId, {
      conceptName,
      completed,
      progressPercentage,
      notes,
    });

    // Also return refreshed overall stats
    const roadmapData = await getUserRoadmap(userId);

    return res.json({
      message: 'Progress updated successfully',
      updated,
      stats: roadmapData.stats,
    });
  } catch (error: any) {
    console.error('updateProgressController error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update roadmap progress' });
  }
}

export async function getAIGuideController(req: AuthRequest, res: Response) {
  try {
    const { conceptName, currentProgress, notes } = req.body;

    if (!conceptName) {
      return res.status(400).json({ error: 'conceptName is required' });
    }

    const guide = await generateConceptAIGuide(
      conceptName,
      typeof currentProgress === 'number' ? currentProgress : 0,
      notes || ''
    );

    return res.json({
      conceptName,
      guide,
    });
  } catch (error: any) {
    console.error('getAIGuideController error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate AI guide' });
  }
}
