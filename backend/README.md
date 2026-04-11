# English Master Backend

Backend API for the English Master language learning application.

## Features

- **RESTful API** - Express.js server with TypeScript
- **PostgreSQL Database** - Relational data storage
- **JWT Authentication** - Secure user authentication
- **Progress Tracking** - User progress and statistics
- **CORS Enabled** - Configured for frontend integration

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | PostgreSQL |
| Authentication | JWT + bcrypt |
| Validation | Zod |

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/english_master
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   ```

3. **Create PostgreSQL database:**
   ```bash
   # Using psql
   createdb english_master
   ```

4. **Run seed script (populates database with questions):**
   ```bash
   npm run seed
   ```

5. **Start the server:**
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

**Register/Login Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "token": "jwt-token-here"
}
```

### Questions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/questions` | Get questions (with filters) | Yes |
| GET | `/api/questions/:id` | Get single question | Yes |

**Query Parameters:**
- `level` - Filter by level (Beginner/Intermediate/Advanced)
- `topic_id` - Filter by topic (travel/food/business/grammar)
- `limit` - Limit number of questions

**Response:**
```json
{
  "questions": [
    {
      "id": "1",
      "topic_id": "travel",
      "type": "multiple_choice",
      "question_text": "How do you say...",
      "correct_answer": "Hello",
      "options": ["Hello", "Goodbye", "Thanks", "Please"],
      "level": "Beginner"
    }
  ]
}
```

### Progress

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/progress` | Save answer progress | Yes |
| GET | `/api/progress/stats` | Get user statistics | Yes |
| GET | `/api/progress/errors` | Get error questions | Yes |
| GET | `/api/progress/question/:id` | Get progress for question | Yes |

**Save Progress Request:**
```json
{
  "question_id": "1",
  "is_correct": true
}
```

**Statistics Response:**
```json
{
  "stats": {
    "correct_count": 50,
    "incorrect_count": 10,
    "total_count": 60
  }
}
```

## Database Schema

### Tables

- **users** - User accounts
- **questions** - Question dictionary
- **user_progress** - User answer history
- **user_statistics** - Cached statistics

See `src/config/schema.sql` for full schema definitions.

## Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript
npm start            # Start production server
npm run seed         # Populate database with questions
npm run lint         # Run ESLint
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts        # PostgreSQL connection
│   │   └── schema.sql         # Database schema
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication
│   │   └── errorHandler.ts    # Error handling
│   ├── models/
│   │   ├── user.ts            # User model & queries
│   │   ├── question.ts        # Question model & queries
│   │   └── progress.ts        # Progress model & queries
│   ├── routes/
│   │   ├── auth.ts            # Auth endpoints
│   │   ├── questions.ts       # Questions endpoints
│   │   └── progress.ts        # Progress endpoints
│   ├── scripts/
│   │   └── seed.ts            # Database seeding
│   └── index.ts               # Server entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with expiration
- Parameterized SQL queries (prevents SQL injection)
- CORS configured for specific origin
- Input validation with Zod

## Deployment

### Render

1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy as Web Service
4. Ensure PostgreSQL is accessible

### Railway

1. Connect GitHub repository
2. Add PostgreSQL database
3. Set environment variables
4. Deploy

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| DATABASE_URL | PostgreSQL connection string | - |
| JWT_SECRET | Secret key for JWT | - |
| JWT_EXPIRES_IN | Token expiration | 7d |
| FRONTEND_URL | CORS allowed origin | http://localhost:5173 |

## License

MIT
