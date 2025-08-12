# ---------- Base deps (install only what's needed) ----------
FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

# Use pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

# Copy ONLY the files needed to resolve & install deps for the API and types
# (Do NOT copy the whole repo here)
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/types/package.json packages/types/package.json

# Install deps for the filtered workspaces only (api + types)
RUN pnpm install --frozen-lockfile

# ---------- Build (compile types first, then API) ----------
FROM base AS build
# Now bring in only the source for types and the API
COPY packages/types/ packages/types/
RUN pnpm -F @fullstack-lab/types build

COPY apps/api/ apps/api/
RUN pnpm -F node-backend build

# ---------- Runtime (small, production) ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

# Copy workspace manifests + lockfile for pruned install
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/types/package.json packages/types/package.json

# Install ONLY production deps for API (and its local workspaces)
RUN pnpm install --prod --frozen-lockfile --filter node-backend...

# Bring in compiled output (no sources from other apps)
COPY --from=build /app/packages/types/dist packages/types/dist
COPY --from=build /app/apps/api/dist apps/api/dist

WORKDIR /app/apps/api
EXPOSE 5050
CMD ["node", "dist/index.js"]
