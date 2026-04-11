import express from 'express';
import { z } from 'zod';
import { getQuestions, getQuestionById } from '../models/question';
import { authenticate } from '../middleware/auth';

const router = express.Router();

const querySchema = z.object({
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  topic_id: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

// GET /api/questions - Get questions with optional filters
router.get('/', authenticate, async (req, res, next) => {
  try {
    const filters = querySchema.parse(req.query);
    const questions = await getQuestions(filters);
    res.json({ questions });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
});

// GET /api/questions/:id - Get single question
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const question = await getQuestionById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ question });
  } catch (error) {
    next(error);
  }
});

export { router };
