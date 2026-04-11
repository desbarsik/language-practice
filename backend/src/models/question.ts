import { query } from '../config/database';

export interface Question {
  id: string;
  topic_id: string;
  type: 'multiple_choice' | 'construction';
  question_text: string;
  correct_answer: string;
  options: string[] | Record<string, any>;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const getQuestions = async (filters?: {
  level?: string;
  topic_id?: string;
  limit?: number;
}) => {
  let sql = 'SELECT * FROM questions WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (filters?.level) {
    sql += ` AND level = $${paramIndex}`;
    params.push(filters.level);
    paramIndex++;
  }

  if (filters?.topic_id) {
    sql += ` AND topic_id = $${paramIndex}`;
    params.push(filters.topic_id);
    paramIndex++;
  }

  if (filters?.limit) {
    sql += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
  }

  sql += ' ORDER BY RANDOM()';

  const result = await query<Question>(sql, params);
  return result.rows;
};

export const getQuestionById = async (id: string) => {
  const result = await query<Question>('SELECT * FROM questions WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const getQuestionsByIds = async (ids: string[]) => {
  if (ids.length === 0) return [];
  
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  const result = await query<Question>(
    `SELECT * FROM questions WHERE id IN (${placeholders})`,
    ids
  );
  return result.rows;
};
