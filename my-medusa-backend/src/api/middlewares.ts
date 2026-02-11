import { defineMiddlewares } from "@medusajs/medusa";

export default defineMiddlewares({
  routes: [
    {
      // 🎯 شاه‌کلید: استفاده از Regex برای گرفتن تمام درخواست‌های اردر
      // این پترن می‌گوید: هر چیزی که با /admin/orders شروع می‌شود
      matcher: /^\/admin\/orders\/.*$/,
      middlewares: [
        (req, res, next) => {
          // 1. تنظیم دستی هدرهای CORS (بدون چک کردن شرط)
          // ما فرض می‌کنیم درخواست از پورت 3000 می‌آید
          res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-medusa-access-token");
          res.setHeader("Access-Control-Allow-Credentials", "true");

          // 2. لاگ برای اینکه در ترمینال ببینیم آیا درخواست را گرفتیم؟
          if (req.method === "OPTIONS") {
             console.log(`⚡ [MIDDLEWARE FIX] Intercepted OPTIONS for: ${req.url}`);
             res.sendStatus(200); // تایید فوری
             return;
          }

          next();
        },
      ],
    },
  ],
});