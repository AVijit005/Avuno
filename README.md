# Chronicle — Complete Developer & Deployment Manual

> "A quiet place to remember every story you've lived."

Chronicle is a premium, beautifully crafted personal media tracking platform. It allows users to track their movies, books, games, anime, and podcasts in a single, unified library. Rather than just acting as a database, Chronicle functions as a "memory capsule," providing intelligent resurfacing, mood reflections, and dynamic journaling.

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history - force pushing, or rebasing/amending/squashing commits
> that are already pushed - as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

---

## 1. Architecture & Tech Stack

Chronicle is a modern web application designed for both aesthetics and performance.

### Frontend
- **Framework:** React 19 (Vite + TypeScript)
- **Routing:** `@tanstack/react-router`
- **State Management:** `@tanstack/react-query` (server state) and `zustand` (client state)
- **Styling:** TailwindCSS + Custom CSS Variables
- **Animations:** `motion/react` (Framer Motion)
- **Deployment:** Cloudflare Pages (Production) / Nginx (VPS fallback)

### Backend
- **Runtime:** NestJS 11 (Node.js / Bun)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Custom JWT stateless authentication (`jsonwebtoken`, `bcrypt`, Google OAuth)
- **Security:** `helmet`, CORS, and rate limiting integration
- **Deployment:** PM2 on Ubuntu VPS

---

## 2. VPS Server Management & Git Syncing

Since you use a hybrid deployment (Frontend on Cloudflare, Backend on VPS, or both on VPS), follow these exact steps to update your code without breaking the server.

### Pulling the Latest Code
Always navigate to your project directory and pull the branch you are actively testing (e.g. `main` or `backend-dev-redirect`).
```bash
cd /var/www/chronicle
git fetch
git checkout backend-dev-redirect
git pull origin backend-dev-redirect
```

### Rebuilding the Backend (NestJS)
If you made changes to APIs, Auth, or Prisma schemas:
```bash
cd /var/www/chronicle/apps/backend
bun install
bun run build
pm2 restart avuno
```

### Rebuilding the Frontend (Vite)
If you made changes to CSS, React components, or UI (and you are serving the frontend from the VPS via Nginx instead of Cloudflare):
```bash
cd /var/www/chronicle
bun install
bun run build
```
*(Note: Nginx simply serves the `dist/` folder statically. You do NOT need to restart Nginx after running `bun run build`. A simple browser hard refresh will load the new files).*

---

## 3. Local Development Guide

By default, Vite tries to proxy `/api` requests to `http://localhost:3000`. Since your backend is live on the internet, you must tell your local server to proxy requests to the live backend instead.

Run this command to start your local dev server targeting the production API:
```powershell
$env:API_HOST="https://api.avuno.xyz"; bun run dev
```

### Google Login on Localhost (The Easy Way)
We built a custom "Enterprise-Grade" security feature into your backend that allows you to log in with Google on `localhost` without it redirecting you back to your live site.

1. SSH into your VPS and add this to your backend's `.env` file:
   ```bash
   echo "ALLOW_LOCAL_DEV_REDIRECT=true" >> /var/www/chronicle/apps/backend/.env
   pm2 restart avuno
   ```
2. Go to `http://localhost:5173/auth`, click **"Continue with Google"**, and it will redirect you back to localhost fully logged in!

### The "Copy-Paste" Trick (Fallback Method)
1. Open your live site `https://www.avuno.xyz` and log in.
2. Press **F12** -> **Application** -> **Local Storage** -> `https://www.avuno.xyz`.
3. Copy the `accessToken` value.
4. Go to `http://localhost:5173`, open **Local Storage**, and add a new row: Key = `accessToken`, Value = [Paste Token].
5. Manually change your URL bar to `http://localhost:5173/app`.

---

## 4. Troubleshooting & Known Fixes

If you encounter issues in the future, check this list of previously solved architectural bugs:

- **Frontend Scroll is Locked (Desktop only):** 
  Ensure `src/styles.css` has `overflow-y: auto !important` on the `body` and `html`. UI libraries (like Radix) occasionally fail to clean up their scroll-lock attributes when modals close.
- **400 Bad Request Infinite Loop on Dashboard:** 
  NestJS `ValidationPipe` is strict. If `LibraryFilterDto` or `MediaFilterDto` throws a 400 error, it means the frontend sent a query parameter (like `sort` or `direction`) that is missing from the combined backend DTO. Ensure all query parameters are whitelisted in the respective DTO files.
- **Google OAuth Fails / Redirect Loop:** 
  Do not use Passport session serialization or Redis state stores for OAuth in this architecture. We rely on a stateless callback mechanism. 

---

## 5. Production Infrastructure Cost Guide

This project can be deployed across various infrastructure tiers depending on budget. 

### Option A: Free Tier Stack ($0/month)
- **Frontend:** Cloudflare Pages
- **Backend:** Leapcell or Render (Free Tier)
- **Database:** Neon PostgreSQL (0.5 GB)
- **Queue:** Upstash Redis

### Option B: Budget VPS Stack (~$5-11/month) (CURRENT)
Run everything on one cheap VPS (e.g. Hetzner CPX11 or DigitalOcean).
- Nginx (reverse proxy + SSL + static files)
- React SPA (built, served by Nginx)
- NestJS (Node.js process, managed by PM2)
- PostgreSQL & Redis (local or Docker)

### Option C: All-in-One VPS with Coolify (~$5-10/month)
Self-hosted PaaS on a VPS giving you a beautiful Heroku-like UI to deploy apps, databases, and SSL certificates automatically via Docker Compose under the hood.

---
*This repository and its assets are proprietary.*
