/**
 * Validates mockQuestions.ts data before build.
 * Checks:
 *  - All words in correct_answer exist in options (for construction)
 *  - No duplicate options in multiple_choice (warn only)
 *  - Required fields are non-empty
 *  - Unique question IDs
 */

// --- Import mockQuestions (we eval the file since this runs outside TS) ---
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'mockQuestions.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// Extract the mockQuestions array content and parse roughly
// We'll do a simple validation by parsing the TS file content

let errors = 0;
let warnings = 0;

console.log('🔍 Validating mockQuestions.ts...\n');

// Only look at content before the topics array
const mainContent = content.split(/export const topics/)[0];

// Parse questions using regex - match objects with id and level (which topics don't have)
const questionBlocks = mainContent.match(/\{\s*id:\s*'[^']+',[\s\S]*?level:\s*'[^']+'[^}]*\}/g);

if (!questionBlocks) {
  console.error('❌ Could not parse any questions from mockQuestions.ts');
  process.exit(1);
}

const ids = new Set();
const questions = [];

for (const block of questionBlocks) {
  const idMatch = block.match(/id:\s*'([^']+)'/);
  const typeMatch = block.match(/type:\s*'([^']+)'/);
  const answerMatch = block.match(/correct_answer:\s*'([^']+)'/);
  const optionsMatch = block.match(/options:\s*\[([^\]]+)\]/);
  const levelMatch = block.match(/level:\s*'([^']+)'/);
  const questionTextMatch = block.match(/question_text:\s*'([^']+)'/);

  const id = idMatch ? idMatch[1] : null;
  const type = typeMatch ? typeMatch[1] : null;
  const correctAnswer = answerMatch ? answerMatch[1] : null;
  const level = levelMatch ? levelMatch[1] : null;
  const questionText = questionTextMatch ? questionTextMatch[1] : null;

  if (!id || !type || !correctAnswer || !level || !questionText) {
    console.error(`❌ Question missing required fields: id=${id}`);
    errors++;
    continue;
  }

  if (ids.has(id)) {
    console.error(`❌ Duplicate question id: '${id}'`);
    errors++;
  }
  ids.add(id);

  if (!optionsMatch) {
    console.error(`❌ Question '${id}' missing options array`);
    errors++;
    continue;
  }

  // Parse options array (extract string values)
  const optionsStr = optionsMatch[1];
  const options = optionsStr.match(/'([^']*)'/g)?.map(s => s.slice(1, -1)) || [];

  if (type === 'construction') {
    // Check all words in correct_answer exist in options
    const answerWords = correctAnswer.split(/\s+/);
    const optionCounts = {};
    for (const opt of options) {
      optionCounts[opt] = (optionCounts[opt] || 0) + 1;
    }

    for (const word of answerWords) {
      if (!optionCounts[word] || optionCounts[word] <= 0) {
        console.error(`❌ Question '${id}' (construction): word "${word}" from answer "${correctAnswer}" not found in options`);
        console.error(`   Options: [${options.join(', ')}]`);
        errors++;
      } else {
        optionCounts[word]--;
      }
    }
  } else if (type === 'multiple_choice') {
    // Check for duplicate options (warning)
    const seen = new Set();
    for (const opt of options) {
      if (seen.has(opt)) {
        console.warn(`⚠️  Question '${id}' (multiple_choice): duplicate option "${opt}"`);
        warnings++;
      }
      seen.add(opt);
    }

    // Check correct_answer is in options
    if (!options.includes(correctAnswer)) {
      console.error(`❌ Question '${id}' (multiple_choice): correct_answer "${correctAnswer}" not in options`);
      errors++;
    }
  }

  if (options.length < 4) {
    console.error(`❌ Question '${id}': options has ${options.length} items (minimum 4)`);
    errors++;
  }

  questions.push({ id, type, level });
}

console.log(`\n📊 Total questions: ${questions.length}`);
console.log(`   Beginner: ${questions.filter(q => q.level === 'Beginner').length}`);
console.log(`   Intermediate: ${questions.filter(q => q.level === 'Intermediate').length}`);
console.log(`   Advanced: ${questions.filter(q => q.level === 'Advanced').length}`);
console.log(`   Multiple Choice: ${questions.filter(q => q.type === 'multiple_choice').length}`);
console.log(`   Construction: ${questions.filter(q => q.type === 'construction').length}`);

if (warnings > 0) {
  console.log(`\n⚠️  Warnings: ${warnings}`);
}

if (errors > 0) {
  console.error(`\n❌ Validation failed with ${errors} error(s)`);
  process.exit(1);
} else {
  console.log('\n✅ Validation passed!');
}
