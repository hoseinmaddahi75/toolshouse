import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import path from "path"

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      // @ts-ignore
      trustProxy: true,
      // @ts-ignore
      cookieOptions: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
      storeCors: process.env.STORE_CORS || "https://toolshouse.ir,https://www.toolshouse.ir,http://localhost:3000",
      adminCors: process.env.ADMIN_CORS || "https://api.toolshouse.ir,https://toolshouse.ir,https://www.toolshouse.ir,http://localhost:3000",
      authCors: process.env.AUTH_CORS || "https://api.toolshouse.ir,https://toolshouse.ir,https://www.toolshouse.ir,http://localhost:3000",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/zarinpal",
            id: "zarinpal",
            options: {
              merchant_id: process.env.ZARINPAL_MERCHANT_ID,
              callbackUrl: "https://api.toolshouse.ir/zarinpal/verify",
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/file", // کلمه medusa برگشت
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local", // کلمه medusa برگشت
            id: "local",
            options: {
              upload_dir: "static",
              backend_url: "https://api.toolshouse.ir/static", // کلمه static اضافه شد
            },
          },
        ],
      },
    },
  ],
})