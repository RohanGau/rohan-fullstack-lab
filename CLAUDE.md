# Rohan Fullstack Lab — Claude Code Instructions

Welcome to **Rohan Fullstack Lab**, a modern full-stack engineering monorepo designed for high-scale experimentation, architecture research, and continuous learning by **Rohan Kumar**.

---

## 🏛️ Monorepo Architecture

This workspace is a `pnpm` monorepo organized into specialized applications and shared packages:

```
rohan-fullstack-lab/
├── apps/
│   ├── web/           # Next.js 15 (App Router, Tailwind CSS, Sentry, Cloudflare Pages)
│   ├── api/           # Express.js backend (TypeScript, MongoDB/Mongoose, Redis, Fly.io)
│   ├── admin/         # React Admin dashboard for content and operations
│   ├── worker-email/  # Cloudflare Worker queue consumer for async email delivery (Resend)
│   └── mcp-server/    # Model Context Protocol (MCP) server for agent tools & workflows
├── packages/
│   ├── types/         # Shared TypeScript DTOs, entity interfaces, and MCP schemas
│   └── constants/     # Shared constants, HTTP headers, queue events, and policy enums
├── .claude/
│   ├── skills/        # Project agent skills (slash commands and workflows)
│   └── GLOSSARY.md    # Shared engineering and planning vocabulary
└── CLAUDE.md          # This file (project guidance for Claude Code)
```

---

## 🛠️ Build & Development Commands

### Shared Packages

- `pnpm build:packages` — Build every shared package in `packages/*` (types, constants) in dependency order. Root scripts (`api:dev`, `mcp:dev`, `test`, `test:api`, `build`, `worker:email:*`) run it automatically; a new package only needs a `build` script. Constants is TypeScript: one folder per feature with a single `index.ts`, shared helpers in `utils/`.
- `pnpm api:dev` — Build shared packages, then start the API dev server

### Web Frontend (`apps/web`)

- `pnpm web:dev` — Start Next.js development server
- `pnpm web:build` — Build Next.js application for Cloudflare Pages

### Backend API (`apps/api`)

- `pnpm --filter node-backend dev` — Start Express API development server with nodemon
- `pnpm build:api` — Compile TypeScript to `apps/api/dist`
- `pnpm test:api` — Run Vitest suite for the API

### MCP Server (`apps/mcp-server`)

- `pnpm mcp:dev` — Run local MCP server over stdio
- `pnpm mcp:build` — Build MCP server

### Quality & Linting

- `pnpm -r lint` — Lint all packages and apps
- `pnpm -r format` — Format with Prettier
- `pnpm test` — Run all test suites across the monorepo

---

## 📐 Staff-Level Engineering Guidelines

1. **Architecture & Boundaries**:
   - Shared data shapes MUST be defined in `packages/types`. Do not duplicate interfaces across `apps/`.
   - Keep mutations idempotent. Respect and propagate `X-Request-Id` and `X-Idempotency-Key` headers.
   - Decouple heavy side-effects (like transactional emails) through queue publishing or circuit breakers.

2. **Frontend Conventions (Next.js 15)**:
   - **Default to React Server Components (RSC)**. Do not mark pages with `'use client'` unless client-side state, browser events, or window APIs are strictly required.
   - Keep data fetching on the server where possible for fast TTFB and search engine pre-rendering.
   - Use Radix UI primitives with Tailwind CSS for accessible, consistent UI components.

3. **Backend & Security Conventions (Express / Mongo)**:
   - **NoSQL Injection Prevention**: Always use `sanitizeMongoFilter` with an explicit `allowedFilterFields` allowlist for query endpoints.
   - **Rate Limiting**: Enforce Redis-backed rate limiting in staging and production.
   - **JWT Authentication**: Use `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` with short-lived access tokens and token rotation. Do not fall back to static admin tokens for signing secrets.
   - **Graceful Shutdown**: Always close database connections and flush Sentry events on `SIGTERM` / `SIGINT`.

4. **Testing Rigor**:
   - Never write assertion anti-patterns like `expect([200, 500]).toContain(status)`. Tests must assert deterministic behavior against seeded in-memory databases or clean mocks.
   - Always write regression tests when fixing bugs.

---

## 🤖 Claude Agent Skills & Workflows (`.claude/skills/`)

> 📖 **Full Guide & Playbook**: See [docs/CLAUDE_SKILLS_GUIDE.md](file:///Users/rohankumar/work/rohan-fullstack-lab/docs/CLAUDE_SKILLS_GUIDE.md) for detailed lifecycle walkthroughs, context hygiene best practices, and real-world monorepo examples.

Rohan Fullstack Lab includes a comprehensive suite of agent skills accessible via slash commands or autonomous invocation:

### Orchestration & Planning

- `/ask-rohan` — Interactive router to find the best skill or workflow for your task.
- `/to-spec` — Synthesize conversational requirements into a structured technical specification.
- `/to-tickets` — Break specifications into dependency-ordered, tracer-bullet implementation tickets.
- `/wayfinder` — High-level navigation and decision map for multi-step projects.

### Daily Engineering & Quality

- `/tdd` — Test-Driven Development workflow (Red -> Green -> Refactor) using Vitest.
- `/code-review` — Two-axis review of git diffs (Standards + Spec fidelity).
- `/diagnosing-bugs` — Root-cause analysis, reproduction, and regression test generation.
- `/improve-codebase-architecture` — Identify seams, decouple modules, and refactor cleanly.
- `/pr` — Generate clean pull request summaries with before/after evidence.

### Problem Clarification & Design

- `/grill-me` — Relentless, rapid interview to stress-test ideas and uncover edge cases.
- `/grill-with-docs` — Stateful interview that persists findings into architectural decision records (ADRs).
- `/prototype` — Build focused, throwaway code to answer an architectural question quickly.
- `/wait-what` — Clarify and re-explain complex concepts using the lab's domain glossary.

### Safety & Guardrails

- `git-guardrails-claude-code` — Pre-tool hook blocking destructive git commands (`push --force`, `reset --hard`, `clean -fd`).
