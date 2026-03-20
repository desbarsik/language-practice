export interface User {
  id: string;
  email: string;
  created_at: string;
}

export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export type QuestionType = 'multiple_choice' | 'construction';

export type QuestionStatus = 'new' | 'learning' | 'mastered' | 'error';

export interface Question {
  id: string;
  topic_id: string;
  type: QuestionType;
  question_text: string;
  correct_answer: string;
  options: string[] | JSON;
  level: Level;
}

export interface Topic {
  id: string;
  title: string;
  level: Level;
}

export interface UserProgress {
  id: string;
  user_id: string;
  question_id: string;
  is_correct: boolean;
  attempts: number;
  last_reviewed: string;
  status: QuestionStatus;
}

export interface SessionStats {
  correct: number;
  incorrect: number;
  total: number;
}
