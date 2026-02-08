# Monitoring Setup Guide

Step-by-step instructions to set up uptime monitoring and log retention for your fullstack lab.

---

## 1. Better Uptime - Uptime Monitoring (5 minutes)

### Step 1: Sign Up

1. Go to https://betterstack.com/better-uptime
2. Click "Start free trial" or "Sign up"
3. Create account with your email (no credit card required for free tier)

### Step 2: Create Monitors

#### Monitor 1: API Health Check

1. After login, click **"Create Monitor"**
2. Fill in the form:
   - **Name:** `Fullstack Lab API - Health`
   - **URL:** `https://api.rohangautam.dev/health/ready`
   - **Check Frequency:** Every 1 minute (free tier allows this)
   - **Request Timeout:** 30 seconds
   - **Expected Status Code:** 200
   - **Monitor Type:** HTTP(s)
   - **Regions:** Select at least 2 regions for redundancy
3. Click **"Create Monitor"**

#### Monitor 2: Web Application

1. Click **"Create Monitor"** again
2. Fill in the form:
   - **Name:** `Fullstack Lab Web - Homepage`
   - **URL:** `https://rohangautam.dev`
   - **Check Frequency:** Every 1 minute
   - **Request Timeout:** 30 seconds
   - **Expected Status Code:** 200
3. Click **"Create Monitor"**

#### Optional: Monitor 3: API Main Endpoint

1. Click **"Create Monitor"**
2. Fill in:
   - **Name:** `Fullstack Lab API - Root`
   - **URL:** `https://api.rohangautam.dev/`
   - **Check Frequency:** Every 3 minutes
   - **Expected Status Code:** 200

### Step 3: Configure Notifications

1. Go to **Settings** → **Notifications**
2. Add notification channels:

   **Email (Default):**
   - Already configured with your signup email
   - Toggle ON for "Incident created" and "Incident resolved"

   **Slack (Recommended):**
   1. Click **"Add integration"** → **Slack**
   2. Click **"Add to Slack"**
   3. Select your Slack workspace
   4. Choose channel (e.g., `#alerts` or `#monitoring`)
   5. Authorize
   6. Toggle ON for all incident types

   **SMS (Optional, limited free tier):**
   - Add your phone number for critical alerts only

### Step 4: Set Up On-Call Schedule (Optional)

1. Go to **On-call** → **Create Schedule**
2. Add yourself to the rotation
3. Configure escalation policy:
   - After 5 minutes, escalate to SMS
   - After 15 minutes, escalate to backup contact

### Step 5: Verify Setup

1. Click on one of your monitors
2. Click **"Trigger a test incident"**
3. You should receive:
   - Email notification
   - Slack notification (if configured)
4. Resolve the test incident to verify "resolved" notifications work

### What You Get (Free Tier):

- ✅ 10 monitors
- ✅ 1-minute check frequency
- ✅ Unlimited team members
- ✅ Email + Slack notifications
- ✅ Status page
- ✅ Incident management
- ✅ 6 months of history

---

## 2. Logtail - Log Retention (10 minutes)

### Step 1: Sign Up for Logtail

1. Go to https://betterstack.com/logtail
2. Click **"Start free"**
3. Create account (same account as Better Uptime if you used BetterStack)

### Step 2: Create Log Source

1. After login, click **"Add source"**
2. Select **"Node.js"** or **"Pino"**
3. Give it a name: `fullstack-lab-api`
4. Click **"Create source"**
5. **IMPORTANT:** Copy the **Source Token** (looks like `abc123xyz...`)
6. Keep this page open, you'll need the token

### Step 3: Add Logtail to Your API

#### Install Logtail Pino Transport

```bash
# Navigate to API directory
cd apps/api

# Install @logtail/pino
pnpm add @logtail/pino

# Or if you prefer npm
npm install @logtail/pino
```

#### Update Logger Configuration

Open `apps/api/src/utils/logger.ts` and replace with:

```typescript
import pino from 'pino';
import process from 'process';

const isProduction = process.env.NODE_ENV === 'production';
const logtailToken = process.env.LOGTAIL_SOURCE_TOKEN;

// Build transports array
const transports: any[] = [];

// Development: Pretty printing
if (!isProduction) {
  transports.push({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  });
}

// Production: Send to Logtail if configured
if (isProduction && logtailToken) {
  transports.push({
    target: '@logtail/pino',
    options: {
      sourceToken: logtailToken,
    },
  });
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Use transport only if we have transports configured
  ...(transports.length > 0 && {
    transport:
      transports.length === 1
        ? transports[0]
        : {
            targets: transports,
          },
  }),
});

export default logger;
```

### Step 4: Add Environment Variable

#### Local Development (.env)

Add to `apps/api/.env` (optional for local testing):

```bash
# Logtail (optional in development)
LOGTAIL_SOURCE_TOKEN=your_source_token_here
```

#### Production (Fly.io)

```bash
# Set secret on Fly.io
fly secrets set LOGTAIL_SOURCE_TOKEN=your_source_token_here

# Verify it's set
fly secrets list
```

#### Staging (if you have it)

```bash
fly secrets set LOGTAIL_SOURCE_TOKEN=your_source_token_here --app your-staging-app-name
```

### Step 5: Deploy and Verify

#### Deploy to Fly.io

```bash
# From project root
cd apps/api
fly deploy

# Watch logs to confirm it's working
fly logs
```

#### Verify in Logtail Dashboard

1. Go back to Logtail dashboard
2. Click on your source "fullstack-lab-api"
3. You should start seeing logs appear within 30 seconds
4. If you don't see logs:
   - Check `fly logs` for errors
   - Verify the source token is correct
   - Make sure you deployed after setting the secret

### Step 6: Explore Logtail Features

#### Create Saved Views

1. Click **"Views"** in Logtail
2. Create useful views:
   - **Errors Only:** `level:error`
   - **Slow Requests:** `durationMs:>1000`
   - **Auth Events:** `path:/auth/*`
   - **Specific User:** `userId:123`

#### Set Up Alerts

1. Click **"Alerts"** → **"Create Alert"**
2. Example alert configs:

   **High Error Rate:**
   - Query: `level:error`
   - Condition: More than 10 events in 5 minutes
   - Notification: Slack

   **API Down:**
   - Query: `message:"MongoDB health check failed"`
   - Condition: Any event
   - Notification: Email + Slack

### Step 7: Optional - Add Logtail to Web App

If you want to ship Next.js logs too:

```bash
cd apps/web
pnpm add @logtail/pino
```

Create a new source in Logtail for `fullstack-lab-web` and follow the same pattern.

### What You Get (Free Tier):

- ✅ 1 GB of logs per month (~500k-1M requests)
- ✅ 3 days retention
- ✅ Real-time streaming
- ✅ Full-text search
- ✅ Unlimited team members
- ✅ SQL-like queries
- ✅ Alerts and notifications

---

## 3. Verification Checklist

After setup, verify everything works:

### Better Uptime Checklist

- [ ] API health monitor shows "Up"
- [ ] Web monitor shows "Up"
- [ ] Test incident sent notifications
- [ ] Slack channel receives alerts (if configured)
- [ ] Status page is accessible

### Logtail Checklist

- [ ] Logs appear in Logtail dashboard
- [ ] Can search logs by `requestId`
- [ ] Can filter by `level:error`
- [ ] Alert created for high error rate
- [ ] Slack webhook works (if configured)

### Test the Full Flow

1. **Test Uptime Alert:**

   ```bash
   # Temporarily stop your API to trigger alert
   fly scale count 0

   # Wait 1-2 minutes for Better Uptime to detect downtime
   # You should get alert notifications

   # Restore API
   fly scale count 1
   ```

2. **Test Log Collection:**

   ```bash
   # Make some API requests to generate logs
   curl https://api.rohangautam.dev/health/ready
   curl https://api.rohangautam.dev/api/v1/blogs

   # Check Logtail dashboard - you should see these requests
   ```

3. **Test Error Logging:**

   ```bash
   # Trigger an error (invalid endpoint)
   curl https://api.rohangautam.dev/api/v1/invalid-endpoint

   # Search in Logtail for: level:error
   # You should see the 404 error logged
   ```

---

## 4. Ongoing Maintenance

### Weekly Tasks

- Check Better Uptime dashboard for incident trends
- Review Logtail error logs

### Monthly Tasks

- Review Better Uptime uptime percentage (should be > 99.9%)
- Check Logtail usage (ensure you're under 1GB free tier)
- Review and update alert thresholds if needed

### When You Get Alerts

1. **Uptime Alert:**
   - Check Fly.io status: `fly status`
   - Check logs: `fly logs`
   - Check health endpoint manually
   - If MongoDB is down, check MongoDB Atlas

2. **Log Alert (High Errors):**
   - Go to Logtail
   - Filter by error time range
   - Check error patterns
   - Correlate with Sentry if needed

---

## 5. Cost Management

### Free Tier Limits

**Better Uptime:**

- 10 monitors (you're using 2-3)
- 1-minute checks
- No credit card required
- No automatic upgrade

**Logtail:**

- 1 GB/month (~500k-1M requests)
- 3 days retention
- If you exceed:
  - Free tier stops accepting logs (no surprise charges)
  - Or upgrade to $10/month for 5GB

### How to Stay Within Free Tier

**Better Uptime:**

- You're well within limits with 2-3 monitors
- Can add 7 more monitors if needed

**Logtail:**

- Average API request generates ~1KB of logs
- 1GB = ~1 million API requests per month
- If you're close to limit:
  - Reduce log level in production: `LOG_LEVEL=warn`
  - Filter out health check logs:
    ```typescript
    if (req.path.startsWith('/health')) return; // Already doing this!
    ```
  - Sample logs (only log 50% of requests)

### Monitoring Usage

**Better Uptime:**

- Dashboard shows credit usage
- Email notification when approaching limit

**Logtail:**

- Dashboard → Settings → Usage
- Shows current month's ingestion
- Progress bar shows % of free tier used

---

## 6. Alternative Options

If you want to explore alternatives:

### Uptime Monitoring Alternatives

- **UptimeRobot** - 50 monitors free (more monitors, but less features)
- **Checkly** - Programmable checks, 50k check runs/month free
- **Cronitor** - Combined uptime + cron monitoring

### Log Aggregation Alternatives

- **Axiom** - 500GB/month free, 30 days retention (better free tier!)
- **Papertrail** - 100MB/month free, 2 days retention
- **Grafana Loki** - Self-hosted, unlimited, but requires maintenance

### Recommended Stack for Free Tier

- **Uptime:** Better Uptime (10 monitors, best UX)
- **Logs:** Axiom (500GB free, better than Logtail's 1GB)

If you want to switch to Axiom instead of Logtail, let me know and I'll provide setup instructions!

---

## 7. Support & Documentation

**Better Uptime:**

- Docs: https://betterstack.com/docs/uptime/
- Support: support@betterstack.com
- Status: https://status.betterstack.com

**Logtail:**

- Docs: https://betterstack.com/docs/logs/
- Pino Integration: https://betterstack.com/docs/logs/pino/
- Support: support@betterstack.com

---

## Quick Setup Summary (TL;DR)

```bash
# 1. Sign up for Better Uptime
# → https://betterstack.com/better-uptime
# → Create 2 monitors (API + Web)
# → Add Slack webhook

# 2. Sign up for Logtail
# → https://betterstack.com/logtail
# → Create source, copy token

# 3. Install Logtail
cd apps/api
pnpm add @logtail/pino

# 4. Update logger (see Step 3 above)

# 5. Add secret to Fly.io
fly secrets set LOGTAIL_SOURCE_TOKEN=your_token_here

# 6. Deploy
fly deploy

# 7. Verify logs appear in Logtail dashboard

# Done! ✅
```

---

**Next Steps After Setup:**

1. Configure Sentry alerts (you already have Sentry!)
2. Create Logtail saved views for common queries
3. Set up on-call rotation in Better Uptime
4. Add more monitors for critical API endpoints
5. Consider upgrading to Axiom for better log retention

Need help with any of these steps? Let me know!
