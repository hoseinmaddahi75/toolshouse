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

# Build the application (بک‌اند و ادمین ساخته می‌شوند)
ENV NODE_ENV=production
RUN npx medusa build

# Stage 2: Create production image
FROM node:20-alpine

WORKDIR /app

# Copy mandatory files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/medusa-config.ts ./medusa-config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copy generated folders
COPY --from=builder /app/.medus[a] ./.medusa
COPY --from=builder /app/buil[d] ./build
COPY --from=builder /app/dis[t] ./dist
COPY --from=builder /app/sr[c] ./src
COPY --from=builder /app/publi[c] ./public
COPY --from=builder /app/stati[c] ./static

# 🎯 راه‌حل مبتنی بر فکت: کپی کردن پنل ادمین به مسیرهای پیش‌فرضِ سرور
RUN mkdir -p build/public/admin build/admin public/admin && \
    cp -r .medusa/server/public/admin/* build/public/admin/ || true && \
    cp -r .medusa/server/public/admin/* build/admin/ || true && \
    cp -r .medusa/server/public/admin/* public/admin/ || true

# Environment variables
ENV NODE_ENV=production
ENV PORT=9000

EXPOSE 9000

CMD ["yarn", "start"]