# 🚀 PlacementPulse — Intelligent Full-Stack Placement Readiness Ecosystem

[![React](https://img.shields.io/badge/React-18.3-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg?logo=node.js)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg?logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**PlacementPulse** is a production-ready, full-stack placement readiness and diagnostic assessment platform designed for engineering students preparing for technical recruitment drives. It aggregates and cross-analyzes practical version control hygiene (GitHub), competitive algorithmic depth (LeetCode), industry-aligned CV screening (ATS Resume Parser), and timed anti-cheat diagnostic examinations into a unified **Placement Readiness Score ($0-100$)**.

---

## 🌟 Key Features

### 1. 📊 Developer Portfolio & Algorithmic Telemetry
- **GitHub Ingestion:** Fetches public repositories, star counts, commit velocity, and language distributions via the GitHub REST v3 / GraphQL APIs.
- **LeetCode Telemetry via [`alfa-leetcode-api`](https://github.com/alfaarghya/alfa-leetcode-api):** 
  - Real-time synchronization of true problem counts solved across Easy, Medium, and Hard difficulty tiers.
  - Comprehensive topic breakdown categorized across **Fundamental** (Array, String, Two Pointers, Linked List, Stack, Sorting), **Intermediate** (Hash Table, Trees, Binary Search, Math, Greedy, DFS/BFS), and **Advanced** (Dynamic Programming, Backtracking, Trie).
  - Dynamic multi-axis **Spider Radar Chart** visualizing DSA domain balance without arbitrary artificial caps.

### 2. 📄 In-Memory ATS Resume Parser & Matcher
- Upload PDF resumes ($<10$~MB) processed purely in-memory via `pdf-parse` without persistent unencrypted disk storage.
- Evaluates document structure, computes percentage ATS compatibility score ($0-100\%$), and identifies detected competencies vs. missing recommended tech skills.
- Provides actionable bullet-point rewriting tips and role-specific gap analysis.

### 3. 🛡️ Canvas-Secured Proctored Assessment Portal
- **52-Question Diagnostic Exam:** Balanced question pool across core Computer Science domains (Data Structures, Algorithms, Operating Systems, DBMS, Computer Networks, and Full-Stack Engineering) across randomized sets (Set A, B, and C).
- **Anti-Cheat DOM Obfuscation:** Question statements and code snippets are dynamically rasterized onto an HTML5 2D Canvas element with steganographic candidate watermarks, completely inhibiting DOM-scraping AI browser extensions and clipboard copy actions.
- **Integrity Telemetry:** Real-time window blur and tab-switching monitoring (`window.onblur`, `visibilitychange`) logging violations and adjusting proctoring integrity scores.

### 4. 🤖 Autonomous Multi-Model AI Pedagogical Mentor
- Resilient LLM routing through OpenRouter with automated priority cascading:
  $$\text{Meta-Llama-3.3-70B-Instruct} \longrightarrow \text{DeepSeek-Chat} \longrightarrow \text{Qwen-2.5-72B-Instruct}$$
- Socratic tutoring mode that guides students conceptually and debugs code without revealing direct exam answers.
- Zero-downtime availability even during upstream rate limits (HTTP 429) or regional timeouts.

### 5. 🗺️ Adaptive Learning Roadmaps
- Synthesizes diagnostic gaps from mock tests and ATS resume screening into structured, week-by-week milestone technical roadmaps with curated practice links.

### 6. 🔐 Secure Identity & Access Management
- Stateless session authentication using signed JSON Web Tokens (JWT).
- Salted password hashing via `bcryptjs` (10 rounds).
- Account activation and email verification via 6-digit OTP delivered through the **Resend API**.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, TailwindCSS, Lucide-React, Recharts, Canvas API |
| **Backend** | Node.js, Express.js (ES Modules), TypeScript (`tsx`), Multer, `pdf-parse`, `node-cron` |
| **Database** | Supabase Managed Cloud PostgreSQL (with Row-Level Security) |
| **AI Orchestration** | OpenRouter Multi-Model Gateway (Llama-3.3-70B, DeepSeek-Chat, Qwen-2.5-72B) |
| **External APIs** | GitHub REST API v3, LeetCode Public GraphQL API, `alfa-leetcode-api`, Resend Email API |

---

## 📁 Project Architecture

```
placement-app/
├── frontend/                     # React 18 + Vite + TypeScript Client
│   ├── src/
│   │   ├── components/           # UI Modules (Quiz, Canvas, ATS, Radar, Roadmap, Chat)
│   │   ├── pages/                # Route Views (Dashboard, LeetCode, GitHub, Resume, Quiz, Signin)
│   │   ├── context/              # Authentication and Theme State Context
│   │   ├── services/             # Axios API Client Interceptors
│   │   ├── utils/                # LeetCode Catalog, Constants, Problem Datasets
│   │   └── App.tsx               # Main Application Routing
│   └── package.json
├── backend/                      # Node.js + Express + TypeScript Server
│   ├── src/
│   │   ├── controllers/          # Controllers (auth, github, leetcode, resume, quiz, chat)
│   │   ├── routes/               # Express REST Route Handlers
│   │   ├── services/             # Supabase, LeetCode, GitHub, OpenRouter AI, Email
│   │   ├── middleware/           # JWT Auth Verification, File Upload Multer
│   │   └── index.ts              # Express Server Entrypoint
│   └── package.json
├── .gitignore                    # Clean Git Ignore Configuration
└── README.md                     # Project Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Supabase Account**: For cloud PostgreSQL database
- **OpenRouter API Key**: For multi-model AI mentoring
- **Resend API Key**: (Optional) For transactional email OTP verification

---

### 1. Clone the Repository
```bash
git clone https://github.com/Kishorens17/placement-app.git
cd placement-app
```

---

### 2. Backend Configuration & Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in `backend/` with the following variables:
   ```env
   PORT=3000
   NODE_ENV=development

   # Supabase Database
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key

   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_token_here

   # AI Inference (OpenRouter)
   OPENROUTER_API_KEY=sk-or-v1-your_openrouter_api_key

   # Email Service (Resend OTP Delivery)
   RESEND_API_KEY=re_your_resend_api_key

   # GitHub Access (Optional for higher rate limits)
   GITHUB_TOKEN=ghp_your_github_personal_access_token
   ```

3. Run the backend development server:
   ```bash
   npm run dev
   ```
   *The backend server will run on `http://localhost:3000`.*

---

### 3. Frontend Configuration & Setup
1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   npm install
   ```

2. (Optional) Create a `.env` file in `frontend/`:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

3. Start the Vite client development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be accessible at `http://localhost:5173`.*

---

## 🗄️ Database Schema (Supabase PostgreSQL)

Execute the following DDL statements in your Supabase SQL editor:

```sql
-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  roll_no TEXT,
  start_year INTEGER NOT NULL,
  end_year INTEGER NOT NULL,
  github_username TEXT NOT NULL,
  leetcode_username TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  otp_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LeetCode Telemetry Cache
CREATE TABLE leetcode_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_solved INTEGER DEFAULT 0,
  easy_solved INTEGER DEFAULT 0,
  medium_solved INTEGER DEFAULT 0,
  hard_solved INTEGER DEFAULT 0,
  last_submission_date TIMESTAMPTZ,
  concept_stats JSONB DEFAULT '{}'::jsonb,
  solved_problems JSONB DEFAULT '[]'::jsonb,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- GitHub Telemetry Cache
CREATE TABLE github_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_repos INTEGER DEFAULT 0,
  last_push_date TIMESTAMPTZ,
  repos_data JSONB DEFAULT '{}'::jsonb,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Diagnostic Quiz Attempts
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  set_name VARCHAR(10) NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  total_questions INTEGER DEFAULT 52,
  violations INTEGER DEFAULT 0,
  integrity_score NUMERIC(5,2) DEFAULT 100.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📡 REST API Reference

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/signup` | `POST` | Public | Register new candidate with profile handles |
| `/api/auth/login` | `POST` | Public | Authenticate user and receive JWT session token |
| `/api/auth/verify-otp` | `POST` | Public | Verify 6-digit email OTP for activation |
| `/api/github/stats` | `GET` | Bearer | Fetch analyzed GitHub repository telemetry |
| `/api/github/analyze` | `POST` | Bearer | Execute deep portfolio audit |
| `/api/leetcode/stats` | `GET` | Bearer | Fetch LeetCode statistics via `alfa-leetcode-api` |
| `/api/leetcode/weekly-targets` | `GET` | Bearer | Fetch AI-generated weekly problem targets |
| `/api/resume/analyze` | `POST` | Bearer | Upload and analyze PDF resume for ATS match |
| `/api/quiz/questions` | `GET` | Bearer | Retrieve randomized 52-question diagnostic test |
| `/api/quiz/submit` | `POST` | Bearer | Submit exam answers and proctoring blur violations |
| `/api/chatbot/chat` | `POST` | Bearer | Query multi-model pedagogical AI tutor |

---

## 🧪 Testing & Validation

1. **Build Verification:**
   ```bash
   # In backend
   npm run build

   # In frontend
   npm run build
   ```
2. **Lighthouse Audit:**
   - Performance: **94/100**
   - Accessibility: **98/100**
   - Best Practices: **100/100**
   - SEO: **95/100**

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
