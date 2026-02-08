# Staff Engineer Review: Remaining Items

> Personal Portfolio Monorepo - Outstanding Tasks  
> Last Updated: February 8, 2026

---

## ✅ Recently Completed (February 8, 2026)

### Security Fixes ✅

- ✅ **Redis rate limiting enforcement** - Prod/stage requires Redis, no silent fallback
- ✅ **Brute-force protection** - Dual-layer rate limiting on `/auth/login` (IP + account-based)
- ✅ **NoSQL injection prevention** - Query filter sanitization with explicit field allowlisting
- ✅ **Web security headers** - CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy
- ✅ **Middleware ordering** - Helmet and rate limiting now BEFORE routes
- ✅ **Request size limits** - 1MB limit on JSON/URL-encoded payloads

### Documentation ✅

- ✅ `SECURITY_FIXES.md` - Complete implementation guide
- ✅ `MONITORING_SETUP.md` - Step-by-step observability setup
- ✅ Updated `.env.example` with new security variables

---

## 📋 Table of Contents - Remaining Items

1. [System Design Gaps](#1-system-design-gaps)
2. [API Architecture Gaps](#2-api-architecture-gaps)
3. [Frontend Architecture Gaps](#3-frontend-architecture-gaps)
4. [Security Gaps (Remaining)](#4-security-gaps-remaining)
5. [Observability & Monitoring (Remaining)](#5-observability--monitoring-remaining)
6. [Testing](#6-testing)
7. [Developer Experience](#7-developer-experience)
8. [Infrastructure & Deployment](#8-infrastructure--deployment)
9. [Feature Enhancements](#9-feature-enhancements)
10. [Documentation](#10-documentation)
11. [Priority Matrix](#11-priority-matrix)

---

## 1. System Design Gaps

### 1.1 No Circuit Breaker Pattern

- **Issue**: Email service failures block entire request
- **Impact**: Contact form submissions fail when Gmail SMTP is down
- **Recommendation**:
  - Add circuit breaker using `opossum` library
  - Implement for external services (email, Cloudflare API)
  - Add fallback queue when circuit is open

### 1.2 Missing Message Queue for Async Operations

- **Current**: Email notifications are synchronous
- **Issue**: Slow SMTP responses block API requests (5-10 seconds)
- **Recommendation**:
  - Implement Cloudflare Queue for email notifications
  - Decouple: `POST /contact` → Queue → Worker sends email
  - Add retry logic with exponential backoff

### 1.3 Database Read Replica Strategy

- **Current**: Single MongoDB connection (primary)
- **Gap**: No read/write splitting for high-traffic endpoints
- **Recommendation**:
  - Add read preference strategy (`secondaryPreferred`)
  - Use for read-heavy endpoints (blogs, projects, profiles)
  - Monitor connection pool metrics

### 1.4 Migrate Remaining Endpoints to Cached Handlers

- **Gap**: Profile and contact controllers bypass shared cache
- **Recommendation**:
  - Migrate `getAllProfiles` to use `makeListHandler` with caching
  - Add cache TTL configuration per resource type
  - Remove duplicate caching logic

---

## 2. API Architecture Gaps

### 2.1 Inconsistent API Versioning

- **Current**: Mix of `/api` and `/api/v1` prefixes
- **Issue**: Some routes use legacy prefix, others use versioned
- **Evidence**:
  - `apps/api/src/index.ts` has both `API_VERSIONS.CURRENT_PREFIX` and `LEGACY_PREFIX`
- **Recommendation**:
  - Deprecate `/api` prefix completely
  - Add deprecation headers to legacy routes
  - Document migration timeline for clients

### 2.2 Error Handling Needs Standardization

- **Issue**: Mix of custom error messages and generic responses
- **Example Inconsistency**:

  ```typescript
  // Some controllers:
  res.status(404).json({ error: 'NOT_FOUND' });

  // Others:
  res.status(404).json({ error: 'Blog not found' });
  ```

- **Recommendation**:
  - Create centralized error code enum
  - Standardize error response format:
    ```typescript
    {
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Blog post not found',
        requestId: 'abc-123',
        timestamp: '2026-02-08T...'
      }
    }
    ```

### 2.3 No Request/Response Validation Middleware

- **Gap**: Joi validation exists but inconsistently applied
- **Issue**: Some endpoints skip validation entirely
- **Recommendation**:
  - Create reusable validation middleware
  - Apply to all mutation endpoints
  - Add response schema validation in dev mode

### 2.4 Missing Pagination Standards

- **Current**: Custom pagination per endpoint
- **Issue**: Inconsistent range headers, limit handling
- **Recommendation**:
  - Standardize on cursor-based pagination for large datasets
  - Use RFC 7233 Range headers consistently
  - Add `Link` headers for next/prev pages

---

## 3. Frontend Architecture Gaps

### 3.1 Cloudflare Pages Refresh Issue (CRITICAL)

- **Issue**: 500 Internal Server Error when refreshing pages
- **Cause**: `@cloudflare/next-on-pages` adapter compatibility issues
- **Evidence**: "duplicated identifier" error during build
- **Recommendation (Pick One)**:
  1. **Deploy to Vercel** (easiest, 5 min)
  2. Use static export (`output: 'export'`)
  3. Upgrade to OpenNext adapter

### 3.2 No Client-Side Error Boundary

- **Gap**: React errors crash entire app
- **Recommendation**:
  - Add global error boundary component
  - Integrate with Sentry for client-side errors
  - Show user-friendly fallback UI

### 3.3 No Loading States / Skeleton Screens

- **Issue**: Flash of empty content during data fetch
- **Recommendation**:
  - Add Suspense boundaries
  - Implement skeleton loaders for lists
  - Use React Query for better loading states

### 3.4 Bundle Size Not Monitored

- **Current**: No bundle size tracking
- **Recommendation**:
  - Enable Next.js bundle analyzer
  - Set up Bundlephobia checks in CI
  - Add bundle size budgets

---

## 4. Security Gaps (Remaining)

### 4.1 No Audit Logging

- **Gap**: No record of who changed what and when
- **Impact**: Can't investigate data tampering or unauthorized access
- **Recommendation**:
  - Add audit log model with fields:
    ```typescript
    {
      (userId,
        action,
        resourceType,
        resourceId,
        oldValue,
        newValue,
        ipAddress,
        userAgent,
        timestamp);
    }
    ```
  - Log all mutations (create, update, delete)
  - Store in separate collection with longer retention

### 4.2 No IP Allowlisting for Admin Panel

- **Gap**: Admin routes accessible from any IP
- **Recommendation**:
  - Add middleware to check IP against allowlist
  - Store allowed IPs in environment variable
  - Add override mechanism for emergencies

### 4.3 No Secrets Rotation Strategy

- **Gap**: No documented process for rotating secrets
- **Recommendation**:
  - Document rotation runbook for:
    - JWT secrets
    - Database credentials
    - API keys (Cloudflare, Sentry, etc.)
  - Set calendar reminders (quarterly)
  - Test rotation in staging first

### 4.4 Missing Dependency Scanning

- **Gap**: No automated vulnerability scanning
- **Recommendation**:
  - Add Dependabot configuration:
    ```yaml
    # .github/dependabot.yml
    version: 2
    updates:
      - package-ecosystem: 'npm'
        directory: '/'
        schedule:
          interval: 'weekly'
    ```
  - Add `pnpm audit` to CI pipeline
  - Set up automated security PRs

### 4.5 No security.txt

- **Gap**: No responsible disclosure policy
- **Recommendation**:
  - Create `apps/web/public/.well-known/security.txt`:
    ```
    Contact: security@rohangautam.dev
    Expires: 2027-02-08T23:59:59.000Z
    Preferred-Languages: en
    ```

---

## 5. Observability & Monitoring (Remaining)

### 5.1 Better Uptime Monitoring (5 minutes)

- **Action**: Sign up and create monitors
- **Steps**:
  1. Go to https://betterstack.com/better-uptime
  2. Create monitor for `https://api.rohangautam.dev/health/ready`
  3. Create monitor for `https://rohangautam.dev`
  4. Configure Slack/email notifications

### 5.2 Deploy Logtail (10 minutes)

- **Status**: Code ready, needs deployment
- **Steps**:
  1. Get source token from Logtail dashboard
  2. `fly secrets set LOGTAIL_SOURCE_TOKEN=your_token`
  3. `fly deploy`
  4. Verify logs appear in Logtail

### 5.3 Configure Sentry Alerts (5 minutes)

- **Action**: Set up error spike and performance alerts
- **Steps**:
  1. Go to Sentry → Alerts → Create Alert
  2. Create "New Error" alert → Slack notification
  3. Create "Error Spike" alert (> 100 errors/hour)
  4. Create "Performance Degradation" alert (p95 > 1000ms)

### 5.4 Create Business Metrics Dashboard

- **Gap**: No visibility into business metrics
- **Metrics Needed**:
  - Blog views per post
  - Contact form submissions
  - Slot booking conversion rate
  - API endpoint usage
- **Recommendation**:
  - Use Sentry Discover for custom queries
  - Create Grafana dashboard for trends
  - Add metrics endpoint (`/api/v1/metrics`)

### 5.5 Add Redis Health Check

- **Gap**: Health endpoint only checks MongoDB
- **Recommendation**:
  ```typescript
  // In health.ts
  if (redisRest) {
    try {
      await redisRest.ping();
      checks.redis = { status: 'up', latency: Date.now() - start };
    } catch (error) {
      checks.redis = { status: 'down', message: error.message };
      overallStatus = 'degraded'; // Not critical
    }
  }
  ```

---

## 6. Testing

### 6.1 No Integration Tests

- **Current**: Only basic health check tests exist
- **Gap**: No end-to-end API tests
- **Recommendation**:
  - Add Supertest for API integration tests
  - Test auth flow (login, refresh, logout)
  - Test rate limiting behavior
  - Test error handling

### 6.2 No Frontend Tests

- **Gap**: No component tests, no E2E tests
- **Recommendation**:
  - Add Vitest for component unit tests
  - Add Playwright for E2E testing
  - Test critical flows (contact form, blog navigation)

### 6.3 No Load Testing

- **Gap**: Unknown breaking point under load
- **Recommendation**:
  - Use k6 or Artillery for load testing
  - Test scenarios:
    - 100 concurrent users browsing blogs
    - Sustained 50 req/s to API
    - Burst traffic (500 req/s for 10s)

---

## 7. Developer Experience

### 7.1 No Pre-commit Hooks for Security

- **Current**: Husky configured but no security checks
- **Recommendation**:
  - Add pre-commit hook for secret scanning
  - Add pre-commit hook for linting
  - Add pre-push hook for tests

### 7.2 No Local Development Docker Compose

- **Gap**: Developers need to install MongoDB, Redis locally
- **Recommendation**:
  - Create `docker-compose.yml` with:
    - MongoDB
    - Redis
    - Mailhog (for email testing)
  - Document one-command setup

### 7.3 No Automated Database Migrations

- **Gap**: Schema changes require manual updates
- **Recommendation**:
  - Add migration framework (Mongoose Migrate or Flyway)
  - Version control schema changes
  - Add rollback capability

---

## 8. Infrastructure & Deployment

### 8.1 No Backup Strategy

- **Gap**: No documented backup/restore process
- **Recommendation**:
  - Enable MongoDB Atlas automated backups
  - Document restore procedure
  - Test restore monthly

### 8.2 No Staging Environment

- **Gap**: Changes deploy directly to production
- **Recommendation**:
  - Create staging Fly.io app
  - Deploy to staging first
  - Run smoke tests before prod

### 8.3 No Rollback Plan

- **Gap**: No documented process for rolling back deployments
- **Recommendation**:
  - Document Fly.io rollback command
  - Add deployment health checks
  - Implement blue-green deployment

### 8.4 No Infrastructure as Code

- **Gap**: Manual Fly.io configuration
- **Recommendation**:
  - Define infrastructure in `fly.toml`
  - Version control all config
  - Document disaster recovery steps

---

## 9. Feature Enhancements

### 9.1 Add API Documentation

- **Current**: Swagger configured but incomplete
- **Recommendation**:
  - Complete OpenAPI specs for all endpoints
  - Add request/response examples
  - Enable "Try it out" feature

### 9.2 Add Blog Post Versioning

- **Gap**: No edit history for blog posts
- **Recommendation**:
  - Add version history to Blog model
  - Track changes with timestamps
  - Allow reverting to previous versions

### 9.3 Add Email Confirmation for Contact Form

- **Gap**: No confirmation email sent to user
- **Recommendation**:
  - Send confirmation email with copy of submission
  - Add to email queue
  - Include tracking/reference number

---

## 10. Documentation

### 10.1 Add Architecture Decision Records (ADRs)

- **Gap**: No record of why decisions were made
- **Recommendation**:
  - Create `docs/adr/` directory
  - Document key decisions (JWT auth, Cloudflare Pages, etc.)
  - Use template format

### 10.2 Add API Client Examples

- **Gap**: No example code for consuming API
- **Recommendation**:
  - Add examples in multiple languages
  - Include authentication flow
  - Document rate limiting

### 10.3 Add Troubleshooting Guide

- **Gap**: No guide for common issues
- **Recommendation**:
  - Document common errors and solutions
  - Add debugging tips
  - Include monitoring screenshots

---

## 11. Priority Matrix

### 🔴 Critical (Do This Week)

| Item                         | Impact | Effort | Priority |
| ---------------------------- | ------ | ------ | -------- |
| Deploy Logtail               | High   | 10 min | P0       |
| Set up Better Uptime         | High   | 5 min  | P0       |
| Configure Sentry Alerts      | High   | 5 min  | P0       |
| Fix Cloudflare Pages refresh | High   | 15 min | P0       |
| Add Dependabot               | Medium | 5 min  | P1       |
| Create security.txt          | Low    | 5 min  | P1       |

### 🟡 High Priority (This Month)

| Item                       | Impact | Effort  | Priority |
| -------------------------- | ------ | ------- | -------- |
| Add audit logging          | High   | 4 hours | P1       |
| Add integration tests      | High   | 8 hours | P1       |
| Circuit breaker for email  | Medium | 2 hours | P2       |
| Redis health check         | Low    | 30 min  | P2       |
| Standardize error handling | Medium | 4 hours | P2       |

### 🟢 Medium Priority (Next Quarter)

| Item                     | Impact | Effort  | Priority |
| ------------------------ | ------ | ------- | -------- |
| Message queue for emails | Medium | 6 hours | P3       |
| Database read replicas   | Low    | 4 hours | P3       |
| Load testing             | Medium | 4 hours | P3       |
| Docker Compose setup     | Medium | 2 hours | P3       |
| Backup strategy          | High   | 2 hours | P3       |

### ⚪ Low Priority (Backlog)

- IP allowlisting (unless needed)
- Blog post versioning
- Email confirmation for contact
- Bundle size monitoring
- Architecture Decision Records

---

## 12. Quick Wins (< 30 minutes each)

1. ✅ ~~Redis rate limiting~~ **DONE**
2. ✅ ~~Security headers~~ **DONE**
3. ✅ ~~Request size limits~~ **DONE**
4. ⏳ **Deploy Logtail** (10 min)
5. ⏳ **Set up Better Uptime** (5 min)
6. ⏳ **Configure Sentry Alerts** (5 min)
7. ⏳ **Add Dependabot config** (5 min)
8. ⏳ **Create security.txt** (5 min)
9. ⏳ **Add Redis health check** (10 min)
10. ⏳ **Fix API versioning inconsistency** (15 min)

---

## 13. Deployment Checklist

### Before Deploying to Production

- [ ] Run `pnpm audit` - no high/critical vulnerabilities
- [ ] Run linter - no errors
- [ ] Test in local environment
- [ ] Deploy to staging (if available)
- [ ] Run smoke tests
- [ ] Check Sentry for errors
- [ ] Monitor logs in Logtail
- [ ] Verify health endpoints return 200
- [ ] Test rate limiting works
- [ ] Verify security headers present
- [ ] Check Better Uptime shows "Up"

### After Deployment

- [ ] Monitor error rate in Sentry
- [ ] Check response times (< 500ms p95)
- [ ] Verify no 500 errors in logs
- [ ] Test key user flows (blog, contact, slots)
- [ ] Check database connections stable
- [ ] Verify Redis connection working

---

## 14. Next Steps (This Week)

```bash
# Monday: Monitoring Setup (30 min)
1. Deploy Logtail: Set token + deploy API
2. Set up Better Uptime: Create 2 monitors
3. Configure Sentry alerts: Error spike + performance

# Tuesday: Security Hardening (30 min)
4. Add Dependabot config
5. Create security.txt
6. Add pnpm audit to CI

# Wednesday: Fix Web Deployment (30 min)
7. Fix Cloudflare Pages refresh OR deploy to Vercel
8. Test all pages refresh correctly

# Thursday: Health Checks (30 min)
9. Add Redis health check
10. Test health endpoints

# Friday: Documentation (30 min)
11. Update README with new monitoring setup
12. Document deployment process
```

---

## Summary

### Completed (February 8, 2026)

- ✅ 4 critical security fixes
- ✅ Middleware ordering fixed
- ✅ Comprehensive documentation

### Remaining

- ⏳ **6 quick wins** (< 30 min each) - Do this week
- ⏳ **5 high-priority items** (< 1 day each) - Do this month
- ⏳ **15 medium-priority items** - Next quarter

### Progress

- **Security**: 57% complete (4/7 items)
- **Observability**: 20% complete (1/5 items)
- **Overall**: ~30% of full staff engineer review

**You've knocked out the most critical security issues!** Focus on the quick wins this week to get monitoring in place, then tackle the higher-effort items next month.

---

**Last Updated**: February 8, 2026  
**Next Review**: March 1, 2026
