# Staff Engineer Review: Gaps & Recommendations

> Personal Portfolio Monorepo Analysis  
> Date: January 31, 2026

---

## Table of Contents

1. [System Design Gaps](#1-system-design-gaps)
2. [API Architecture Gaps](#2-api-architecture-gaps)
3. [Frontend Architecture Gaps](#3-frontend-architecture-gaps)
4. [Security Gaps](#4-security-gaps)
5. [Observability & Monitoring](#5-observability--monitoring)
6. [Testing](#6-testing)
7. [Developer Experience](#7-developer-experience)
8. [Infrastructure & Deployment](#8-infrastructure--deployment)
9. [Feature Enhancements](#9-feature-enhancements)
10. [Documentation](#10-documentation)
11. [Priority Matrix](#11-priority-matrix)
12. [Quick Wins](#12-quick-wins)

---

## 1. System Design Gaps

### 1.1 No API Gateway / Load Balancing Strategy

- **Current**: Single Fly.io instance = Single Point of Failure (SPOF)
- **Issue**: No health checks beyond keep-alive cron
- **Issue**: No circuit breaker pattern for downstream failures
- **Recommendation**:
  - Add Cloudflare as reverse proxy in front of Fly.io
  - Implement circuit breakers (`opossum` library)
  - Add proper health endpoints (`/health/live`, `/health/ready`)

### 1.2 Missing Message Queue / Event-Driven Architecture

- **Current**: Contact form, slot booking, email notifications are synchronous
- **Issue**: If email fails, entire request fails
- **Recommendation**:
  - Add message queue (Upstash Kafka or Cloudflare Queues)
  - Decouple: `POST /contact` → Queue → Email Worker
  - Enables retry logic and better failure handling

### 1.3 Read Replica / Database Scaling Strategy (Partially Addressed)

- **Current**: Single MongoDB connection (primary), with connection pooling configured.
- **Implemented**: Pooling + timeout config exists in `src/db/index.ts`:
  ```typescript
  mongoose.connect(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  ```
- **Gap**: No read/write splitting and no explicit replica-read preference strategy for read-heavy endpoints.
- **Recommendation**:
  - Keep existing pooling settings.
  - Add read preference strategy (`secondaryPreferred`) for safe read-only endpoints once replica set is enabled.
  - Add Mongo connection-pool metrics to observability dashboards.

### 1.4 Caching Layer is Partially Implemented

- **Current**: `@upstash/redis` is actively used for cache-aside response caching and namespace version invalidation in shared CRUD handlers.
- **Implemented**:
  - TTL cache (`5 minutes`) and Redis wrapper in `src/lib/cache.ts`.
  - Cached list/detail handlers via `src/lib/controller.ts` used by blogs/projects/slots.
- **Gap**:
  - Rate limiting still uses in-memory store (`express-rate-limit` default store), not Redis-backed.
  - Some controllers (e.g., profile/contact) still bypass shared cached handlers.
  - `ioredis` dependency appears unused and can be removed unless intentionally adopted.
- **Recommendation**:
  - Implement Redis-backed rate limiter store for multi-instance correctness.
  - Migrate remaining high-read endpoints to shared cache-aside handlers.
  - Remove unused Redis dependencies or standardize on one Redis client approach.

---

## 2. API Architecture Gaps

### 2.1 Middleware Ordering Bug (CRITICAL)

- **Current Order**: `CORS → JSON Parser → Routes → Error Handler → Helmet → Rate Limit`
- **Issue**: Helmet and rate limiting applied AFTER routes = ineffective
- **Fix**:
  ```typescript
  app.use(helmet());
  app.use(rateLimiter);
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '1mb' }));
  app.use(routes);
  app.use(errorHandler);
  ```

### 2.2 Authentication is Weak

- **Current**: Simple token comparison (`ADMIN_TOKEN`) instead of JWT
- **Issue**: No token expiration, refresh, or rotation
- **Issue**: No RBAC enforcement despite `User.role` existing
- **Recommendation**:
  - Implement proper JWT with `accessToken` + `refreshToken`
  - Add token rotation and expiration
  - Implement RBAC middleware based on `User.role`

### 2.3 Missing Request Validation

- **Issue**: No request body size limits (DoS vulnerability)
- **Issue**: No request ID tracking for debugging
- **Issue**: No request/response logging middleware
- **Recommendation**:

  ```typescript
  import { v4 as uuidv4 } from 'uuid';

  app.use((req, res, next) => {
    req.id = req.headers['x-request-id'] || uuidv4();
    res.setHeader('x-request-id', req.id);
    next();
  });
  ```

### 2.4 Missing API Versioning

- **Current**: All routes are `/api/blogs`, no versioning
- **Issue**: Breaking changes will affect all clients
- **Recommendation**: `/api/v1/blogs`, `/api/v1/projects`

### 2.5 No Idempotency Keys

- **Issue**: POST/PUT operations aren't idempotent
- **Issue**: Network retries could create duplicate entries
- **Recommendation**:
  - Add `Idempotency-Key` header support for mutations
  - Store keys in Redis with short TTL

### 2.6 No Request Timeout

- **Issue**: Long-running requests can hang indefinitely
- **Recommendation**: Add timeout middleware (e.g., 30s default)

### 2.7 No Graceful Shutdown

- **Issue**: Server stops abruptly, in-flight requests may fail
- **Recommendation**: Handle SIGTERM, drain connections before exit

---

## 3. Frontend Architecture Gaps

### 3.1 Hybrid Data Fetching is Confusing

- **Current**: Blog list = Client-side (Zustand + hooks), Blog detail = Server-side
- **Issue**: Mixed patterns make debugging harder
- **Recommendation**:
  - Use Server Components + `fetch()` consistently for SSR pages
  - Reserve client hooks for interactive features (search, filters)

### 3.2 No Error Tracking Service

- **Issue**: Client errors disappear silently
- **Issue**: No Sentry, LogRocket, or equivalent
- **Recommendation**: Add Sentry for error tracking + error boundary reporting

### 3.3 Missing Service Worker / PWA

- **Issue**: No offline support
- **Issue**: No push notifications
- **Issue**: No app-like experience
- **Recommendation**: Add `next-pwa` for service worker, cache blog content

### 3.4 No Analytics

- **Issue**: Can't track user behavior, popular posts
- **Issue**: Missing conversion tracking for contact form
- **Recommendation**: Add Plausible, Fathom, or Cloudflare Analytics

### 3.5 No A/B Testing Infrastructure

- **Issue**: Can't experiment with layouts, CTAs

### 3.6 No Image Optimization Pipeline

- **Current**: `unoptimized: true` in next.config.js
- **Issue**: Large images hurt performance
- **Recommendation**: Use Cloudflare Images or enable Next.js optimization

### 3.7 No Bundle Analysis

- **Issue**: Don't know what's increasing bundle size
- **Recommendation**: Add `@next/bundle-analyzer`

### 3.8 Missing Web Vitals Monitoring

- **Issue**: No Core Web Vitals tracking (LCP, FID, CLS)
- **Recommendation**: Add `web-vitals` reporting to analytics

---

## 4. Security Gaps

### 4.1 Critical Security Issues

| Issue                      | Severity | Current State | Fix                              |
| -------------------------- | -------- | ------------- | -------------------------------- |
| No CSRF protection         | HIGH     | Missing       | Add `csurf` or SameSite cookies  |
| No request size limit      | MEDIUM   | Missing       | `express.json({ limit: '1mb' })` |
| Helmet after routes        | MEDIUM   | Ineffective   | Move to top of middleware        |
| In-memory rate limiting    | MEDIUM   | Won't scale   | Use Redis store                  |
| No security headers on Web | MEDIUM   | Missing       | Add CSP, HSTS via Cloudflare     |

### 4.2 Missing Security Features

- [ ] Audit logging (who changed what, when)
- [ ] Brute-force protection on admin login
- [ ] IP allowlisting for admin panel
- [ ] Secrets rotation strategy
- [ ] SQL/NoSQL injection protection review
- [ ] XSS protection review
- [ ] Dependency vulnerability scanning (Snyk/Dependabot)

### 4.3 Recommendations

- Add audit log model and middleware
- Implement account lockout after N failed attempts
- Use Cloudflare Access for admin panel protection
- Enable Dependabot for security updates
- Add security.txt file

---

## 5. Observability & Monitoring

### ✅ 5.1 Application Performance Monitoring (APM) - IMPLEMENTED

**What You Have:**

- ✅ **Sentry APM** fully integrated on both API and Web
  - Performance tracing (10% sample rate in production)
  - Profiling (10% sample rate in production)
  - Error tracking with stack traces
  - Request context capturing
  - Web Vitals monitoring (CLS, FID, LCP, FCP, TTFB, INP)
- ✅ **Health checks** for MongoDB, liveness, and readiness
- ✅ **Request correlation** via `X-Request-Id` header

**Evidence:**

```typescript
// API: apps/api/src/utils/sentry.ts
tracesSampleRate: 0.1,        // 10% of transactions
profilesSampleRate: 0.1,      // 10% of profiles
integrations: [
  Sentry.captureConsoleIntegration({ levels: ['error'] })
]

// Web: apps/web/src/lib/monitoring/sentry.ts
captureWebVitalMetric(metric); // Tracks CLS, FID, LCP, etc.

// Request ID tracking: apps/api/src/middleware/requestContext.ts
req.requestId = resolveRequestId(req);
logger.info({ requestId: req.requestId, method, path, statusCode, durationMs });
```

**Gaps Remaining:**

- ❌ No custom business metrics (cache hit rate, queue depth, etc.)
- ❌ No database query performance tracking (slow query detection)
- ❌ No Redis connection health check (only MongoDB checked)
- ⚠️ Sentry sample rate might be too low (10%) - consider 20-30% for better visibility

**Recommendations:**

1. Add Redis health check to `checkReadiness()`:

   ```typescript
   // Check Redis connection
   if (redisRest) {
     const redisStart = Date.now();
     try {
       await redisRest.ping();
       checks.redis = { status: 'up', latency: Date.now() - redisStart };
     } catch (error) {
       checks.redis = { status: 'down', message: error.message };
       overallStatus = 'degraded'; // Not critical, rate limiting degrades to memory
     }
   }
   ```

2. Add custom Sentry metrics for business events:

   ```typescript
   Sentry.metrics.increment('blog.published', 1, { tags: { author: 'rohan' } });
   Sentry.metrics.distribution('cache.hit_rate', hitRate, { unit: 'percent' });
   ```

3. Consider increasing trace sample rate to 20-30% if budget allows

### ✅ 5.2 Structured Logging Strategy - IMPLEMENTED

**What You Have:**

- ✅ **Pino** configured with pretty printing in dev, JSON in production
- ✅ **Request ID correlation** across all logs
- ✅ **Request logging middleware** with duration tracking
- ✅ **Sentry data scrubbing** (removes passwords, tokens, auth headers)

**Evidence:**

```typescript
// Request logging with correlation ID
logger.info(
  {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode: res.statusCode,
    durationMs: Number(durationMs.toFixed(2)),
    ip: req.ip,
  },
  'HTTP request completed'
);
```

**Gaps Remaining:**

- ❌ Logs aren't shipped anywhere (ephemeral on Fly.io)
- ❌ No log retention policy
- ❌ No user ID correlation in logs (only requestId)
- ❌ No action/event tracking (e.g., `action: 'blog.create'`)

**Recommendations:**

1. Ship logs to log aggregation service:
   - **Logtail** (simple, Fly.io friendly): https://betterstack.com/logtail
   - **Axiom** (generous free tier): https://axiom.co
   - **Grafana Loki** (self-hosted)
2. Add user context to logger:

   ```typescript
   // In requireAuth middleware
   if (req.user) {
     logger = logger.child({ userId: req.user.id, role: req.user.role });
   }
   ```

3. Add structured action logging:
   ```typescript
   logger.info(
     {
       requestId: req.requestId,
       userId: req.user?.id,
       action: 'blog.create',
       resourceId: blog.id,
       duration: Date.now() - startTime,
     },
     'Blog created'
   );
   ```

### ⚠️ 5.3 Alerting - PARTIALLY IMPLEMENTED

**What You Have:**

- ✅ **Sentry error alerts** (can be configured in Sentry dashboard)
- ✅ **Health check endpoints** (`/health/live`, `/health/ready`, `/health/deep`)
- ⚠️ No uptime monitoring configured

**Gaps Remaining:**

- ❌ No uptime monitoring (Better Uptime, Checkly, UptimeRobot)
- ❌ No PagerDuty/OpsGenie for on-call rotation
- ❌ No Slack webhook for critical errors
- ❌ No alerting on health check failures
- ❌ No performance degradation alerts (e.g., p95 > 1s)

**Recommendations:**

1. **Configure Sentry Alerts** (you already have Sentry!):
   - Go to Sentry → Alerts → Create Alert
   - Set up:
     - New error alert (Slack notification)
     - Error spike alert (> 100 errors/hour)
     - Performance degradation alert (p95 > 1000ms)

2. **Add uptime monitoring** (5 minutes):

   ```bash
   # Better Uptime (free tier: 10 monitors)
   # 1. Sign up at https://betterstack.com/better-uptime
   # 2. Add monitors:
   #    - https://api.rohangautam.dev/health/ready (every 1 min)
   #    - https://rohangautam.dev (every 1 min)
   # 3. Set up Slack/email notifications
   ```

3. **Add Slack webhook for critical errors**:
   ```typescript
   // In Sentry beforeSend hook
   if (event.level === 'fatal' || event.level === 'error') {
     await fetch(process.env.SLACK_WEBHOOK_URL, {
       method: 'POST',
       body: JSON.stringify({
         text: `🚨 Error in ${process.env.NODE_ENV}: ${event.message}`,
         blocks: [
           { type: 'section', text: { type: 'mrkdwn', text: `*Error:* ${event.message}` } },
           {
             type: 'section',
             text: { type: 'mrkdwn', text: `*Environment:* ${process.env.NODE_ENV}` },
           },
         ],
       }),
     });
   }
   ```

### ❌ 5.4 No Dashboards

**Gaps:**

- ❌ No visualization of API metrics (request rate, error rate, latency)
- ❌ No business metrics (blog views, contact submissions, slot bookings)
- ❌ No infrastructure metrics (CPU, memory, disk)

**What You Can Use:**

- **Sentry Performance Dashboard** (you already have access!)
  - Go to Performance → check transaction throughput, p95, error rate
- **Fly.io Metrics** (built-in): https://fly.io/dashboard → Metrics tab
  - Shows CPU, memory, request count per region

**Recommendations:**

1. **Use existing Sentry dashboards first** (zero setup):
   - Sentry → Performance → view transaction performance
   - Sentry → Discover → create custom queries for business metrics

2. **Add Grafana Cloud (free tier: 10k metrics)** for custom dashboards:

   ```bash
   # Export metrics from Sentry to Grafana
   # Or use Fly.io's Prometheus metrics
   ```

3. **Simple business metrics endpoint**:
   ```typescript
   // apps/api/src/routes/metricsRoutes.ts
   router.get('/metrics', requireAuth, async (req, res) => {
     const [blogCount, contactCount, slotCount] = await Promise.all([
       Blog.countDocuments({ status: 'published' }),
       Contact.countDocuments(),
       Slot.countDocuments({ status: 'booked' }),
     ]);
     res.json({ blogs: blogCount, contacts: contactCount, slots: slotCount });
   });
   ```

### ⚠️ 5.5 Log Aggregation - NOT IMPLEMENTED

**Current State:**

- ❌ Logs are ephemeral on Fly.io (lost on container restart)
- ❌ No centralized log search/filtering
- ❌ No log retention beyond 24-48 hours

**Impact:**

- Can't debug issues that happened > 48 hours ago
- Can't correlate errors across multiple instances
- Can't analyze trends over time

**Recommendation: Add Logtail (5 minutes setup):**

1. **Sign up for Logtail** (free tier: 1GB/month, 3 days retention)

   ```bash
   # 1. Create account at https://betterstack.com/logtail
   # 2. Create new source "fullstack-lab-api"
   # 3. Copy source token
   ```

2. **Add Pino transport for Logtail:**

   ```typescript
   // apps/api/src/utils/logger.ts
   import pino from 'pino';

   const transports = [];

   if (process.env.LOGTAIL_SOURCE_TOKEN) {
     transports.push({
       target: '@logtail/pino',
       options: { sourceToken: process.env.LOGTAIL_SOURCE_TOKEN },
     });
   }

   const logger = pino({
     transport:
       process.env.NODE_ENV !== 'production'
         ? { target: 'pino-pretty' }
         : transports.length > 0
           ? { targets: transports }
           : undefined,
   });
   ```

3. **Alternative: Axiom (better free tier)**
   - Free: 500GB/month, 30 days retention
   - Setup: https://axiom.co/docs/send-data/pino

**Priority: MEDIUM** (logs expire quickly, but Sentry covers errors)

---

## 6. Testing

### 6.1 No Tests Found (CRITICAL)

- [ ] No unit tests
- [ ] No integration tests
- [ ] No E2E tests
- [ ] No API contract tests

### 6.2 Recommended Test Structure

```
apps/api/
├── src/
└── tests/
    ├── unit/           # Vitest - test functions in isolation
    ├── integration/    # Supertest - test API endpoints
    └── fixtures/       # Test data

apps/web/
└── tests/
    ├── unit/           # Vitest + Testing Library
    ├── e2e/            # Playwright
    └── fixtures/
```

### 6.3 Testing Priorities

1. API integration tests for critical paths (blog CRUD, contact form)
2. Unit tests for validation logic
3. E2E tests for happy paths (home → blog → contact)
4. Visual regression tests for UI components

### 6.4 No Test Coverage Requirements

- **Issue**: No coverage thresholds in CI
- **Issue**: No PR checks for test coverage
- **Recommendation**: Require 70%+ coverage for new code

### 6.5 No Load Testing

- **Issue**: Unknown capacity limits
- **Issue**: No performance baselines
- **Recommendation**: Add k6 or Artillery, run before major releases

### 6.6 No Contract Testing

- **Issue**: Frontend/backend can drift out of sync
- **Recommendation**: Add Pact or use OpenAPI validation

---

## 7. Developer Experience

### 7.1 No Local Development Orchestration

- **Issue**: No `docker-compose.yml` for local MongoDB/Redis
- **Issue**: Devs need to set up services manually
- **Recommendation**:
  ```yaml
  # docker-compose.dev.yml
  services:
    mongodb:
      image: mongo:7
      ports: ['27017:27017']
    redis:
      image: redis:7-alpine
      ports: ['6379:6379']
  ```

### 7.2 Missing Pre-commit Hooks

- **Issue**: No lint, format, type-check before commit
- **Issue**: No commitlint for conventional commits
- **Issue**: No Husky setup
- **Recommendation**:
  ```json
  {
    "scripts": {
      "prepare": "husky install"
    },
    "lint-staged": {
      "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
    }
  }
  ```

### 7.3 No Code Generation

- **Issue**: Types are manually written
- **Issue**: No OpenAPI → TypeScript generation
- **Recommendation**: Generate API client from Swagger using `openapi-typescript`

### 7.4 Missing Debug Configuration

- [ ] No `.vscode/launch.json` for debugging
- [ ] No VSCode workspace settings
- [ ] No recommended extensions list

### 7.5 No Monorepo Task Runner

- **Current**: Manual pnpm filter commands
- **Recommendation**: Consider Turborepo for caching and task orchestration

### 7.6 No Environment Variable Documentation

- **Issue**: Required env vars not documented
- **Recommendation**: Add `.env.example` files with all required variables

### 7.7 No Contribution Guidelines

- **Issue**: No CONTRIBUTING.md
- **Issue**: No PR template
- **Issue**: No issue templates

---

## 8. Infrastructure & Deployment

### 8.1 No Infrastructure as Code

- **Current**: Fly.io config in `fly.toml` only
- **Issue**: No Terraform/Pulumi for reproducible infra
- **Recommendation**: Add Terraform for Fly.io, Cloudflare, MongoDB Atlas

### 8.2 No Staging → Production Promotion

- **Issue**: Code deploys directly to stage/prod
- **Issue**: No canary deployments
- **Issue**: No rollback strategy documented
- **Recommendation**:
  - Implement blue-green or canary deployments
  - Document rollback procedures

### 8.3 No Database Migrations

- **Issue**: Schema changes are implicit
- **Issue**: No version-controlled migrations
- **Recommendation**: Add `migrate-mongo` in `apps/api/migrations/`

### 8.4 No Backup Strategy

- **Issue**: MongoDB backup configuration not evident
- **Issue**: No disaster recovery plan
- **Recommendation**:
  - Enable MongoDB Atlas backups (if using Atlas)
  - Document RTO/RPO targets

### 8.5 No Secrets Management

- **Current**: Secrets in GitHub secrets
- **Issue**: No rotation policy
- **Issue**: No Vault/Doppler integration
- **Recommendation**: Document rotation schedule, consider Doppler

### 8.6 No Multi-Region Deployment

- **Issue**: Single region deployment
- **Recommendation**: Add Fly.io regions for better latency

### 8.7 No CDN for API Responses

- **Issue**: API responses not cached at edge
- **Recommendation**: Add cache headers, use Cloudflare caching

---

## 9. Feature Enhancements

### 9.1 Content Features

- [ ] Full-text blog search (MongoDB text search exists but not exposed)
- [ ] Related posts recommendations
- [ ] Reading progress indicator
- [ ] Table of contents for long posts
- [ ] Code syntax highlighting themes
- [ ] Blog comments (Giscus, Disqus)
- [ ] Newsletter subscription (ConvertKit, Buttondown)
- [ ] Blog series/collections
- [ ] Post reactions (likes, bookmarks)

### 9.2 Portfolio Features

- [ ] Project case studies (detailed write-ups)
- [ ] Tech stack explorer (filter projects by tech)
- [ ] Testimonials section
- [ ] Speaking/talks section
- [ ] Resume/CV download (PDF generation)
- [ ] Work timeline visualization
- [ ] GitHub activity integration

### 9.3 Engagement Features

- [ ] Like/bookmark posts (anonymous or authenticated)
- [ ] Share buttons with copy-to-clipboard
- [ ] View counter per post
- [ ] Reading time estimates (dynamic based on content)
- [ ] Social proof (visitor counter, GitHub stars)

### 9.4 Admin Features

- [ ] Draft preview (see post before publishing)
- [ ] Scheduled publishing
- [ ] Bulk operations (delete, archive multiple)
- [ ] Media library browser
- [ ] Analytics dashboard (views, popular posts)
- [ ] SEO suggestions per post
- [ ] Markdown editor with live preview

### 9.5 SEO & Marketing Features

- [ ] Canonical URL management
- [ ] Schema.org markup for all content types
- [ ] Twitter card preview in admin
- [ ] Auto-generate social images
- [ ] Broken link checker

### 9.6 Accessibility Features

- [ ] Skip navigation link (exists but verify)
- [ ] ARIA landmarks audit
- [ ] Keyboard navigation testing
- [ ] Screen reader testing
- [ ] Color contrast verification
- [ ] Reduced motion support

---

## 10. Documentation

### 10.1 Missing Documentation

- [ ] API documentation in README (beyond Swagger)
- [ ] Architecture Decision Records (ADRs)
- [ ] Runbook for common operations
- [ ] Incident response playbook
- [ ] Onboarding guide for contributors
- [ ] Deployment guide
- [ ] Local development setup guide

### 10.2 Recommended ADRs to Write

- ADR-001: Monorepo structure decision
- ADR-002: Database choice (MongoDB)
- ADR-003: Deployment platform selection
- ADR-004: Authentication strategy
- ADR-005: Caching strategy

### 10.3 Code Documentation

- [ ] JSDoc comments on public functions
- [ ] README in each app/package directory
- [ ] Inline comments for complex logic

---

## 11. Priority Matrix

### P0 - Critical (Do First)

| Item                     | Category | Effort   |
| ------------------------ | -------- | -------- |
| Fix middleware ordering  | Security | 1 hour   |
| Add request size limits  | Security | 30 min   |
| Add basic API tests      | Testing  | 1-2 days |
| Add `.env.example` files | DX       | 1 hour   |

### P1 - High Priority

| Item                         | Category      | Effort    |
| ---------------------------- | ------------- | --------- |
| Add error tracking (Sentry)  | Observability | 2-3 hours |
| Implement Redis caching      | Performance   | 1 day     |
| Upgrade to proper JWT auth   | Security      | 1-2 days  |
| Add pre-commit hooks (Husky) | DX            | 2 hours   |
| Add health check endpoints   | Reliability   | 2 hours   |
| Add uptime monitoring        | Observability | 1 hour    |

### P2 - Medium Priority

| Item                             | Category      | Effort   |
| -------------------------------- | ------------- | -------- |
| Add docker-compose for local dev | DX            | 2 hours  |
| Add API versioning               | API           | 4 hours  |
| Add structured logging           | Observability | 4 hours  |
| Add database migrations          | Infra         | 1 day    |
| Add E2E tests                    | Testing       | 2-3 days |
| Enable Dependabot                | Security      | 30 min   |

### P3 - Low Priority (Nice to Have)

| Item                       | Category | Effort   |
| -------------------------- | -------- | -------- |
| Newsletter subscription    | Feature  | 1 day    |
| Blog comments              | Feature  | 1-2 days |
| PWA support                | Feature  | 1 day    |
| A/B testing infrastructure | Feature  | 2-3 days |
| Multi-region deployment    | Infra    | 1 day    |

---

## 12. Quick Wins (< 1 day each)

1. [ ] Fix middleware ordering in `apps/api/src/index.ts`
2. [ ] Add `express.json({ limit: '1mb' })`
3. [ ] Add pre-commit hooks with Husky + lint-staged
4. [ ] Create `docker-compose.dev.yml` for local MongoDB
5. [ ] Add health check endpoints (`/health/live`, `/health/ready`)
6. [ ] Set up Cloudflare Analytics (free)
7. [ ] Add Sentry free tier for error tracking
8. [ ] Create `.env.example` files for all apps
9. [ ] Add `CONTRIBUTING.md`
10. [ ] Enable Dependabot for security updates
11. [ ] Add `.vscode/launch.json` for debugging
12. [ ] Add graceful shutdown handling

---

## Progress Tracker

Use this section to track progress:

```
[ ] = Not started
[~] = In progress
[x] = Completed
[-] = Skipped/Won't do
```

### Current Sprint

- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

---

## Notes

_Add your implementation notes here as you work through items_

---

_Generated by Staff Engineer Review - January 2026_
