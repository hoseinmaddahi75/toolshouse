# Multi-stage Dockerfile for Next.js Frontend
# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY my-medusa-storefront/package.json my-medusa-storefront/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY my-medusa-storefront/ .

# Build the application
RUN npm run build

# Stage 2: Create production image
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Environment variables
ENV NODE_ENV production
ENV PORT 3000

EXPOSE 3000

CMD ["node", "server.js"]