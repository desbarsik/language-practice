-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id VARCHAR(50) PRIMARY KEY,
  topic_id VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('multiple_choice', 'construction')),
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  options JSONB NOT NULL,
  level VARCHAR(20) NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id VARCHAR(50) NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  attempts INTEGER DEFAULT 1,
  last_reviewed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'learning', 'mastered', 'error')),
  UNIQUE(user_id, question_id)
);

-- Statistics table (for caching)
CREATE TABLE IF NOT EXISTS user_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_level ON questions(level);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_question_id ON user_progress(question_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
