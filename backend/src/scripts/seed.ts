import { query } from '../config/database';
import { mockQuestions, topics, levels } from '../../frontend/src/data/mockQuestions';
import fs from 'fs';
import path from 'path';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'config', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await query(schema);
    console.log('✅ Schema created/verified');

    // Insert questions
    console.log('📝 Inserting questions...');
    for (const question of mockQuestions) {
      await query(
        `INSERT INTO questions (id, topic_id, type, question_text, correct_answer, options, level)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          question.id,
          question.topic_id,
          question.type,
          question.question_text,
          question.correct_answer,
          JSON.stringify(question.options),
          question.level,
        ]
      );
    }
    console.log(`✅ Inserted ${mockQuestions.length} questions`);

    // Verify
    const count = await query('SELECT COUNT(*) FROM questions');
    console.log(`📊 Total questions in database: ${count.rows[0].count}`);

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
