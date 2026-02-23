# Frontend Deployment Guide

## Overview

This frontend is deployed as **static files** served by nginx on the same server as the backend.

**Architecture:**
```
User → nginx (80/443) → Static Files (HTML/CSS/JS)
                      ↓
                      → API Proxy (/api/*) → Backend Gateway (8080)
```

## Domains

- **Staging:** https://sovmestno-test.ru (frontend) + https://api.sovmestno-test.ru (API)
- **Production:** https://sovmestno-site.ru (frontend) + https://api.sovmestno-site.ru (API)

## How it works

1. **Build:** `npm run build` creates static files in `dist/` directory
2. **Deploy:** GitHub Actions copies `dist/` to server at `/var/www/sovmestno-frontend/`
3. **Serve:** nginx serves files from `/var/www/sovmestno-frontend/` on port 80/443
4. **API Calls:** nginx proxies `/api/*` requests to backend gateway

## Environment Variables

Frontend uses Vite environment variables (prefix `VITE_`):

- `VITE_API_URL` - API base URL

### Files:
- `.env.staging.example` - Staging configuration template (in git)
- `.env.production.example` - Production configuration template (in git)
- `.env.local` - Local development (not in git)

**Note:** Actual `.env.staging` and `.env.production` are created automatically by GitHub Actions from secrets.

## Deployment

### Automatic Deployment

**Staging:** Pushes to `main` branch automatically deploy to staging server.

**Production:** Manual workflow dispatch with confirmation required.

### Manual Deployment

On the server:
```bash
cd /var/www/sovmestno-frontend
# Pull latest
git pull origin main
# Install dependencies
npm ci
# Build for production
npm run build -- --mode production
```

## Local Development

```bash
# Install dependencies
npm install

# Copy environment example
cp .env.local.example .env.local

# Start dev server (port 5173)
npm run dev

# Build for testing
npm run build -- --mode staging
npm run preview
```

## GitHub Secrets Required

### Staging (8 secrets):
- `STAGING_SSH_HOST` - Server hostname
- `STAGING_SSH_USER` - SSH user (e.g., `deploy`)
- `STAGING_SSH_KEY` - Private SSH key
- `STAGING_DOMAIN` - Frontend domain (sovmestno-test.ru)
- `STAGING_API_DOMAIN` - API domain (api.sovmestno-test.ru)
- `STAGING_DEPLOY_PATH` - Deploy directory (/var/www/sovmestno-frontend)
- `STAGING_FRONTEND_REPO` - This repository URL
- `STAGING_BRANCH` - Branch to deploy (main)

### Production (8 secrets):
- Same as staging but with `PROD_` prefix

## Server Setup

### Prerequisites

1. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Create deploy directory:**
```bash
sudo mkdir -p /var/www/sovmestno-frontend
sudo chown deploy:deploy /var/www/sovmestno-frontend
```

3. **Update nginx configuration:**

Backend's nginx config already has frontend support commented out.
Follow `ENABLE_FRONTEND.md` in backend repository to enable it.

### First Time Setup

On server:
```bash
# Clone repository
cd /var/www
git clone <frontend-repo-url> sovmestno-frontend
cd sovmestno-frontend

# Install dependencies
npm ci

# Build
npm run build -- --mode staging  # or --mode production

# nginx will serve files from dist/ directory
```

## Troubleshooting

### 404 on page refresh
nginx needs to route all paths to index.html for SPA routing.
Check `ENABLE_FRONTEND.md` in backend repo - it has the correct config.

### API calls fail
Check nginx proxy configuration. It should proxy `/api/*` to backend gateway.

### Build fails
- Check Node.js version (should be 18+)
- Clear node_modules: `rm -rf node_modules && npm ci`
- Check environment variables are set correctly

## Related Documentation

See backend repository for:
- `ENABLE_FRONTEND.md` - How to enable frontend in nginx
- `FRONTEND_DEVELOPER_GUIDE.md` - Complete setup guide
- `nginx/nginx.staging.with-frontend.conf.template` - Nginx config example
