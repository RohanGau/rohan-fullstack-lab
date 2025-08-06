# ---------- Stage 1: Base Setup ----------
FROM node:20-alpine AS base
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

# Copy only what’s needed to install dependencies
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY apps/admin/package.json apps/admin/

# Install monorepo dependencies
RUN pnpm install --frozen-lockfile

# ---------- Stage 2: Build Admin App ----------
FROM base AS build
WORKDIR /app

# Copy the full monorepo
COPY . .

# Build only the admin app
RUN pnpm --filter admin build

# ---------- Stage 3: Serve with Nginx ----------
FROM nginx:1.25-alpine AS serve
WORKDIR /usr/share/nginx/html

# Clean default nginx files
RUN rm -rf ./*

# Copy built React app from build stage
COPY --from=build /app/apps/admin/build ./

# Optional: Use custom nginx config (uncomment if you have one)
# COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
