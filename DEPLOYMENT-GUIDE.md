# Chronicle — Complete Deployment Guide

**Date:** July 24, 2026
**Stack:** TanStack Start/Vite SPA + NestJS 11 + Prisma + PostgreSQL + Redis/BullMQ
**User:** India-based, RuPay debit + UPI payment (no credit card)

---

## Table of Contents

1. [Quick Decision](#1-quick-decision)
2. [Option A: Free Tier Stack ($0/month)](#2-option-a-free-tier-stack-0month)
3. [Option B: Budget VPS Stack (~$5-11/month)](#3-option-b-budget-vps-stack-5-11month)
4. [Option C: All-in-One VPS with Coolify (~$5-10/month)](#4-option-c-all-in-one-vps-with-coolify-5-10month)
5. [Option D: Managed Services (~$7-25/month)](#5-option-d-managed-services-7-25month)
6. [Platform Comparison Tables](#6-platform-comparison-tables)
7. [Payment Methods for India](#7-payment-methods-for-india)
8. [Step-by-Step: Cheapest Path to Production](#8-step-by-step-cheapest-path-to-production)

---

## 1. Quick Decision

| Your Situation | Best Option | Monthly Cost |
|---|---|---|
| Just want to launch ASAP for free | **Option A** — Free tiers everywhere | **$0** |
| Want reliability + low cost | **Option B** — Budget VPS | **~$5-11** |
| Want everything on one box, minimal ops | **Option C** — VPS + Coolify | **~$5-10** |
| Want zero server management | **Option D** — Managed services | **~$7-25** |

---

## 2. Option A: Free Tier Stack ($0/month)

Run each service on a different free provider. Works for MVPs and early users.

### Architecture

```
Cloudflare Pages (Frontend)     ← unlimited bandwidth, CDN
        ↓ API calls
Neon PostgreSQL (Database)      ← 0.5 GB, scale-to-zero
        ↓
Upstash Redis (Queue)           ← 500K commands/month
        ↓
Leapcell or Render (Backend)    ← NestJS API
```

### Layer-by-Layer Breakdown

#### Frontend: Cloudflare Pages (FREE)

| Feature | Value |
|---|---|
| Bandwidth | **Unlimited** |
| Builds | 500/month |
| Sites | Unlimited |
| Custom domains | 100/project |
| CDN | 330+ edge locations |
| SPA routing | **Automatic** (no config needed) |
| Credit card | No |
| India latency | ~50ms (best) |

**Setup:**
1. Push frontend to GitHub
2. Connect repo to Cloudflare Pages
3. Build command: `npm run build`
4. Output directory: `dist` or `.output/public`
5. SPA routing works automatically (no `404.html` needed)

#### Backend: Leapcell (FREE)

| Feature | Value |
|---|---|
| Free projects | 20 |
| Compute | Up to 3 vCPU, 4 GB RAM |
| PostgreSQL | 1 free database included |
| Redis | 100K commands/month free |
| Background tasks | 10K invocations/month |
| Bandwidth | 2 GB/month |
| Credit card | No |

**Limitation:** Serverless (invocation-based), not always-on. BullMQ workers won't persist.

#### Database: Neon (FREE)

| Feature | Value |
|---|---|
| Storage | 0.5 GB/project |
| Compute | 100 CU-hours/month |
| Connections | 100 (+ PgBouncer pooling) |
| Branching | Yes (instant, copy-on-write) |
| Backups | Point-in-time restore included |
| Credit card | No |
| Prisma | Official integration guide |

**Setup:**
1. Create Neon account → get connection string
2. Set `DATABASE_URL` and `DIRECT_URL` in backend env
3. Use pooled URL for app queries, direct URL for migrations

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db"
```

#### Redis/Queue: Upstash (FREE)

| Feature | Value |
|---|---|
| Memory | 256 MB |
| Commands | 500K/month |
| Bandwidth | 10 GB/month |
| Persistence | Yes (built-in) |
| BullMQ | Officially supported |
| Credit card | No |

**Critical:** BullMQ polls Redis aggressively (~2000 calls/min idle). Tune intervals to reduce polling:

```typescript
const queue = new Queue('jobs', {
  connection: { url: process.env.UPSTASH_REDIS_URL },
});

const worker = new Worker('jobs', processor, {
  connection: { url: process.env.UPSTASH_REDIS_URL },
  settings: {
    stalledInterval: 300000,    // 5 min
    guardInterval: 300000,      // 5 min
    drainDelay: 300,            // 5 min timeout
  },
});
```

#### File Uploads: Cloudflare R2 (FREE)

| Feature | Value |
|---|---|
| Storage | 10 GB |
| Class A ops | 1M/month (writes) |
| Class B ops | 10M/month (reads) |
| Egress | **Free** (zero egress fees) |
| Credit card | No |

### Free Tier Risks

| Risk | Mitigation |
|---|---|
| Neon scales to zero (300-500ms cold start) | Acceptable for MVP |
| Upstash 500K commands may run out | Monitor usage, upgrade to Fixed $10/mo |
| Leapcell is serverless (no persistent BullMQ) | Use for API only, queue on Upstash QStash |
| No single provider for everything | More moving parts to manage |

---

## 3. Option B: Budget VPS Stack (~$5-11/month)

Run everything on one cheap VPS. Most reliable for production.

### Architecture

```
One VPS (4 vCPU, 4-8 GB RAM)
├── Nginx (reverse proxy + SSL + static files)
├── React SPA (built, served by Nginx)
├── NestJS (Node.js process, PM2)
├── PostgreSQL (local or Docker)
├── Redis (local or Docker)
└── BullMQ worker (PM2 managed)
```

### Cheapest VPS Options (India-friendly)

| Provider | Plan | Specs | Price | Payment | PayPal/UPI |
|---|---|---|---|---|---|
| **RackNedd** | KVM VPS 1 | 2 vCPU, 2 GB, 40 GB SSD, 1 TB BW | **$10.99/yr** (~$0.92/mo) | PayPal | ✅ PayPal |
| **Hetzner** | CPX11 | 2 vCPU, 2 GB, 40 GB SSD, 20 TB BW | **€4.59/mo** (~$5/mo) | Credit card, PayPal | ✅ PayPal |
| **Contabo** | VPS S | 4 vCPU, 8 GB, 50 GB SSD, 10 TB BW | **$5.99/mo** | Credit card, PayPal | ✅ PayPal |
| **DigitalOcean** | Basic Droplet | 1 vCPU, 1 GB, 25 GB, 1 TB BW | **$6/mo** | Credit card, PayPal | ✅ PayPal |
| **Vultr** | Regular Cloud Compute | 1 vCPU, 1 GB, 25 GB, 1 TB BW | **$6/mo** | Credit card, PayPal, crypto | ✅ PayPal |
| **Linode/Akamai** | Nanode | 1 vCPU, 1 GB, 25 GB, 1 TB BW | **$5/mo** | Credit card, PayPal | ✅ PayPal |
| **Oracle Cloud** | Always Free | 4 ARM VM (24 GB total!), 200 GB | **$0** | Credit card (verify only) | ❌ Needs CC to verify |

### Recommended: Hetzner CPX11 (~$5/mo)

**Why Hetzner:**
- Best price-to-performance ratio
- 20 TB bandwidth (generous)
- Data centers in Germany + Finland (decent India latency ~120ms)
- PayPal supported (works with UPI-linked PayPal in India)
- Excellent reliability (99.9% uptime)
- Full root access

**Setup with Docker Compose:**

```yaml
# docker-compose.yml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
      - ./certbot/conf:/etc/letsencrypt
    depends_on:
      - backend

  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://chronicle:password@postgres:5432/chronicle
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=chronicle
      - POSTGRES_USER=chronicle
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redisdata:/data

  worker:
    build: ./backend
    command: node dist/worker.js
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://chronicle:password@postgres:5432/chronicle
    depends_on:
      - redis
      - postgres

volumes:
  pgdata:
  redisdata:
```

### Annual Cost Comparison

| Provider | Monthly | Annual | Best For |
|---|---|---|---|
| RackNedd | $0.92 | $10.99 | Lowest cost |
| Hetzner | $5.00 | $60.00 | Best performance |
| Contabo | $5.99 | $71.88 | Most resources |
| DigitalOcean | $6.00 | $72.00 | Best ecosystem |
| Oracle Cloud | $0.00 | $0.00 | Free but needs CC |

---

## 4. Option C: All-in-One VPS with Coolify (~$5-10/month)

Coolify is a self-hosted PaaS (like Heroku/Netlify but on your own VPS). It gives you a beautiful UI to deploy apps, databases, and services.

### Why Coolify?

- **One-click PostgreSQL** deployment
- **One-click Redis** deployment
- **Git auto-deploy** from GitHub
- **Let's Encrypt SSL** automatic
- **Docker Compose** under the hood
- **Apache 2.0 licensed** — no vendor lock-in
- **Beautiful dashboard** — better than most paid platforms

### Architecture

```
VPS (Hetzner CPX11, ~$5/mo)
└── Coolify
    ├── React SPA (static site)
    ├── NestJS API (Docker service)
    ├── PostgreSQL (one-click database)
    ├── Redis (one-click database)
    └── BullMQ Worker (Docker service)
```

### Setup Steps

1. **Buy VPS** — Hetzner CPX11 ($5/mo)
2. **Install Coolify:**
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```
3. **Access Coolify dashboard** at `http://YOUR_VPS_IP:8000`
4. **Deploy PostgreSQL** — Click "New" → "PostgreSQL" → Deploy
5. **Deploy Redis** — Click "New" → "Redis" → Deploy
6. **Deploy NestJS** — Click "New" → "Application" → Connect GitHub repo
7. **Deploy React** — Click "New" → "Static Site" → Connect GitHub repo
8. **Add domain** — Point your domain to VPS IP, Coolify handles SSL

### Coolify vs Manual Docker Compose

| Feature | Coolify | Docker Compose |
|---|---|---|
| Setup time | 15 minutes | 1-2 hours |
| UI dashboard | ✅ Beautiful | ❌ CLI only |
| SSL certificates | ✅ Automatic | Manual (Certbot) |
| Database management | ✅ One-click | Manual |
| Log viewer | ✅ Built-in | `docker logs` |
| Resource monitoring | ✅ Built-in | Manual |
| Git auto-deploy | ✅ Built-in | Manual CI/CD |
| Updates | ✅ One-click | Manual |
| Learning curve | Low | Medium |

---

## 5. Option D: Managed Services (~$7-25/month)

Zero server management. Pay for convenience.

### Stack

| Layer | Provider | Plan | Cost |
|---|---|---|---|
| Frontend | **Cloudflare Pages** | Free | $0 |
| Backend API | **Railway** | Hobby | $5/mo |
| PostgreSQL | **Neon** | Free | $0 |
| Redis | **Upstash** | Free | $0 |
| File uploads | **Cloudflare R2** | Free | $0 |
| **Total** | | | **$5/mo** |

### Alternative Managed Stack

| Layer | Provider | Plan | Cost |
|---|---|---|---|
| Frontend | **Vercel** | Hobby | $0 |
| Backend + DB + Redis | **Railway** | Hobby | $5-10/mo |
| File uploads | **Cloudflare R2** | Free | $0 |
| **Total** | | | **$5-10/mo** |

### Railway Setup

1. Create Railway account
2. New Project → Deploy from GitHub
3. Add PostgreSQL plugin
4. Add Redis plugin
5. Set environment variables
6. Deploy

**Railway gotchas:**
- $5 trial credit (30 days, no credit card needed)
- After trial: $5/mo Hobby plan (requires credit card)
- Usage-based billing can surprise you
- Supports PayPal via Paddle

---

## 6. Platform Comparison Tables

### Frontend Hosting

| Platform | Bandwidth | SPA Routing | CDN | Credit Card | India Latency |
|---|---|---|---|---|---|
| **Cloudflare Pages** | **Unlimited** | Auto | 330+ PoPs | No | ~50ms ⭐ |
| Vercel | 100 GB | Rewrite config | 100+ PoPs | No | ~80ms |
| Netlify | ~15 GB | Redirect config | Global | No | ~52ms |
| GitHub Pages | 100 GB | Hack (404.html) | GitHub CDN | No | ~60ms |
| Surge.sh | Unlimited | Native | CDN | No | ~80ms |

### Backend Hosting

| Platform | RAM | Sleep | PostgreSQL | Redis | Credit Card |
|---|---|---|---|---|---|
| **Hetzner VPS** | 2+ GB | Never | ✅ Docker | ✅ Docker | PayPal ✅ |
| **Coolify VPS** | 2+ GB | Never | ✅ One-click | ✅ One-click | PayPal ✅ |
| Render | 512 MB | 15 min | 30-day expiry | 25 MB | No |
| Railway | 512 MB | Never | Usage-based | Usage-based | Yes (after trial) |
| Leapcell | 4 GB | Serverless | ✅ 1 free | ✅ 100K/mo | No |

### Database (PostgreSQL)

| Provider | Storage | Connections | Branching | Sleep | Credit Card |
|---|---|---|---|---|---|
| **Neon** | 0.5 GB | 100 (+pooler) | ✅ Instant | Scale-to-zero | No |
| CockroachDB | **10 GB** | Serverless | No | Scale-to-zero | No |
| Supabase | 500 MB | Shared (PgBouncer) | No | 7-day pause | No |
| Aiven | 1 GB | 20 | No | May power off | No |

### Redis

| Provider | Memory | Commands | Persistence | BullMQ | Credit Card |
|---|---|---|---|---|---|
| **Upstash** | 256 MB | 500K/mo | ✅ | ✅ Official | No |
| Aiven Valkey | 512 MB | Unlimited | ✅ | ✅ | No |
| Redis Cloud | 30 MB | 100 ops/s | ❌ Free tier | ❌ | No |

---

## 7. Payment Methods for India

### PayPal (Accepts UPI + RuPay)

| Platform | PayPal Support | How to Pay |
|---|---|---|
| Hetzner | ✅ | Link UPI/RuPay to PayPal → Pay via PayPal |
| Contabo | ✅ | Same |
| DigitalOcean | ✅ | Same |
| Vultr | ✅ | Same |
| Linode | ✅ | Same |
| RackNedd | ✅ | Same |
| Railway | ✅ (Paddle) | PayPal or credit card |

**How to link UPI to PayPal:**
1. Create PayPal account at paypal.com
2. Go to Wallet → Link a card/bank
3. Select "Link UPI" or "Link RuPay card"
4. Verify via UPI app (Google Pay, PhonePe, etc.)
5. Use PayPal as payment method on any platform

### Platforms That Accept UPI Directly

| Platform | UPI Direct | Notes |
|---|---|---|
| Razorpay Cloud | ✅ | Indian VPS provider |
| DigitalOcean | Via PayPal | Link UPI to PayPal first |
| Hostinger VPS | ✅ | Accepts UPI, starts at ~$6/mo |

### Oracle Cloud (Free, Needs Credit Card for Verification)

- **4 ARM VMs always free** (24 GB RAM total!)
- Needs a credit card for identity verification (not charged)
- **Workaround:** Use a RuPay credit card if you have one, or ask someone with a credit card to verify for you
- After verification, the free tier is truly free forever

---

## 8. Step-by-Step: Cheapest Path to Production

### Path 1: $0/month (Free Tiers)

```
Step 1: Deploy frontend to Cloudflare Pages
        → Connect GitHub, build, deploy
        → SPA routing automatic

Step 2: Create Neon database
        → Get connection string
        → Run prisma migrate

Step 3: Create Upstash Redis
        → Get connection string
        → Configure BullMQ with tuned intervals

Step 4: Deploy backend to Leapcell or Render
        → Set env vars (DATABASE_URL, REDIS_URL, JWT_SECRET)
        → Deploy from GitHub

Step 5: Create Cloudflare R2 bucket
        → For file uploads

Step 6: Connect custom domain
        → Cloudflare Pages supports custom domains free
```

**Estimated monthly cost: $0**
**Limitations:** Cold starts, 2 GB backend bandwidth, no persistent BullMQ workers

### Path 2: ~$5/month (Budget VPS)

```
Step 1: Buy Hetzner CPX11 ($5/mo)
        → Pay via PayPal (linked to UPI)

Step 2: Install Coolify
        → curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

Step 3: Deploy all services via Coolify UI
        → PostgreSQL (one-click)
        → Redis (one-click)
        → NestJS backend (GitHub connect)
        → React frontend (GitHub connect)

Step 4: Configure SSL
        → Coolify handles Let's Encrypt automatically

Step 5: Connect domain
        → Point DNS to VPS IP
```

**Estimated monthly cost: $5**
**Limitations:** Germany server (120ms latency from India), you manage the VPS

### Path 3: ~$1/month (Rock Bottom)

```
Step 1: Buy RackNedd KVM VPS ($10.99/year = $0.92/mo)
        → Pay via PayPal (linked to UPI)

Step 2: Install Docker + Docker Compose

Step 3: Deploy with docker-compose.yml (see Option B)

Step 4: Use Certbot for free SSL

Step 5: Point domain to VPS
```

**Estimated monthly cost: $0.92**
**Limitations:** 2 vCPU, 2 GB RAM, less reliable provider

---

## Recommended Path

**For your situation (India, RuPay/UPI, no credit card):**

1. **Start with Option A ($0)** — Get the MVP live on free tiers
2. **Migrate to Option B ($5/mo Hetzner)** — When you need reliability
3. **Use Coolify** — If you want easy management without learning Docker

The $0 free tier stack gets you launched. The $5/mo Hetzner VPS gets you production-ready.

---

## Appendix: Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/chronicle"
DIRECT_URL="postgresql://user:pass@host:5432/chronicle"

# Redis
REDIS_URL="redis://:password@host:6379"

# Auth
JWT_SECRET="your-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# CORS
CORS_ORIGIN="https://your-domain.com"

# Frontend URL
FRONTEND_URL="https://your-domain.com"
```

### Frontend (.env)

```env
VITE_API_URL="https://api.your-domain.com"
```

---

*Generated from research across 50+ hosting platforms and services.*
