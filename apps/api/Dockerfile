# ----------- Base Stage: Setup Workspace -----------
FROM node:18-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

# Copy workspace config & install context
COPY pnpm-workspace.yaml .
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/types/package.json packages/types/

# Install all deps for the workspace
RUN pnpm install --frozen-lockfile

# ----------- Build Stage -----------
FROM base AS build
COPY . .

# Build shared types first
RUN pnpm --filter @fullstack-lab/types build

# Build backend
RUN pnpm --filter node-backend build

# ----------- Production Runtime Stage -----------
FROM node:18-alpine AS runtime
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

# Copy required config
COPY pnpm-workspace.yaml .
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/types/package.json packages/types/

# Set build arg + env for env selection
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

COPY apps/api/.env.${NODE_ENV} /app/apps/api/.env

# Install only production deps for backend
RUN pnpm install --prod --filter node-backend...

# Copy built app from build stage
COPY --from=build /app/apps/api/dist ./apps/api/dist

# Copy node_modules (symlinked workspace)
COPY --from=build /app/node_modules ./node_modules

# Copy env file (optional)
# COPY apps/api/.env ./apps/api/.env

# Set working directory to compiled code
WORKDIR /app/apps/api

EXPOSE 5050
CMD ["node", "dist/index.js"]
