# Deployment Guide for Vercel

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Git repository pushed to GitHub
- All environment variables ready

---

## Step 1: Prepare Backend for Deployment

### 1.1 Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 1.2 Backend is Ready
- ✅ `vercel.json` configuration created
- ✅ All dependencies in `package.json`
- ✅ TypeScript configured for production build

---

## Step 2: Deploy Backend to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variables** (click "Environment Variables"):
   ```
   NODE_ENV=production
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret
   AI_KEY_REPO_ANALYSIS=your_openrouter_key_1
   AI_KEY_PROBLEM_RECOMMENDATION=your_openrouter_key_2
   AI_KEY_TARGET_SETTING=your_openrouter_key_3
   AI_KEY_CHATBOT=your_openrouter_key_4
   GITHUB_TOKEN=your_github_token
   OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
   NVIDIA_API_URL=https://integrate.api.nvidia.com/v1/chat/completions
   ```

6. Click **"Deploy"**
7. Wait for deployment to complete
8. **Copy your backend URL** (e.g., `https://your-backend.vercel.app`)

### Option B: Using Vercel CLI

```bash
cd backend
vercel --prod
```

Follow the prompts and add environment variables when asked.

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Update Frontend Environment Variable

Before deploying, update the API URL to point to your deployed backend:

**File**: `frontend/.env`
```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

**OR create** `frontend/.env.production`:
```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

### 3.2 Deploy Frontend

#### Option A: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your GitHub repository (or use same repo with different root)
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variable**:
   ```
   VITE_API_BASE_URL=https://your-backend.vercel.app/api
   ```

6. Click **"Deploy"**
7. Your app is now live! 🎉

#### Option B: Using Vercel CLI

```bash
cd frontend
vercel --prod
```

---

## Step 4: Verify Deployment

### 4.1 Test Backend Health
Visit: `https://your-backend.vercel.app/health`

Should see:
```json
{
  "status": "ok",
  "timestamp": "2026-09-20T15:10:44.444Z"
}
```

### 4.2 Test Frontend
1. Visit your frontend URL
2. Try to signup with test credentials
3. Test GitHub/LeetCode validation
4. Login and test dashboard
5. Try GitHub analysis
6. Test chatbot

---

## Step 5: Configure Custom Domain (Optional)

### 5.1 Add Domain to Frontend
1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain (e.g., `placement-app.com`)
4. Follow DNS configuration instructions

### 5.2 Update Backend API URL
If using custom domain, update:
- Frontend `.env`: `VITE_API_BASE_URL=https://api.placement-app.com/api`
- Vercel backend domain settings (optional subdomain)

---

## Step 6: Enable CORS for Production

The backend already has CORS enabled for all origins. For production, you might want to restrict it.

**File**: `backend/src/index.ts`

Update CORS configuration:
```typescript
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'https://your-custom-domain.com'],
  credentials: true
}));
```

Redeploy backend after this change.

---

## Troubleshooting

### Backend Deployment Fails

**Error**: `Cannot find module`
- **Fix**: Run `npm install` locally, commit `package-lock.json`, push to Git

**Error**: `Build failed`
- **Fix**: Check `vercel.json` is correct
- **Fix**: Ensure all dependencies are in `package.json` (not `devDependencies`)

**Error**: `Environment variables not loaded`
- **Fix**: Add all variables in Vercel dashboard under "Environment Variables"

### Frontend Can't Connect to Backend

**Error**: `Network Error` or `CORS error`
- **Fix**: Check `VITE_API_BASE_URL` is correct
- **Fix**: Ensure backend CORS allows frontend domain
- **Fix**: Check backend is deployed and health endpoint works

**Error**: `404 on refresh`
- **Fix**: Vercel handles this automatically for Vite, but if issues persist, add `vercel.json` to frontend:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

### Database Connection Issues

**Error**: `Failed to connect to Supabase`
- **Fix**: Check `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Vercel
- **Fix**: Ensure Supabase project is accessible (not paused)

### AI API Issues

**Error**: `AI API error`
- **Fix**: Verify all 4 `AI_KEY_*` variables are set
- **Fix**: Check API keys are valid in OpenRouter dashboard
- **Fix**: Ensure you have credits in OpenRouter

---

## Post-Deployment Checklist

- [ ] Backend health endpoint responds
- [ ] Frontend loads without errors
- [ ] Can create new account
- [ ] GitHub username validation works
- [ ] LeetCode username validation works
- [ ] Login works
- [ ] Dashboard loads with data
- [ ] GitHub analysis works
- [ ] LeetCode stats load
- [ ] Chatbot responds
- [ ] Theme toggle works
- [ ] All navigation links work

---

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. **Production Branch**: Push to `main` → Auto-deploy to production
2. **Preview Deployments**: Push to other branches → Get preview URL

To disable auto-deploy:
- Go to Project Settings → Git → Uncheck "Production Branch"

---

## Monitoring & Logs

### View Logs
1. Go to Vercel Dashboard → Your Project
2. Click **"Deployments"**
3. Click on a deployment → **"Functions"** → **"Logs"**

### Monitor Usage
- Vercel Dashboard shows:
  - Function invocations
  - Bandwidth usage
  - Build minutes
  - Serverless function execution time

---

## Cost Estimation

### Vercel Free Tier Includes:
- 100 GB bandwidth/month
- 100 hours serverless function execution
- Unlimited deployments
- Automatic HTTPS

### Likely Costs (Hobby/Free tier should be enough):
- **Backend**: ~10-50 function invocations per user session
- **Frontend**: Static hosting (minimal cost)
- **Database**: Supabase free tier (500 MB, 2 GB transfer)
- **AI**: Depends on OpenRouter usage

**Estimated Monthly Cost**: $0-5 for low traffic (< 1000 users)

---

## Alternative Deployment Options

### Backend Alternatives:
1. **Railway**: https://railway.app (easier for Node.js)
2. **Render**: https://render.com (free tier available)
3. **Heroku**: https://heroku.com (paid plans)
4. **AWS Lambda**: Using Serverless Framework

### Frontend Alternatives:
1. **Netlify**: https://netlify.com (similar to Vercel)
2. **Cloudflare Pages**: https://pages.cloudflare.com
3. **GitHub Pages**: For static hosting only

---

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Rotate API keys regularly** - Especially OpenRouter keys
3. **Use strong JWT_SECRET** - Already generated with crypto
4. **Enable 2FA on Vercel** - For account security
5. **Monitor API usage** - Check OpenRouter dashboard

---

## Rollback Strategy

If something breaks after deployment:

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**
4. Previous version is now live

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: help@vercel.com
- **Supabase Docs**: https://supabase.com/docs
- **OpenRouter Docs**: https://openrouter.ai/docs

---

## Quick Deploy Commands

```bash
# Deploy backend
cd backend
vercel --prod

# Deploy frontend
cd frontend
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs <deployment-url>
```

---

**Ready to Deploy!** 🚀

Follow these steps and your app will be live on the internet!
