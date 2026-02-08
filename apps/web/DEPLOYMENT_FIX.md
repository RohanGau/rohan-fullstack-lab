# Cloudflare Pages Refresh Issue - Solutions

## The Problem

You're getting "Internal Server Error" when refreshing pages because:

1. `@cloudflare/next-on-pages` is deprecated
2. Version compatibility issues between Next.js, React, and the Cloudflare adapter
3. Known "duplicated identifier" bug in the adapter

## ✅ Solution 1: Deploy to Vercel (RECOMMENDED - 5 minutes)

Vercel is designed for Next.js and will work flawlessly.

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
cd /Users/rohankumar/work/rohan-fullstack-lab/apps/web
vercel --prod
```

### Step 4: Done! ✅

Your site will be live at: `https://your-project.vercel.app`

You can add your custom domain `rohangautam.dev` in Vercel dashboard.

---

## Solution 2: Use Static Export for Cloudflare Pages

If you must use Cloudflare Pages, switch to static export:

### Update next.config.ts

```typescript
const nextConfig: NextConfig = {
  output: 'export', // Add this line
  images: {
    unoptimized: true, // Required for static export
    // ... rest of config
  },
  // ... rest of config
};
```

### Build Command (Cloudflare Pages)

```bash
next build
```

### Output Directory

```
apps/web/out
```

**Limitation:** No API routes, no server-side rendering

---

## Solution 3: Upgrade Everything (Complex)

Use latest compatible versions:

```json
{
  "dependencies": {
    "next": "15.4.4",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  },
  "devDependencies": {
    "@cloudflare/next-on-pages": "latest"
  }
}
```

Then use OpenNext adapter (recommended by Cloudflare):

```bash
npm install --save-dev open-next-cloudflare
```

---

## What I Recommend

**Use Vercel** - it's the path of least resistance:

- ✅ Zero configuration
- ✅ Perfect Next.js support
- ✅ Free tier (generous)
- ✅ No refresh issues
- ✅ Automatic deployments from Git
- ✅ Built-in analytics

Your API can stay on Fly.io, just point your web to Vercel.

---

## Quick Deploy to Vercel Now

```bash
cd apps/web
vercel
```

Follow the prompts, then your site will be live!
