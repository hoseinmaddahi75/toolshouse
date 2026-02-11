# Dockerfile for Next.js Storefront
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --frozen-lockfile

COPY . .

# تنظیم متغیرهای محیطی برای زمان بیلد
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]