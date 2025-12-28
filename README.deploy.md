# Deployment Guide — Render (backend) + Vercel (frontend)

This repository is set up to deploy the Flask backend to Render and the static frontend to Vercel.

## Frontend build-time config (recommended)
The `frontend` folder includes a small build generator that writes `frontend/static/config.js` from an environment variable during the build.

Files added:
- `frontend/package.json` — includes `build` script
- `frontend/bin/generate-config.js` — writes `frontend/static/config.js` using `API_BASE_URL` env var

### Vercel setup (recommended)
1. On Vercel, create a new project and import this GitHub repository.
2. Set the Root Directory to: `frontend`
3. Build Command: `npm run build`
4. Output Directory: leave empty (frontend root)
5. Set environment variable in Vercel Project Settings › Environment Variables:
   - `API_BASE_URL` = `https://<your-render-backend-url>` (e.g., `https://cgpa-fnz5.onrender.com`)
6. Deploy. During build, the `generate-config.js` script will run and write `frontend/static/config.js` with the backend URL.

### Alternative: run build from repo root
If you prefer to run the build from the repository root (CI), use:
```
npm --prefix frontend run build
```

## Render backend summary
- Start Command: `gunicorn app:app --workers 2 --bind 0.0.0.0:$PORT` (or rely on `Procfile`)
- Environment variables to set on Render:
  - `SUPABASE_URL`
  - `SUPABASE_KEY` (service-role key — **backend only**)
  - `SUPABASE_ANON_KEY`
  - `FRONTEND_URL` = your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
  - `FLASK_ENV` = `production`
- Health check path: `/health`

## Post-deploy checks
- Backend: `GET https://<render-url>/health` (should return `{"status":"ok"}`)
- Backend: `GET https://<render-url>/api/config` (returns `{url, key}` — key is anon)
- Frontend: Visit Vercel URL; console/network should show fetches to `API_BASE_URL` succeed.

## Notes
- Do NOT commit service keys to Git. Use Render/Vercel environment variables.
- For persistent uploads use Supabase Storage instead of the server filesystem.

