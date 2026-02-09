# MCP Server

This package exposes a local MCP server over stdio and uses your existing API for blog operations.

## Available tools

- `blogs_create_draft`: create a draft blog post
- `blogs_list_recent`: list recent blogs (supports status/search/tag filters)
- `blogs_get_by_id_or_slug`: fetch one blog by id or slug
- `blogs_update_draft`: update one draft blog
- `blogs_delete_draft`: delete one draft blog
- `blogs_publish_blog`: publish an existing blog (disabled unless explicitly enabled)

## Environment

Copy and configure:

```bash
cp apps/mcp-server/.env.example apps/mcp-server/.env
```

Required:

- `MCP_API_BEARER_TOKEN`: bearer token with access to `/api/v1/blogs` write routes

Optional:

- `MCP_API_BASE_URL` (default: `http://localhost:5050/api/v1`)
- `MCP_ACTOR_ID` (propagated as `x-actor-id`)
- `MCP_API_TIMEOUT_MS` (default: `10000`)
- `MCP_ALLOW_BLOG_PUBLISH` (default: `false`)

## Run

```bash
pnpm mcp:dev
```

Build and start:

```bash
pnpm mcp:build
pnpm mcp:start
```
