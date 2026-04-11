import { query } from '../config/database';

export interface UserProgress {
  id: string;
  user_id: string;
  question_id: string;
  is_correct: boolean;
  attempts: number;
  last_reviewed: Date;
  status: 'new' | 'learning' | 'mastered' | 'error';
}

export interface UserStatistics {
  correct_count: number;
  incorrect_count: number;
  total_count: number;
}

export const saveProgress = async (
  userId: string,
  questionId: string,
  isCorrect: boolean
) => {
  const result = await query<UserProgress>(
    `INSERT INTO user_progress (user_id, question_id, is_correct, status)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, question_id)
     DO UPDATE SET
       attempts = user_progress.attempts + 1,
       is_correct = EXCLUDED.is_correct,
       last_reviewed = NOW(),
       status = CASE
         WHEN EXCLUDED.is_correct = true AND user_progress.attempts >= 3 THEN 'mastered'
         WHEN EXCLUDED.is_correct = false THEN 'error'
         ELSE 'learning'
       END
     RETURNING *`,
    [userId, questionId, isCorrect, isCorrect ? 'learning' : 'error']
  );

  // Update statistics cache
  await query(
    `INSERT INTO user_statistics (user_id, correct_count, incorrect_count, total_count)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id)
     DO UPDATE SET
       correct_count = user_statistics.correct_count + $2,
       incorrect_count = user_statistics.incorrect_count + $3,
       total_count = user_statistics.total_count + $4,
       updated_at = NOW()`,
    [userId, isCorrect ? 1 : 0, isCorrect ? 0 : 1, 1]
  );

  return result.rows[0];
};

export const getStatistics = async (userId: string): Promise<UserStatistics | null> => {
  const result = await query<UserStatistics>(
    'SELECT correct_count, incorrect_count, total_count FROM user_statistics WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
};

export const getErrorQuestions = async (userId: string) => {
  const result = await query<Pick<UserProgress, 'question_id'>>(
    `SELECT DISTINCT question_id FROM user_progress
     WHERE user_id = $1 AND status = 'error'
     ORDER BY question_id`,
    [userId]
  );
  return result.rows.map(row => row.question_id);
};

export const getProgressByQuestion = async (userId: string, questionId: string) => {
  const result = await query<UserProgress>(
    'SELECT * FROM user_progress WHERE user_id = $1 AND question_id = $2',
    [userId, questionId]
  );
  return result.rows[0] || null;
};
