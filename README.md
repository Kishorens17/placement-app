# Placement Readiness App

A full-stack AI-powered placement readiness application for students to track GitHub repositories, LeetCode progress, and receive personalized insights and recommendations.

## Features

- 🔐 **Authentication**: Secure signup/login with GitHub and LeetCode username validation
- 📊 **Dashboard**: Real-time GitHub and LeetCode statistics
- 🤖 **AI Repository Analysis**: Deep analysis of GitHub projects with scoring (0-100)
- 💡 **Smart Recommendations**: Concept-wise LeetCode problem suggestions
- 🎯 **Adaptive Targets**: Weekly/monthly targets based on year and progress
- 🗺️ **CS Roadmap**: Interactive learning path for 15 core CS concepts
- 💬 **AI Chatbot**: CS-focused assistant for interviews and doubts
- 🌓 **Theme Support**: Light and dark mode

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- React Router
- TanStack Query
- Axios

### Backend
- Node.js + Express + TypeScript
- Supabase (PostgreSQL)
- JWT Authentication
- bcrypt for password hashing

### AI Services
- OpenRouter/NVIDIA APIs with multiple keys
- 4 specialized AI models:
  1. Repository Analysis (strict evaluation)
  2. Problem Recommendations
  3. Target Setting (adaptive)
  4. Chatbot (CS-restricted)

## Project Structure

```
placement-readiness-app/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── backend/           # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── config/
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- GitHub Personal Access Token
- OpenRouter/NVIDIA API keys (4 keys recommended)

### 1. Database Setup (Supabase)

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the schema (see `database-schema.sql` below)
3. Note your Project URL and anon key

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your credentials:
# - SUPABASE_URL and SUPABASE_ANON_KEY
# - JWT_SECRET (generate a random string)
# - AI_KEY_* (your 4 API keys)
# - GITHUB_TOKEN (personal access token)

# Install dependencies (already done)
npm install

# Run development server
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend

# Install additional dependencies
npm install recharts lucide-react class-variance-authority clsx tailwind-merge

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env

# Run development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## Environment Variables

### Backend (.env)
```env
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT
JWT_SECRET=your_secure_random_string

# AI API Keys (OpenRouter/NVIDIA)
AI_KEY_REPO_ANALYSIS=key_1
AI_KEY_PROBLEM_RECOMMENDATION=key_2
AI_KEY_TARGET_SETTING=key_3
AI_KEY_CHATBOT=key_4

# GitHub
GITHUB_TOKEN=ghp_your_github_token

# API URLs
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
NVIDIA_API_URL=https://integrate.api.nvidia.com/v1/chat/completions
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Getting API Keys

### GitHub Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `public_repo`, `read:user`

### OpenRouter API Keys
1. Sign up at https://openrouter.ai
2. Go to Keys section
3. Generate 4 API keys (or use same key for all, but separate keys recommended)

### NVIDIA API Keys (Alternative)
1. Sign up at https://build.nvidia.com
2. Get API key from dashboard

## Database Schema

Run this SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  roll_no TEXT,
  start_year INTEGER NOT NULL,
  end_year INTEGER NOT NULL,
  github_username TEXT NOT NULL,
  leetcode_username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GitHub data cache
CREATE TABLE github_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_repos INTEGER,
  last_push_date TIMESTAMPTZ,
  repos_data JSONB,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Repository analysis results
CREATE TABLE repo_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  repo_name TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  strengths TEXT[],
  weaknesses TEXT[],
  detailed_analysis TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, repo_name)
);

-- LeetCode data cache
CREATE TABLE leetcode_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_solved INTEGER,
  easy_solved INTEGER,
  medium_solved INTEGER,
  hard_solved INTEGER,
  last_submission_date TIMESTAMPTZ,
  concept_stats JSONB,
  solved_problems JSONB,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Weekly targets
CREATE TABLE weekly_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  total_target INTEGER NOT NULL,
  concept_recommendations JSONB,
  ai_reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Monthly targets
CREATE TABLE monthly_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month_start DATE NOT NULL,
  total_target INTEGER NOT NULL,
  ai_reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_start)
);

-- CS Roadmap progress
CREATE TABLE roadmap_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  concept_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  progress_percentage INTEGER DEFAULT 0,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, concept_name)
);

-- Chat history
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_github_cache_user_id ON github_cache(user_id);
CREATE INDEX idx_repo_analysis_user_id ON repo_analysis(user_id);
CREATE INDEX idx_leetcode_cache_user_id ON leetcode_cache(user_id);
CREATE INDEX idx_weekly_targets_user_id ON weekly_targets(user_id);
CREATE INDEX idx_monthly_targets_user_id ON monthly_targets(user_id);
CREATE INDEX idx_roadmap_progress_user_id ON roadmap_progress(user_id);
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user

### GitHub
- `GET /api/github/stats` - Get GitHub statistics
- `POST /api/github/analyze` - Analyze all repositories
- `GET /api/github/analyses` - Get all analysis results
- `GET /api/github/analysis/:repoName` - Get specific repo analysis

### LeetCode
- `GET /api/leetcode/stats` - Get LeetCode statistics
- `GET /api/leetcode/weekly-targets` - Get/calculate weekly targets
- `GET /api/leetcode/monthly-targets` - Get/calculate monthly targets

### Chatbot
- `POST /api/chatbot/chat` - Send message to AI
- `GET /api/chatbot/history` - Get chat history

## Development Workflow

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open**: http://localhost:5173

## Testing

1. **Signup**: Create account with valid GitHub/LeetCode usernames
2. **Dashboard**: View stats from both platforms
3. **GitHub Analysis**: Click "Start Analysis" to analyze repos
4. **LeetCode**: View weekly targets and problem recommendations
5. **Chatbot**: Ask CS-related questions

## Deployment (Vercel)

### Backend (Serverless Functions)
1. Install Vercel CLI: `npm i -g vercel`
2. In `backend/`: Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [{ "src": "src/index.ts", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/src/index.ts" }]
}
```
3. Run: `vercel --prod`
4. Add environment variables in Vercel dashboard

### Frontend
1. In `frontend/`: Run `vercel --prod`
2. Set `VITE_API_BASE_URL` to backend URL
3. Build and deploy

## Next Steps

1. ✅ Backend structure complete
2. ✅ Database schema ready
3. ⏳ Frontend components implementation
4. ⏳ Theme system
5. ⏳ Testing and deployment

## Contributing

This is a student project. Feel free to fork and extend!

## License

MIT
