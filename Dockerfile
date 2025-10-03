# Multi-stage Dockerfile for acquisitions (Express + Drizzle + Neon)

# Base deps for installing
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Production-only deps
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Development image
FROM node:20-alpine AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ensure logs directory exists and is writable
RUN mkdir -p logs && chown -R node:node /app
USER node
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production image
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY . .
# Ensure logs directory exists and is writable
RUN mkdir -p logs && chown -R node:node /app
USER node
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/index.js"]
