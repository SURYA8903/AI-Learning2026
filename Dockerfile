# Multi-stage build for E-Learning Platform

# Stage 1: Build React frontend
FROM node:16-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# Stage 2: Build backend
FROM node:16-alpine AS backend-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci

# Stage 3: Production image
FROM node:16-alpine
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy backend from builder
COPY --from=backend-builder /app/server/node_modules ./server/node_modules
COPY server/ ./server/

# Copy frontend build from builder
COPY --from=frontend-builder /app/client/build ./client/build
COPY client/package*.json ./client/

# Install production dependencies only
RUN cd server && npm ci --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "server/server.js"]
