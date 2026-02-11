import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import path from "path" // 👈 حتما این ایمپورت شود

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL, // 👈 این خط حتماً باشد
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/zarinpal",
            id: "zarinpal",
            options: {
              merchant_id: process.env.ZARINPAL_MERCHANT_ID,
              callbackUrl: "http://localhost:9000/zarinpal/verify",
            },
          },
        ],
      },
    },
  ],
})