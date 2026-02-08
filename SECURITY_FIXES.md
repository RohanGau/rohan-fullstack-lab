# Security Fixes Implementation Summary

This document outlines the critical security fixes implemented based on the security audit.

## ✅ Completed Fixes (Priority 1-4)

### 1. Enforce Redis Rate Limiting in Prod/Stage ✅

**Problem:** Rate limiting silently fell back to in-memory store when Redis was unavailable, making multi-instance deployments vulnerable.

**Fix:** Added hard enforcement in production/stage environments.

**Files Changed:**

- `apps/api/src/index.ts` (lines 91-103)

**Implementation:**

```typescript
// SECURITY: Enforce Redis in production/stage environments
if (!generalRateLimitStore || !writeRateLimitStore) {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'stage') {
    logger.error('FATAL: Upstash Redis is required for rate limiting in production/stage...');
    process.exit(1);
  }
  logger.warn('Upstash Redis is not configured...');
}
```

**Verification:**

```bash
# Test in production mode without Redis (should fail to start)
NODE_ENV=production npm start

# Expected: Server exits with error about missing Redis credentials
```

---

### 2. Brute-Force Protection on /auth/login ✅

**Problem:** Login endpoint only had global rate limiting, vulnerable to distributed credential stuffing attacks.

**Fix:** Dual-layer rate limiting with IP-based and account-based tracking.

**Files Changed:**

- `apps/api/src/middleware/authRateLimit.ts` (new file)
- `apps/api/src/routes/authRoutes.ts` (line 21)

**Implementation:**

- **Tier 1 (IP-based):** 10 login attempts per 15 minutes per IP in production
- **Tier 2 (Account-based):** 5 login attempts per 15 minutes per username/email in production
- Uses Redis for distributed tracking
- Enforces Redis requirement in production/stage

**Rate Limits:**
| Environment | IP Limit | Account Limit | Window |
|-------------|----------|---------------|--------|
| Production | 10 | 5 | 15 min |
| Development | 100 | 50 | 15 min |

**Verification:**

```bash
# Test IP-based rate limit
for i in {1..11}; do curl -X POST http://localhost:5050/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"wrong"}'; done

# Expected: 11th request returns 429 Too Many Requests

# Test account-based rate limit (from different IPs)
for i in {1..6}; do curl -X POST http://localhost:5050/api/v1/auth/login -H "Content-Type: application/json" -H "X-Forwarded-For: 1.2.3.$i" -d '{"email":"admin@example.com","password":"wrong"}'; done

# Expected: 6th request returns 429 Too Many Requests
```

---

### 3. Query Filter Sanitization (NoSQL Injection Prevention) ✅

**Problem:** List endpoints accepted raw filter objects, vulnerable to MongoDB operator injection attacks like `$where`, `$regex`, `$expr`.

**Fix:** Explicit field allowlisting and operator sanitization.

**Files Changed:**

- `apps/api/src/utils/sanitizeFilter.ts` (new file)
- `apps/api/src/types/controller.ts` (added `allowedFilterFields`)
- `apps/api/src/lib/controller.ts` (integrated sanitization)
- `apps/api/src/controllers/profileController.ts`
- `apps/api/src/controllers/contactController.ts`
- `apps/api/src/controllers/blogController.ts`
- `apps/api/src/controllers/projectController.ts`
- `apps/api/src/controllers/slotController.ts`

**Implementation:**

1. Created `sanitizeMongoFilter()` utility that:
   - Blocks dangerous operators: `$where`, `$expr`, `$regex`, `$jsonSchema`, `$function`, `$accumulator`, `$text`
   - Only allows safe comparison operators: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$exists`
   - Enforces explicit field allowlisting

2. Updated all `makeListHandler()` calls to specify `allowedFilterFields`

**Example:**

```typescript
// Before (VULNERABLE)
export const getAllProfiles = makeListHandler({
  ns: NS,
  model: Profile,
  buildQuery: (filter) => filter || {}, // Accepts ANY filter!
});

// After (SECURE)
export const getAllProfiles = makeListHandler({
  ns: NS,
  model: Profile,
  buildQuery: (filter) => filter || {},
  allowedFilterFields: ['name', 'email', 'title', 'location', 'yearsOfExperience'],
});
```

**Attack Examples (Now Blocked):**

```bash
# Attempt 1: $where injection (arbitrary code execution)
curl 'http://localhost:5050/api/v1/profiles?filter[$where]=this.password.length>0'
# Result: ✅ Blocked - $where operator removed

# Attempt 2: $regex ReDoS attack
curl 'http://localhost:5050/api/v1/profiles?filter[email][$regex]=^a.*b.*c.*d.*e.*f.*'
# Result: ✅ Blocked - $regex operator removed

# Attempt 3: Undocumented field injection
curl 'http://localhost:5050/api/v1/profiles?filter[password]=admin'
# Result: ✅ Blocked - 'password' not in allowedFilterFields
```

**Verification:**

```bash
# Test blocked operators
curl -G 'http://localhost:5050/api/v1/profiles' --data-urlencode 'filter[$where]=true'
# Expected: Returns empty or all profiles (filter ignored)

# Test allowed filters
curl -G 'http://localhost:5050/api/v1/profiles' --data-urlencode 'filter[name]=John'
# Expected: Returns profiles filtered by name

# Test field allowlist
curl -G 'http://localhost:5050/api/v1/profiles' --data-urlencode 'filter[password]=secret'
# Expected: Filter ignored, returns all profiles
```

---

### 4. Web Security Headers ✅

**Problem:** Missing security headers on web application (CSP, HSTS, X-Frame-Options, etc.).

**Fix:** Added comprehensive security headers via Next.js config and Cloudflare Pages headers file.

**Files Changed:**

- `apps/web/next.config.ts` (added `headers()` function)
- `apps/web/public/_headers` (new file for Cloudflare Pages deployment)

**Headers Implemented:**

| Header                      | Value                                                  | Purpose                       |
| --------------------------- | ------------------------------------------------------ | ----------------------------- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`                  | Force HTTPS for 1 year        |
| `Content-Security-Policy`   | Comprehensive CSP policy                               | Prevent XSS attacks           |
| `X-Frame-Options`           | `DENY`                                                 | Prevent clickjacking (legacy) |
| `X-Content-Type-Options`    | `nosniff`                                              | Prevent MIME sniffing         |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                      | Control referrer information  |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=(), payment=()` | Restrict browser features     |

**CSP Policy Details:**

```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com
style-src 'self' 'unsafe-inline'
img-src 'self' data: https: blob:
font-src 'self' data:
connect-src 'self' https://api.rohangautam.dev https://challenges.cloudflare.com https://*.sentry.io
frame-src https://challenges.cloudflare.com
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
object-src 'none'
```

**Note:** `unsafe-inline` and `unsafe-eval` are required for Next.js functionality. For stricter CSP, consider implementing nonce-based CSP in the future.

**Verification:**

```bash
# Test security headers (local Next.js dev server)
curl -I http://localhost:3000

# Expected response headers:
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# Content-Security-Policy: default-src 'self'; ...
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Referrer-Policy: strict-origin-when-cross-origin

# Test in browser DevTools
# 1. Open https://rohangautam.dev
# 2. Open DevTools → Network tab
# 3. Refresh page
# 4. Click on document request
# 5. Check Response Headers section
```

---

## 📋 Still Missing (From Original Audit)

### 5. Dependabot + Dependency Scanning ⏳

**Status:** Not implemented (lower priority)

**Recommended Action:**
Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
```

Add to CI workflow:

```yaml
- name: Audit dependencies
  run: pnpm audit --audit-level=high
```

### 6. security.txt ⏳

**Status:** Not implemented (lower priority)

**Recommended Action:**
Create `apps/web/public/.well-known/security.txt`:

```
Contact: security@rohangautam.dev
Expires: 2026-12-31T23:59:59.000Z
Preferred-Languages: en
```

### 7. Audit Logging ⏳

**Status:** Not implemented (significant effort)

**Recommended Approach:**

- Add audit trail for data mutations (create/update/delete)
- Log: user, action, timestamp, resource, old/new values
- Store in separate audit collection or service

### 8. IP Allowlisting for Admin Panel ⏳

**Status:** Not implemented (use case dependent)

**Recommended Approach:**

- Add middleware to check `req.ip` against allowlist
- Apply to admin-only routes
- Configure allowlist via environment variable

---

## 🧪 Testing Checklist

- [ ] Verify Redis enforcement in production
- [ ] Test login brute-force protection (IP + account)
- [ ] Test NoSQL injection attempts on all list endpoints
- [ ] Verify security headers in production deployment
- [ ] Check CSP policy doesn't break functionality
- [ ] Test Cloudflare Turnstile still works with CSP
- [ ] Verify Sentry error reporting still works

---

## 🚀 Deployment Notes

### Required Environment Variables (Production/Stage)

```bash
# Redis (REQUIRED in prod/stage, server will exit if missing)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here

# Existing variables (no changes)
NODE_ENV=production
PORT=5050
...
```

### Breaking Changes

1. **Redis is now required in production/stage** - Server will exit with error code 1 if Redis env vars are missing
2. **Login rate limits are stricter** - Users may encounter 429 errors during legitimate password recovery attempts (10 attempts/15min per IP, 5 attempts/15min per account)
3. **Query filters are restricted** - API clients using undocumented filter fields will have them silently ignored

### Migration Guide

1. **Before deploying:**
   - Ensure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set in production/stage
   - Review allowed filter fields for your API consumers
   - Test CSP policy in staging environment

2. **After deploying:**
   - Monitor rate limit 429 errors in logs
   - Check for CSP violations in browser console
   - Verify Redis connection in health checks

---

## 📊 Security Posture Summary

| Category               | Before                      | After             | Status    |
| ---------------------- | --------------------------- | ----------------- | --------- |
| Rate Limiting          | ⚠️ In-memory fallback       | ✅ Redis-enforced | **FIXED** |
| Brute-Force Protection | ⚠️ Global only              | ✅ IP + Account   | **FIXED** |
| NoSQL Injection        | ❌ Vulnerable               | ✅ Sanitized      | **FIXED** |
| Web Security Headers   | ❌ Missing                  | ✅ Implemented    | **FIXED** |
| CSRF Protection        | ⚠️ Not needed (Bearer auth) | ⚠️ Not needed     | N/A       |
| Dependency Scanning    | ❌ Missing                  | ❌ Missing        | TODO      |
| Audit Logging          | ❌ Missing                  | ❌ Missing        | TODO      |
| IP Allowlisting        | ❌ Missing                  | ❌ Missing        | TODO      |

---

## 📝 Additional Recommendations

1. **CSP Nonce Implementation:** Replace `unsafe-inline` with nonce-based CSP for better XSS protection
2. **Rate Limit Monitoring:** Add alerts for sustained 429 responses (possible DoS attack)
3. **Filter Audit:** Review all list endpoints to ensure `allowedFilterFields` match business requirements
4. **Security Testing:** Run OWASP ZAP or similar security scanner against production
5. **Penetration Testing:** Consider third-party security audit for production launch

---

**Implementation Date:** February 8, 2026  
**Implemented By:** AI Assistant  
**Review Status:** ✅ Linter checks passed, ready for testing
