# 1. مرحله بیلد (Builder)
FROM node:20 AS builder
WORKDIR /app

# کپی کردن مستقیم فایل‌ها از سیستم شما
# (چون اینترنت داخل داکر اذیت می‌کند)
COPY package.json ./
COPY node_modules ./node_modules
COPY . .

# تنظیم متغیرها
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ARG MEDUSA_BACKEND_URL
ENV MEDUSA_BACKEND_URL=$MEDUSA_BACKEND_URL

# اجرای بیلد (اینجا به اینترنت نیاز ندارد چون ماژول‌ها هستند)
RUN npm run build

# 2. مرحله نهایی (سبک‌سازی)
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

CMD ["npm", "start"]