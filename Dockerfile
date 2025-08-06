
# ---------------------------
# 🐳 Dockerfile for apps/api
# Supports pnpm + monorepo + TypeScript build for Fly.io
# ---------------------------

# Base Node image
FROM node:18-alpine

# Enable Corepack for pnpm support
RUN corepack enable

# Set working directory at monorepo root
WORKDIR /app

# Copy entire monorepo into the container
COPY . .

# Set working dir to API app
WORKDIR /app/apps/api

# Install all dependencies in the monorepo
RUN pnpm install --frozen-lockfile

# Build shared types package first
RUN pnpm --filter @fullstack-lab/types... run build

# Build the API (this compiles TypeScript to dist/)
RUN pnpm run build

# Expose port (adjust if your API uses a different port)
EXPOSE 5050

# Start the compiled Node.js app
CMD ["node", "dist/index.js"]
