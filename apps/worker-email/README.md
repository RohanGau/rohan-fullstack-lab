# Email Queue Worker

Cloudflare Worker consumer for slot email notifications.

## Local dev

1. Copy `.dev.vars.example` to `.dev.vars`.
2. Run `pnpm worker:email:dev` from repository root.

## Deploy

1. `wrangler secret put RESEND_API_KEY`
2. `wrangler secret put ADMIN_EMAIL`
3. `wrangler secret put EMAIL_FROM`
4. `pnpm worker:email:deploy`
