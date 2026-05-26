# 🚀 ThreadFire – Deployment Guide

Full deployment guide for putting ThreadFire live using:
- **Supabase** → PostgreSQL database (free tier)
- **Render** → Python backend (free tier)
- **Vercel** → Next.js frontend (free tier)

**Total cost: $0** to start

---

## 📋 Prerequisites

- GitHub account (push your code here first)
- Supabase account → https://supabase.com
- Render account → https://render.com
- Vercel account → https://vercel.com

---

## 🗄️ Step 1 – Database (Supabase)

1. Go to **https://supabase.com** → New Project
2. Choose a name (e.g. `threadfire`), set a strong password, pick a region
3. Wait ~2 minutes for the project to provision
4. Go to **Settings → Database → Connection String → URI**
5. Copy the connection string — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
   ```
6. Save this — you'll need it in Step 2

### Run migrations on Supabase
```bash
cd backend
# Set your Supabase URL temporarily
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres"
alembic upgrade head
```
This creates all 5 tables in your cloud database.

---

## 🐍 Step 2 – Backend (Render)

1. Push your code to GitHub first:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/threadfire.git
   git push -u origin main
   ```

2. Go to **https://render.com** → New → Web Service

3. Connect your GitHub repository

4. Configure the service:
   ```
   Name:            threadfire-api
   Root Directory:  backend
   Runtime:         Python 3
   Build Command:   pip install -r requirements.txt
   Start Command:   alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

5. Add **Environment Variables** (click "Add Environment Variable" for each):
   ```
   DATABASE_URL              → (your Supabase connection string from Step 1)
   SECRET_KEY                → (run: python -c "import secrets; print(secrets.token_hex(32))")
   ALGORITHM                 → HS256
   ACCESS_TOKEN_EXPIRE_MINUTES → 1440
   DEBUG                     → False
   ALLOWED_ORIGINS           → https://your-app.vercel.app
   ```

6. Click **Create Web Service**

7. Wait ~3 minutes for the first deploy

8. Copy your Render URL: `https://threadfire-api.onrender.com`
   → Test it: open `https://threadfire-api.onrender.com/docs`
   → You should see the FastAPI Swagger docs

---

## ⚛️ Step 3 – Frontend (Vercel)

1. Go to **https://vercel.com** → New Project

2. Import your GitHub repository

3. Configure:
   ```
   Framework Preset:  Next.js
   Root Directory:    frontend
   ```

4. Add **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL → https://threadfire-api.onrender.com
   ```
   (Use your actual Render URL from Step 2)

5. Click **Deploy**

6. Wait ~2 minutes

7. Your app is live at `https://threadfire.vercel.app` 🎉

---

## 🔄 Step 4 – Update CORS

After getting your Vercel URL, go back to Render and update:
```
ALLOWED_ORIGINS → https://threadfire.vercel.app
```
(Replace with your actual Vercel URL)

Render will auto-redeploy.

---

## ✅ Deployment Checklist

```
Database
  [ ] Supabase project created
  [ ] Connection string copied
  [ ] alembic upgrade head run successfully
  [ ] All 5 tables visible in Supabase Table Editor

Backend
  [ ] Code pushed to GitHub
  [ ] Render web service created
  [ ] All environment variables set
  [ ] Build successful (green checkmark)
  [ ] /docs endpoint responds
  [ ] /health endpoint returns {"status": "ok"}

Frontend
  [ ] Vercel project created
  [ ] NEXT_PUBLIC_API_URL set to Render URL
  [ ] Build successful
  [ ] App loads in browser
  [ ] Can register a new account
  [ ] Can login
  [ ] Can create community
  [ ] Can create post
  [ ] Can vote
  [ ] Can comment

Final
  [ ] ALLOWED_ORIGINS updated to Vercel URL
  [ ] Custom domain configured (optional)
```

---

## 🐳 Alternative: Docker (Self-hosted)

If you want to run everything on a single server (e.g. DigitalOcean, AWS EC2):

```bash
# Clone your repo on the server
git clone https://github.com/YOUR_USERNAME/threadfire.git
cd threadfire

# Create .env file
cp backend/.env.production backend/.env
# Edit backend/.env with your values

# Build and start everything
docker-compose up --build -d

# Run migrations
docker-compose exec backend alembic upgrade head

# App is now live at:
# Frontend: http://your-server-ip:3000
# Backend:  http://your-server-ip:8000
```

---

## 🐛 Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| Backend won't start | Check DATABASE_URL is correct in Render env vars |
| "CORS error" in browser | Update ALLOWED_ORIGINS to match your Vercel URL exactly |
| Login not working | Check SECRET_KEY is set and consistent |
| Database tables missing | Run `alembic upgrade head` against your Supabase DB |
| Render app sleeps | Free tier sleeps after 15 mins inactivity — first request is slow |
| Images not loading | Add domain to `next.config.ts` remotePatterns |

---

## 💰 Cost Summary

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| Supabase | 500MB DB, 2 projects | $25/month |
| Render | 750 hrs/month, sleeps | $7/month (always-on) |
| Vercel | Unlimited deploys | $20/month (team) |
| **Total** | **$0** | **~$52/month** |

---

## 🔗 Your Live URLs (fill in after deploy)

```
Frontend:  https://_________________________.vercel.app
Backend:   https://_________________________.onrender.com
API Docs:  https://_________________________.onrender.com/docs
```
