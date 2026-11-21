---
status: accepted
---

# Operators are separate from Users, sign in with Google only, and no static admin credential exists

Admin-panel access is modelled as **Operators** in their own collection, authorized by **Roles** and **Permissions** (catalogue in code), and separate from the site `User` model and its `admin`/`editor`/`user` enum. Operators authenticate only through Google Identity Services and must be pre-registered; the API then issues its own short-lived JWTs. `ADMIN_TOKEN`, password login and token exchange are removed so there is no shared, non-attributable admin secret.

## Considered Options

- **Extend `User` and its role enum**: rejected because a fixed enum can't express per-route permissions or Super Admin-managed roles, and it would mix site visitors with admin-panel people.
- **Keep `ADMIN_TOKEN` quarantined for machine callers**: rejected for now; it was a signing-secret fallback and an unattributable bearer. The cost is that `apps/mcp-server` returns 401 until it gets its own service credential.
- **API-run authorization-code redirect flow**: rejected in favour of the SPA sending a Google ID token, verified with a server-issued nonce.

## Consequences

- `apps/mcp-server` is broken against the API until a service-credential type is designed.
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are required at startup.
- Every guarded route maps to one permission in `packages/constants`.
