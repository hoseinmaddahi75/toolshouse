# Dockerfile for MedusaJS Backend
FROM node:20-slim

WORKDIR /app

# نصب ابزارهای لازم برای بیلد
RUN apt-get update && apt-get install -y python3 make g++ 

COPY package*.json ./
RUN npm install --frozen-lockfile

COPY . .

# بیلد کردن پروژه
RUN npm run build

EXPOSE 9000

CMD ["npx", "medusa", "start"]