import express from 'express';
import { z } from 'zod';
import { saveProgress, getStatistics, getErrorQuestions, getProgressByQuestion } from '../models/progress';
import { getQuestionsByIds } from '../models/question';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

const progressSchema = z.object({
  question_id: z.string(),
  is_correct: z.boolean(),
});

// POST /api/progress - Save answer progress
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { question_id, is_correct } = progressSchema.parse(req.body);
    const userId = req.userId!;

    const progress = await saveProgress(userId, question_id, is_correct);
    res.status(201).json({ progress });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
});

// GET /api/progress/stats - Get user statistics
router.get('/stats', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const stats = await getStatistics(userId);
    
    if (!stats) {
      return res.json({
        correct_count: 0,
        incorrect_count: 0,
        total_count: 0,
      });
    }

    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

// GET /api/progress/errors - Get error questions list
router.get('/errors', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const errorQuestionIds = await getErrorQuestions(userId);
    
    // Get full question data
    const questions = await getQuestionsByIds(errorQuestionIds);
    res.json({ error_questions: questions });
  } catch (error) {
    next(error);
  }
});

// GET /api/progress/question/:id - Get progress for specific question
router.get('/question/:questionId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const progress = await getProgressByQuestion(userId, req.params.questionId);
    
    if (!progress) {
      return res.json({ progress: null });
    }

    res.json({ progress });
  } catch (error) {
    next(error);
  }
});

export { router };
