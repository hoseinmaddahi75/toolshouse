# Multi-stage Dockerfile for Medusa Backend
# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy all source files
COPY . .

# Build the application
RUN yarn build

# Stage 2: Create production image
FROM node:20-alpine

WORKDIR /app

# Copy mandatory files (فایل‌های حیاتی)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/medusa-config.ts ./medusa-config.ts
# 👇 این خط گم‌شده بود که اضافه شد:
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copy optional files with wildcards
COPY --from=builder /app/dis[t] ./dist
COPY --from=builder /app/sr[c] ./src
COPY --from=builder /app/buil[d] ./build
COPY --from=builder /app/publi[c] ./public
COPY --from=builder /app/stati[c] ./static
COPY --from=builder /app/.medus[a] ./.medusa

# Environment variables
ENV NODE_ENV=production
ENV PORT=9000

EXPOSE 9000

CMD ["yarn", "start"]