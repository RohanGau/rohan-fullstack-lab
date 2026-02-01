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

### 1.3 No Read Replica / Database Scaling Strategy

- **Current**: Single MongoDB connection
- **Issue**: No read/write splitting
- **Issue**: No connection pooling configuration
- **Recommendation**: Add connection pooling config
  ```typescript
  mongoose.connect(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  ```

### 1.4 Caching Layer is Incomplete

- **Current**: Redis packages installed (`ioredis`, `@upstash/redis`) but NEVER used
- **Issue**: Rate limiting uses in-memory store (won't work with multiple instances)
- **Issue**: No API response caching
- **Recommendation**:
  - Implement Redis-backed rate limiting
  - Add cache layer for expensive queries (blog list, profile)
  - Use cache-aside pattern with TTL

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

### 5.1 No Application Performance Monitoring (APM)

- **Issue**: Can't identify slow endpoints
- **Issue**: No distributed tracing
- **Issue**: No database query performance tracking
- **Recommendation**:
  - Add OpenTelemetry instrumentation
  - Use Grafana Cloud, Datadog, or New Relic
  - Add custom metrics (request duration, cache hit rate)

### 5.2 No Structured Logging Strategy

- **Current**: Pino configured but underutilized
- **Issue**: No correlation IDs across requests
- **Issue**: Logs aren't shipped anywhere
- **Recommendation**:
  ```typescript
  logger.info({
    requestId: req.id,
    userId: req.user?.id,
    action: 'blog.create',
    duration: Date.now() - startTime,
    status: 'success',
  });
  ```

### 5.3 No Alerting

- **Issue**: Keep-alive cron pings but doesn't alert on failure
- **Issue**: No Slack/email alerts for errors
- **Recommendation**:
  - Add uptime monitoring (Better Uptime, Checkly)
  - Set up PagerDuty/OpsGenie for on-call
  - Create Slack webhook for critical errors

### 5.4 No Dashboards

- **Issue**: No visualization of API metrics
- **Issue**: No business metrics (blog views, contact conversion rate)
- **Recommendation**: Set up Grafana or use Fly.io metrics

### 5.5 No Log Aggregation

- **Issue**: Logs are ephemeral on Fly.io
- **Recommendation**: Ship logs to Logtail, Papertrail, or Loki

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
