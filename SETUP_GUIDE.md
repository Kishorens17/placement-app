# Step-by-Step Setup Guide: API Keys & Services Configuration

This guide will walk you through obtaining all necessary API keys and configuring your Placement Readiness App.

---

## 📋 Overview

You need to set up:
1. ✅ Supabase (Database)
2. ✅ GitHub Personal Access Token
3. ✅ OpenRouter/NVIDIA API Keys (for AI features)
4. ✅ Environment Variables Configuration

**Estimated Time**: 15-20 minutes

---

## 1️⃣ Supabase Setup (Database)

### Step 1: Create Supabase Account
1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with GitHub, Google, or email
4. Verify your email if required

### Step 2: Create a New Project
1. After logging in, click **"New Project"**
2. Fill in the details:
   - **Name**: `placement-readiness-app` (or any name you prefer)
   - **Database Password**: Choose a strong password (save it somewhere safe!)
   - **Region**: Select closest to you (e.g., `ap-south-1` for India)
3. Click **"Create new project"**
4. **Wait 2-3 minutes** for project to be provisioned

### Step 3: Run Database Schema
1. Once project is ready, go to **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy the entire SQL schema below and paste it:

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

4. Click **"Run"** (or press `Ctrl + Enter`)
5. You should see **"Success. No rows returned"** - this is correct!

### Step 4: Get Supabase API Keys
1. Go to **"Project Settings"** (gear icon in sidebar)
2. Click **"API"** in the left menu
3. Copy these two values:
   - **Project URL**: Looks like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

**Save these for Step 6!**

---

## 2️⃣ GitHub Personal Access Token

### Why do we need this?
- GitHub API has rate limits: 60 requests/hour without token, 5000 with token
- Required for fetching repository files for analysis

### Step 1: Go to GitHub Settings
1. Log in to **https://github.com**
2. Click your profile picture (top right) → **Settings**
3. Scroll down and click **"Developer settings"** (bottom of left sidebar)

### Step 2: Create Personal Access Token
1. Click **"Personal access tokens"** → **"Tokens (classic)"**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Fill in the form:
   - **Note**: `Placement Readiness App`
   - **Expiration**: `90 days` (or longer if you prefer)
   - **Select scopes**:
     - ✅ `public_repo` (Access public repositories)
     - ✅ `read:user` (Read user profile data)
4. Scroll down and click **"Generate token"**
5. **IMPORTANT**: Copy the token immediately (starts with `ghp_...`)
   - **You won't be able to see it again!**
   - Save it somewhere safe

**Save this token for Step 6!**

---

## 3️⃣ OpenRouter AI API Keys (Recommended)

### Why OpenRouter?
- Access to multiple AI models with one API
- Free tier available with rate limits
- Easy to use and set up

### Step 1: Create OpenRouter Account
1. Go to **https://openrouter.ai**
2. Click **"Sign In"** (top right)
3. Sign up with Google, GitHub, or email

### Step 2: Add Credits (if needed)
1. Go to **"Credits"** in the top menu
2. OpenRouter offers:
   - **Free tier**: Limited requests per day
   - **Paid**: $5-$10 will last a long time for testing
3. Add credits if you want unlimited access

### Step 3: Generate API Keys
1. Go to **"Keys"** in the top menu
2. Click **"Create Key"**
3. Name the key: `Placement App - Repo Analysis`
4. Click **"Create"**
5. **Copy the key** (starts with `sk-or-v1-...`)

### Step 4: Create 3 More Keys (Optional but Recommended)
Repeat Step 3 to create keys for:
- `Placement App - Problem Recommendation`
- `Placement App - Target Setting`
- `Placement App - Chatbot`

**Why 4 separate keys?**
- Each AI feature uses a different key
- Prevents one feature from using all your rate limit
- Better tracking of API usage

**Alternative: Use the same key for all 4 features**
- Simpler setup
- Just copy the same key 4 times in environment variables

**Save these keys for Step 6!**

---

## 4️⃣ Alternative: NVIDIA API Keys (Optional)

If you prefer NVIDIA over OpenRouter:

### Step 1: Create NVIDIA Account
1. Go to **https://build.nvidia.com**
2. Click **"Get API Key"**
3. Sign up with email or social login

### Step 2: Generate API Key
1. Go to dashboard
2. Click **"Generate API Key"**
3. Copy the key

**Note**: NVIDIA API setup is similar to OpenRouter. Use the same key for all 4 AI features or generate separate keys.

---

## 5️⃣ LeetCode Setup (No API Key Needed!)

### Good News!
- LeetCode doesn't require an API key
- The app uses LeetCode's public GraphQL API
- We just need valid usernames to test

### For Testing:
- Use your own LeetCode username
- Or use any public LeetCode profile (e.g., `testuser`, `leetcode`)

---

## 6️⃣ Configure Environment Variables

Now let's add all the keys to your project!

### Step 1: Create Backend .env File
1. Navigate to your project:
   ```bash
   cd "C:/Users/kisho/Amrita/SEM 7/FSD/Project/backend"
   ```

2. Create `.env` file:
   ```bash
   touch .env
   ```
   (Or create it manually in your code editor)

3. Open `.env` and paste this template:

```env
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# AI API Keys (OpenRouter or NVIDIA)
AI_KEY_REPO_ANALYSIS=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AI_KEY_PROBLEM_RECOMMENDATION=sk-or-v1-yyyyyyyyyyyyyyyyyyyyyyyyyyyy
AI_KEY_TARGET_SETTING=sk-or-v1-zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
AI_KEY_CHATBOT=sk-or-v1-wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww

# GitHub Token (optional but recommended)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# API URLs (default - don't change unless using different provider)
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
NVIDIA_API_URL=https://integrate.api.nvidia.com/v1/chat/completions
```

4. **Replace the placeholder values**:
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `JWT_SECRET`: Any random string (at least 32 characters)
   - `AI_KEY_*`: Your OpenRouter/NVIDIA API keys
   - `GITHUB_TOKEN`: Your GitHub personal access token

### Step 2: Create Frontend .env File
1. Navigate to frontend:
   ```bash
   cd "../frontend"
   ```

2. Create `.env`:
   ```bash
   touch .env
   ```

3. Add this single line:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

---

## 7️⃣ Verify Setup

### Test Backend Connection:

```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server running on port 3000
📝 Environment: development
```

### Test Frontend:

```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 📝 Quick Reference Checklist

Before you start the app, make sure you have:

- [ ] Supabase project created
- [ ] Database schema executed (8 tables created)
- [ ] Supabase URL and anon key copied
- [ ] GitHub personal access token generated
- [ ] OpenRouter/NVIDIA API keys generated (4 keys or 1 key used 4 times)
- [ ] `backend/.env` file created with all values filled
- [ ] `frontend/.env` file created
- [ ] Backend runs without errors (`npm run dev`)
- [ ] Frontend runs without errors (`npm run dev`)

---

## 🆘 Troubleshooting

### "Cannot connect to Supabase"
- ✅ Check if `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- ✅ Ensure no extra spaces or quotes in `.env` file
- ✅ Project must be fully provisioned (wait 2-3 minutes after creation)

### "GitHub API rate limit exceeded"
- ✅ Add your `GITHUB_TOKEN` to `.env`
- ✅ Make sure token has `public_repo` scope

### "AI API error"
- ✅ Check if API keys are valid
- ✅ Verify you have credits in OpenRouter/NVIDIA
- ✅ Make sure all 4 `AI_KEY_*` variables are set

### "Port 3000 already in use"
- ✅ Change `PORT=3001` in backend `.env`
- ✅ Update frontend `.env` to `VITE_API_BASE_URL=http://localhost:3001/api`

---

## 🎉 Next Steps

Once everything is set up:

1. **Test Signup**: Create an account with your real GitHub and LeetCode usernames
2. **Test Dashboard**: View your stats
3. **Test GitHub Analysis**: Analyze your repositories
4. **Test Chatbot**: Ask AI a CS question

---

## 💡 Pro Tips

1. **Keep API Keys Secret**: Never commit `.env` files to Git (already in `.gitignore`)
2. **Use Strong JWT Secret**: Generate one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. **Monitor API Usage**: Check OpenRouter dashboard to see how many requests you're making
4. **Free Tier Limits**: Be mindful of rate limits during testing

---

## 📞 Need Help?

If you encounter issues:
1. Check the error messages in terminal
2. Verify all environment variables are set correctly
3. Ensure services (Supabase, OpenRouter) are accessible
4. Check if backend is running before starting frontend

---

**Created**: September 20, 2026  
**Last Updated**: September 20, 2026  
**Version**: 1.0
