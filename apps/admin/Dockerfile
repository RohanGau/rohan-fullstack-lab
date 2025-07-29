# --- Stage 1: Build the app ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Serve with nginx (production best practice) ---
FROM nginx:1.25-alpine AS serve

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built assets from previous stage
COPY --from=build /app/build .  
# If you're using Vite or Next.js static export, change above to dist:
# COPY --from=build /app/dist .

# Copy custom nginx config (optional, for SPA)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
