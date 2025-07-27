FROM node:18-alpine

# create app directory inside container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Install dev dependencies for building (typescript, etc.)
RUN npm install typescript ts-node @types/node --save-dev

# Copy all source files
COPY ./src ./src
COPY tsconfig.json ./

# Build the TypeScript code
RUN npx tsc

# Expose the port the app runs on 5050
EXPOSE 5050

# Use node to run the compiled as
CMD ["node", "dist/index.js"]