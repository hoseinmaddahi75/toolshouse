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

# Build the backend API
RUN yarn build

# 👇 فورس کردنِ ساخت پنل مدیریت (این دستور پوشه build را تولید میکند)
ENV NODE_ENV=production
RUN npx medusa-admin build

# Stage 2: Create production image
FROM node:20-alpine

WORKDIR /app

# Copy mandatory files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/medusa-config.ts ./medusa-config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copy the generated core and admin folders (حذف کروشه برای اطمینان از وجود فایل‌ها)
COPY --from=builder /app/.medusa ./.medusa
COPY --from=builder /app/build ./build

# Optional files (فقط برای پوشه‌های استاتیک و جانبی)
COPY --from=builder /app/sr[c] ./src
COPY --from=builder /app/publi[c] ./public
COPY --from=builder /app/stati[c] ./static
COPY --from=builder /app/dis[t] ./dist

# Environment variables
ENV NODE_ENV=production
ENV PORT=9000

EXPOSE 9000

CMD ["yarn", "start"]