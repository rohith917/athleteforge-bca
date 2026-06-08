# AthleteForge — Online Deployment Guide (FREE)

**Platform:** [Render.com](https://render.com) (easiest free option for students)  
**Time needed:** ~45–60 minutes  
**Cost:** $0 (free tier)

---

## What You Will Get

| Service | URL Format |
|---------|------------|
| **Frontend (React)** | `https://athleteforge-frontend.onrender.com` |
| **Backend (Django API)** | `https://athleteforge-api.onrender.com` |
| **Database** | PostgreSQL (free on Render — replaces MySQL for cloud) |

> **Why PostgreSQL instead of MySQL?**  
> Render free tier includes PostgreSQL, not MySQL. Your Django models work the same — only the database engine changes. For viva you can say: *"Deployed on Render using PostgreSQL; locally we use MySQL/SQLite."*

---

## BEFORE YOU START — Prepare on Windows

### Step 0: Push project to GitHub

1. Create account at [github.com](https://github.com)
2. Create new repository: `athleteforge-bca`
3. Open **Command Prompt** in your project folder:

```cmd
cd C:\BCA_Project\athlete-performance-system
git init
git add .
git commit -m "AthleteForge BCA Final Year Project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/athleteforge-bca.git
git push -u origin main
```

> If `git` is not installed, download from [git-scm.com](https://git-scm.com)

---

## PART 1 — Deploy PostgreSQL Database (5 min)

1. Go to [dashboard.render.com](https://dashboard.render.com) → Sign up (use GitHub login)
2. Click **New +** → **PostgreSQL**
3. Settings:
   - **Name:** `athleteforge-db`
   - **Database:** `athleteforge`
   - **User:** `athleteforge_user`
   - **Region:** Singapore (closest to India) or Oregon
   - **Plan:** **Free**
4. Click **Create Database**
5. Wait until status = **Available**
6. Copy the **Internal Database URL** (starts with `postgresql://...`)  
   Save it in Notepad — you need it in Part 2.

---

## PART 2 — Deploy Django Backend (20 min)

1. Click **New +** → **Web Service**
2. Connect your **GitHub** account → select repo `athleteforge-bca`
3. Settings:

| Field | Value |
|-------|-------|
| **Name** | `athleteforge-api` |
| **Region** | Same as database |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `bash build.sh` |
| **Start Command** | `gunicorn athlete_system.wsgi:application --bind 0.0.0.0:$PORT` |
| **Plan** | **Free** |

4. Click **Advanced** → add **Environment Variables**:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | Generate random string (e.g. `bca-athleteforge-secret-2026-xyz123`) |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `athleteforge-api.onrender.com,.onrender.com` |
| `DATABASE_URL` | Paste Internal Database URL from Part 1 |
| `CORS_ALLOWED_ORIGINS` | `https://athleteforge-frontend.onrender.com` |
| `CSRF_TRUSTED_ORIGINS` | `https://athleteforge-frontend.onrender.com` |

> Replace `athleteforge-api` and `athleteforge-frontend` with YOUR actual service names if different.

5. Click **Create Web Service**
6. Wait 5–10 minutes for first deploy (build runs migrate + seed data + admin)
7. Test backend: open `https://athleteforge-api.onrender.com/api/auth/login/`  
   You should see a JSON response or "Method not allowed" (that's OK — means API is live)

### Default login after deploy
- Username: `admin`
- Password: `admin123`

---

## PART 3 — Deploy React Frontend (15 min)

1. Click **New +** → **Static Site**
2. Connect same GitHub repo
3. Settings:

| Field | Value |
|-------|-------|
| **Name** | `athleteforge-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |
| **Plan** | **Free** |

4. Add **Environment Variable**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://athleteforge-api.onrender.com/api` |

> Use YOUR actual backend URL + `/api` at the end.

5. Click **Create Static Site**
6. Wait 3–5 minutes
7. Open `https://athleteforge-frontend.onrender.com`

---

## PART 4 — Connect Frontend to Backend

This is already handled in code if you set `VITE_API_URL` correctly.

**File:** `frontend/src/services/api.js`

```javascript
const API_BASE = import.meta.env.VITE_API_URL || '/api'
```

- **Local:** no env var → uses `/api` (Vite proxy)
- **Production:** `VITE_API_URL=https://athleteforge-api.onrender.com/api`

### After changing env vars on Render
Click **Manual Deploy** → **Deploy latest commit** on the Static Site.

---

## PART 5 — Important Production Settings (Already in Code)

| Setting | Production Value | Why |
|---------|------------------|-----|
| `DEBUG` | `False` | Security |
| `ALLOWED_HOSTS` | Your Render domain | Django rejects other hosts |
| `DATABASE_URL` | PostgreSQL URL | Cloud database |
| `CORS_ALLOWED_ORIGINS` | Frontend URL | React can call API |
| `CSRF_TRUSTED_ORIGINS` | Frontend URL | Login works cross-origin |
| `SESSION_COOKIE_SECURE` | `True` (auto when DEBUG=False) | HTTPS cookies |
| `SESSION_COOKIE_SAMESITE` | `None` (auto when DEBUG=False) | Cross-site sessions |

---

## Final Live URLs

```
Frontend:  https://athleteforge-frontend.onrender.com
Backend:   https://athleteforge-api.onrender.com
API Login: https://athleteforge-api.onrender.com/api/auth/login/
Admin:     https://athleteforge-api.onrender.com/admin/
```

**Viva demo login:** `admin` / `admin123`

---

## Free Tier Limitations (Tell Examiner)

1. **Cold start:** Backend sleeps after 15 min idle — first visit takes ~50 seconds to wake up. Open backend URL 1 minute before viva.
2. **PostgreSQL** expires after 90 days on free tier (enough for submission).
3. **Static site** does not sleep — frontend loads fast always.

---

## Troubleshooting

### Login fails / CORS error
- Check `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` match frontend URL exactly (with `https://`, no trailing slash)
- Redeploy both services after changing env vars

### Build fails on backend
- Check Render logs → **Events** tab
- Common fix: ensure `build.sh` has Unix line endings (LF not CRLF)

### Blank page on frontend
- Check `VITE_API_URL` is set correctly
- Rebuild static site after setting env var

### 502 Bad Gateway
- Backend still starting — wait 2 minutes and refresh

### Database connection error
- Use **Internal** Database URL (not External) in `DATABASE_URL`
- Backend and DB must be in same Render region

---

## Quick Viva Checklist (Tomorrow)

- [ ] Open `https://athleteforge-api.onrender.com` 2 min early (wake server)
- [ ] Open `https://athleteforge-frontend.onrender.com`
- [ ] Login: admin / admin123
- [ ] Show Dashboard with charts
- [ ] Show Athletes with profile photos
- [ ] Explain: React frontend → Django REST API → PostgreSQL database

---

## Alternative: Railway.app (Brief)

Railway no longer has a generous free tier. Render is **recommended** for your viva.

If you still want Railway:
1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Add PostgreSQL plugin
3. Set same environment variables
4. Deploy backend and frontend as separate services

---

## Local vs Production Summary

| | Local (Windows) | Production (Render) |
|--|-----------------|---------------------|
| Database | SQLite / MySQL | PostgreSQL |
| Frontend | `npm start` → localhost:5173 | Static site URL |
| Backend | `python manage.py runserver` | Web service URL |
| API URL | `/api` (proxy) | `VITE_API_URL` env var |

Good luck with your viva tomorrow!