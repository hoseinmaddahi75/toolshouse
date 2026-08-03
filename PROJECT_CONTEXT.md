# PROJECT_CONTEXT.md

## وضعیت پیشرفت
- [x] فاز ۱ — نمای کلی و استک فنی
- [x] فاز ۲ — معماری بکاند مدوسا و دیتا مدل
- [x] فاز ۳ — معماری فرانتاند
- [x] فاز ۴ — احراز هویت (مشتری + ادمین)
- [x] فاز ۵ — متغیرهای محیطی، دیپلوی و زیرساخت
- [x] فاز ۶ — جمعبندی، تناقضزدایی، نکات کسبوکاری

## معرفی پروژه
پروژه یک **پلتفرم ای‌کامرس** بر پایه فریمورک [Medusa v2](https://medusajs.com) (headless) است که شامل دو بخش اصلی می‌شود:
- **Backend**: سرور Medusa با ماژول‌های سفارشی و تنظیمات پرداخت ایرانی (Zarinpal)
- **Frontend**: استورفرانت با Next.js 16 و App Router، همراه با داشبورد ادمین

هدف نهایی تبدیل این پروژه به یک **تمپلیت قابل تکرار** برای مشتریان فریلنس است.

## استک فنی

### Backend (`my-medusa-backend`)
- **فریمورک**: [Medusa v2](https://medusajs.com) (preview version)
- **ماژول‌های کلیدی Medusa**:
  - `@medusajs/medusa` (core)
  - `@medusajs/framework`
  - `@medusajs/product`, `@medusajs/cart`, `@medusajs/order`
  - `@medusajs/customer`, `@medusajs/user`
  - `@medusajs/payment`, `@medusajs/pricing`, `@medusajs/tax`
  - `@medusajs/region`, `@medusajs/currency`
  - `@medusajs/file-s3` (برای ذخیره فایل‌ها در S3)
  - `@medusajs/admin-sdk`
  - `@medusajs/workflow-engine-inmemory`
- **دیتابیس**: TypeORM (پشتیبانی از SQLite, PostgreSQL)
- **Redis**: ioredis v5.9.2 (برای caching و sessions)
- **Node.js**: >=20
- **TypeScript**: v5.7.2
- **پکیج‌های جانبی**:
  - `axios` v1.13.5
  - `cors` v2.8.5
  - `multer` v1.4.5-lts.1 (برای آپلود فایل)
  - `react-quill` v2.0.0 (ویرایشگر متن)

**دستورات اصلی:**
- `dev`: `medusa develop` (پورت 9000)
- `start`: `medusa start`
- `build`: `medusa build`

---

### Frontend (`my-medusa-storefront`)
- **فریمورک**: Next.js v16.0.10
- **React**: v19.2.1
- **CSS**: Tailwind CSS v4 + `@tailwindcss/postcss`
- **UI Components**:
  - `@radix-ui/react-*` (Dialog, Select, Tabs, Toggle, etc.)
  - `@heroicons/react` v2.2.0
  - `lucide-react` v0.561.0
  - `shadcn/ui` (استفاده از کامپوننت‌های سفارشی بر پایه Radix)
  - `framer-motion` v12.23.26 (انیمیشن‌ها)
  - `swiper` v12.0.3 (اسلایدرها)
  - `sonner` v2.0.7 (نوتیفیکیشن‌ها)
- **State Management**:
  - `@tanstack/react-query` v5.90.12 (برای fetch و caching)
  - `zustand` v5.0.9 (برای state جهانی)
- **Form Handling**:
  - `react-hook-form` v7.68.0
  - `@hookform/resolvers` v5.2.2
  - `zod` v4.1.13 (برای validation)
- **Medusa SDK**:
  - `@medusajs/js-sdk` v2.12.2
  - `@medusajs/medusa-js` v6.1.10
- **فونت**: `@fontsource/vazirmatn` v5.2.8 (فونت فارسی)
- **پکیج‌های جانبی**:
  - `axios` v1.13.2
  - `clsx` + `tailwind-merge` (برای کلاس‌های شرطی)
  - `nuqs` v2.8.5 (برای query params در Next.js)
  - `@woocommerce/woocommerce-rest-api` v1.0.2 (اتصال به WooCommerce)

**دستورات اصلی:**
- `dev`: `next dev` (پورت 3000)
- `build`: `next build`
- `start`: `next start`

## ساختار کلی پوشهها

### Backend (`my-medusa-backend/`)
```
my-medusa-backend/
├── src/
│   ├── admin/          # تنظیمات ادمین پنل
│   ├── api/            # API routes سفارشی
│   ├── jobs/           # Jobهای پس‌زمینه
│   ├── lib/            # توابع کمکی
│   ├── links/          # لینک‌های سفارشی
│   ├── migrations/     # مایگریشن‌های دیتابیس
│   ├── models/         # مدل‌های سفارشی
│   ├── modules/        # ماژول‌های سفارشی Medusa
│   ├── scripts/        # اسکریپت‌ها (مثل seed)
│   ├── services/       # سرویس‌های سفارشی
│   ├── subscribers/    # Subscriberهای event-based
│   ├── utils/          # یوتیلیتی‌ها (مثل ارسال SMS)
│   └── workflows/      # Workflow‌های سفارشی
├── medusa-config.ts    # تنظیمات اصلی Medusa
├── package.json
├── tsconfig.json
├── Dockerfile
└── .env
```

### Frontend (`my-medusa-storefront/`)
```
my-medusa-storefront/
├── src/
│   ├── app/
│   │   ├── (admin)/     # داشبورد ادمین (route group)
│   │   │   └── dashboard/
│   │   │       ├── categories/  # مدیریت دسته‌بندی‌ها
│   │   │       ├── products/    # مدیریت محصولات
│   │   │       ├── orders/      # مدیریت سفارشات
│   │   │       ├── customers/   # مدیریت مشتریان
│   │   │       ├── comments/    # مدیریت کامنت‌ها
│   │   │       ├── reviews/     # مدیریت نظرات
│   │   │       ├── blog/        # مدیریت وبلاگ
│   │   │       ├── blog-categories/
│   │   │       ├── resources/   # مدیریت منابع
│   │   │       ├── site-reviews/# مدیریت نظرات سایت
│   │   │       └── attributes/  # مدیریت ویژگی‌ها
│   │   ├── (store)/     # استورفرانت (route group)
│   │   ├── account/     # صفحات کاربری (لاگین، ثبت‌نام)
│   │   ├── admin/       # صفحات لاگین ادمین
│   │   ├── api/         # API routes Next.js
│   │   ├── backend/     # اتصال به بکاند
│   │   ├── blog/        # وبلاگ
│   │   ├── checkout/    # فرآیند پرداخت
│   │   ├── collections/ # دسته‌بندی‌ها
│   │   ├── products/    # محصولات
│   │   ├── wishlist/    # لیست علاقه‌مندی‌ها
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/      # کامپوننت‌های React
│   ├── lib/            # توابع و تنظیمات
│   │   ├── medusa-client.ts  # کلاینت Medusa
│   │   ├── store.ts          # تنظیمات React Query
│   │   └── data/             # توابع fetch داده‌ها
│   └── types/          # TypeScript types
├── public/            # فایل‌های استاتیک
├── components.json     # تنظیمات shadcn/ui
├── next.config.mjs
├── tailwind.config.js
├── postcss.config.mjs
└── package.json
```

## معماری بکاند و دیتا مدل

### تنظیمات اصلی ([`medusa-config.ts`](my-medusa-backend/medusa-config.ts:1))
- **دیتابیس**: TypeORM با URL از `DATABASE_URL`
- **Redis**: برای caching و event bus با URL از `REDIS_URL`
- **CORS**:
  - `storeCors`: `https://toolshouse.ir,https://www.toolshouse.ir,http://localhost:3000`
  - `adminCors`: `https://api.toolshouse.ir,https://toolshouse.ir,https://www.toolshouse.ir,http://localhost:3000`
  - `authCors`: مشابه `adminCors`
- **JWT**:
  - `jwtSecret`: از `JWT_SECRET` (پیشفرض: `supersecret`)
  - `cookieSecret`: از `COOKIE_SECRET` (پیشفرض: `supersecret`)
- **Cookie Options**:
  - `sameSite: "none"`
  - `secure: true`
  - `httpOnly: true`
  - `maxAge: 24 * 60 * 60 * 1000` (24 ساعت)

### ماژول‌ها
1. **Redis Cache**: `@medusajs/medusa/cache-redis`
2. **Redis Event Bus**: `@medusajs/medusa/event-bus-redis`
3. **Payment**:
   - ماژول پایه: `@medusajs/medusa/payment`
   - **پرداخت سفارشی**: ماژول [`zarinpal`](my-medusa-backend/src/modules/zarinpal) (اتصال به درگاه زرینپال)
     - `merchant_id`: از `ZARINPAL_MERCHANT_ID`
     - `callbackUrl`: `https://api.toolshouse.ir/zarinpal/verify`
     - **نکته**: مبلغ از ریال به تومان تبدیل می‌شود (`amount / 10`)
4. **File Storage**:
   - ماژول پایه: `@medusajs/medusa/file`
   - Provider: `@medusajs/medusa/file-local`
     - `upload_dir`: `static`
     - `backend_url`: `https://api.toolshouse.ir/static`

### ماژول سفارشی Zarinpal (`src/modules/zarinpal/`)
- **فایل‌ها**:
  - [`index.ts`](my-medusa-backend/src/modules/zarinpal/index.ts:1): ثبت سرویس به عنوان Payment Provider
  - [`service.ts`](my-medusa-backend/src/modules/zarinpal/service.ts:1): پیاده‌سازی کلاس `ZarinpalPaymentProvider`
    - متدهای اصلی:
      - `initiatePayment()`: شروع پرداخت (ارسال به `https://api.zarinpal.com/pg/v4/payment/request.json`)
      - `authorizePayment()`: تایید پرداخت (ارسال به `https://api.zarinpal.com/pg/v4/payment/verify.json`)
      - `updatePayment()`, `cancelPayment()`, `capturePayment()`, `deletePayment()`: پیاده‌سازی خالی

### Subscribers
- **Order Notifier** ([`order-notifier.ts`](my-medusa-backend/src/subscribers/order-notifier.ts:1)):
  - رویداد: `order.placed`
  - عملکرد:
    1. ارسال پیامک به مشتری با استفاده از [`sendFarazPattern()`](my-medusa-backend/src/utils/faraz-sender.ts:6)
    2. ارسال پیامک به ادمین با استفاده از [`sendFarazPattern()`](my-medusa-backend/src/utils/faraz-sender.ts:6)
  - **نکته**: اطلاعات تماس از `shipping_address` گرفته می‌شود (در نسخه ۲ مدوسا، `customer` در relations نیست)

### یوتیلیتی‌های SMS
- **Faraz SMS** ([`faraz-sender.ts`](my-medusa-backend/src/utils/faraz-sender.ts:1)):
  - API: `https://api2.ippanel.com/api/v1/sms/pattern/normal/send`
  - متغیرهای محیطی: `FARAZ_API_KEY`, `FARAZ_SENDER`
- **Melipayamak** ([`melipayamak-sender.ts`](my-medusa-backend/src/utils/melipayamak-sender.ts:1)):
  - API: `https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber`
  - متغیرهای محیطی: `SMS_USERNAME`, `SMS_PASSWORD`

### مدل‌های سفارشی
- **Review** ([`review.ts`](my-medusa-backend/src/models/review.ts:1)):
  | فیلد | نوع | توضیح |
  |------|-----|--------|
  | `id` | `varchar` (Primary) | شناسه با پیشوند `review_` |
  | `name` | `varchar` | نام نویسنده |
  | `role` | `varchar` | نقش نویسنده |
  | `content` | `text` | متن نظر |
  | `rating` | `int` | امتیاز (1-5) |
  | `image` | `varchar` (nullable) | آدرس تصویر |
  | `created_at` | `timestamp with time zone` | تاریخ ایجاد |
  | `updated_at` | `timestamp with time zone` | تاریخ آپدیت |

### API Routes سفارشی
- **Admin API** (`src/api/admin/`):
  - `blog/`, `blog-categories/`, `comments/`
  - `create-custom-product/`
  - `global-attributes/`
  - `product-resources/`, `product-reviews/`
  - `reviews/`
  - `setup-blog/`, `setup-blog-db/`, `setup-db/`
- **Store API** (`src/api/store/`):
  - `auth/`
  - `blog/`, `blog-categories/`
  - `carts/`
  - `custom-addresses/`, `custom-auth/`, `custom-checkout/`, `custom-orders/`
  - `product-reviews/`, `reviews/`
- **Zarinpal API** (`src/api/zarinpal/`):
  - `verify.ts`: تایید پرداخت زرینپال

### تنظیمات Region/Currency
- **Region**: در `medusa-config.ts` تنظیم نشده (پیشفرض: `default`)
- **Currency**: پشتیبانی از `IRR` (ریال) و تبدیل به تومان در پرداخت

## معماری فرانتاند

### ساختار App Router
- **Route Groups**:
  - `(admin)`: داشبورد ادمین (`/dashboard/*`)
  - `(store)`: استورفرانت (پیشفرض)
- **صفحات اصلی**:
  - `/`: صفحه اصلی
  - `/account/*`: صفحات کاربری (لاگین، ثبت‌نام، پروفایل)
  - `/admin/login`: لاگین ادمین
  - `/dashboard/*`: داشبورد ادمین
  - `/blog/*`: وبلاگ
  - `/checkout`: فرآیند پرداخت
  - `/collections/*`: دسته‌بندی‌ها
  - `/products/*`: محصولات
  - `/wishlist`: لیست علاقه‌مندی‌ها
  - `/order/*`: سفارشات
  - `/contact`, `/about`, `/faq`, `/privacy`, `/terms`: صفحات استاتیک

### تنظیمات Tailwind CSS
- **نسخه**: Tailwind CSS v4
- **PostCSS**: `@tailwindcss/postcss` (پلاگین اصلی)
- **پلاگین‌ها**:
  - `@tailwindcss/typography` v0.5.19 (برای استایل‌های تایپوگرافی)
  - `tw-animate-css` v1.4.0 (برای انیمیشن‌ها)
- **فایل تنظیمات**: [`postcss.config.mjs`](my-medusa-storefront/postcss.config.mjs:1)
- **فایل CSS اصلی**: [`globals.css`](my-medusa-storefront/src/app/globals.css:1)
- **shadcn/ui**:
  - تنظیمات: [`components.json`](my-medusa-storefront/components.json:1)
  - Style: `new-york`
  - Icon Library: `lucide`
  - Aliases: `components`, `utils`, `ui`, `lib`, `hooks`

### کامپوننت‌های UI
- **Radix UI**:
  - `@radix-ui/react-dialog`, `@radix-ui/react-label`
  - `@radix-ui/react-radio-group`, `@radix-ui/react-select`
  - `@radix-ui/react-separator`, `@radix-ui/react-slot`
  - `@radix-ui/react-tabs`, `@radix-ui/react-toggle`
- **Icon Libraries**:
  - `@heroicons/react` v2.2.0
  - `lucide-react` v0.561.0
- **انیمیشن**: `framer-motion` v12.23.26
- **اسلایدر**: `swiper` v12.0.3
- **نوتیفیکیشن**: `sonner` v2.0.7
- **فونت فارسی**: `@fontsource/vazirmatn` v5.2.8 + فونت محلی (`Vazirmatn-Regular.woff2`, `Vazirmatn-Bold.woff2`)

### State Management
- **React Query** (`@tanstack/react-query` v5.90.12):
  - برای fetch داده‌ها از API
  - تنظیمات: [`store.ts`](my-medusa-storefront/src/lib/store.ts:1)
  - شامل `useCartStore` با persist middleware (zustand)
- **Zustand** v5.0.9:
  - برای state جهانی (مثل سبد خرید)
  - استفاده از `persist` middleware برای ذخیره در localStorage

### الگوی داده‌خوانی
- **Server Components**: استفاده گسترده از Server Components برای fetch داده‌ها
- **Server Actions**:
  - برای عملیات CRUD ادمین: [`actions.ts`](my-medusa-storefront/src/app/(admin)/dashboard/categories/actions.ts:1)
  - برای احراز هویت: [`actions.ts`](my-medusa-storefront/src/app/account/login/actions.ts:1)
- **Caching Strategy**:
  - `cache: "no-store"` برای داده‌های دینامیک
  - `revalidatePath` برای refresh داده‌ها
- **Medusa Client**:
  - [`medusa-client.ts`](my-medusa-storefront/src/lib/medusa-client.ts:1): تنظیمات اصلی کلاینت
  - `formatPrice()`: تبدیل مبلغ از ریال به تومان

## احراز هویت

### جریان OTP احراز هویت مشتری
**فایل‌های اصلی**:
- [`page.tsx`](my-medusa-storefront/src/app/account/login/page.tsx:1): صفحه لاگین مشتری
- [`login-form.tsx`](my-medusa-storefront/src/app/account/login/login-form.tsx:1): فرم لاگین (Client Component)
- [`actions.ts`](my-medusa-storefront/src/app/account/login/actions.ts:1): Server Actions

**جریان کار**:
1. **مرحله ۱: دریافت شماره موبایل**
   - کاربر شماره موبایل را وارد می‌کند
   - ارسال `POST /store/auth/send-otp` با `{ phone }`
   - هدرها: `Content-Type: application/json`, `x-publishable-api-key`
   - در صورت موفقیت: رفتن به مرحله OTP

2. **مرحله ۲: دریافت کد OTP**
   - کاربر کد دریافتی را وارد می‌کند
   - ارسال `POST /store/auth/verify-otp` با `{ phone, code }`
   - در صورت موفقیت: دریافت `access_token`

3. **مرحله ۳: ذخیره توکن**
   - ذخیره `access_token` در کوکی `_medusa_jwt`
   - تنظیمات کوکی:
     - `httpOnly: true`
     - `secure: process.env.NODE_ENV === "production"`
     - `sameSite: "lax"`
     - `path: "/"`
     - `maxAge: 60 * 60 * 24 * 7` (7 روز)
   - ریدایرکت به `/account`

**توابع کلیدی**:
- `setOtpCookie(token)`: ذخیره توکن در کوکی
- `login(formData)`: لاگین با ایمیل/رمز (برای مشتریان معمولی)

---

### جریان لاگین ادمین
**فایل‌های اصلی**:
- [`page.tsx`](my-medusa-storefront/src/app/admin/login/page.tsx:1): صفحه لاگین ادمین
- [`action.ts`](my-medusa-storefront/src/app/admin/login/action.ts:1): Server Action

**جریان کار**:
1. کاربر ایمیل و رمز عبور را وارد می‌کند
2. ارسال `POST /auth/user/emailpass` به بکاند
3. دریافت `access_token` از پاسخ
4. ذخیره توکن در کوکی `_medusa_admin_token`
   - تنظیمات کوکی:
     - `httpOnly: true`
     - `secure: process.env.NODE_ENV === "production"`
     - `maxAge: 60 * 60 * 24 * 7` (7 روز)
     - `path: "/"`
5. ریدایرکت به `/dashboard`

**توابع کلیدی**:
- `loginAdminAction(prevState, formData)`: لاگین ادمین

---

### نگهداری سشن
- **کوکی مشتری**: `_medusa_jwt`
  - مدت اعتبار: 7 روز
  - استفاده برای: دسترسی به صفحات `/account`, `/checkout`, `/order/confirmed`
- **کوکی ادمین**: `_medusa_admin_token`
  - مدت اعتبار: 7 روز
  - استفاده برای: دسترسی به صفحات `/dashboard/*`

**نکته**: مدت اعتبار کوکی‌ها در بکاند (`medusa-config.ts`) روی 24 ساعت تنظیم شده، اما در فرانتاند روی 7 روز تنظیم شده است.

---

### محافظت مسیر (`middleware.ts`)
**فایل**: [`middleware.ts`](my-medusa-storefront/src/middleware.ts:1)

**مسیرهای محافظت‌شده**:
- **مشتری**: `/account`, `/checkout`, `/order/confirmed`
- **ادمین**: `/dashboard`

**منطق**:
1. **ادمین**:
   - اگر مسیر با `/dashboard` شروع شود و `_medusa_admin_token` وجود نداشته باشد → ریدایرکت به `/admin/login`
2. **مشتری**:
   - اگر مسیر با `/account`, `/checkout`, `/order/confirmed` شروع شود و `_medusa_jwt` وجود نداشته باشد → ریدایرکت به `/account/login`
   - اگر کاربر لاگین باشد و به `/account/login` یا `/account/register` برود → ریدایرکت به `/account`

**تنظیمات**:
```typescript
matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"]
```

---

### الگوی Server Action برای CRUD ادمین
**فایل اصلی**: [`actions.ts`](my-medusa-storefront/src/app/(admin)/dashboard/categories/actions.ts:1)

**توابع کلیدی**:
- `getAdminToken()`: دریافت توکن از کوکی `_medusa_admin_token`
  - اگر توکن وجود نداشته باشد → ریدایرکت به `/admin/login`
- `adminFetch(endpoint, options)`: fetch با توکن ادمین
  - اضافه کردن هدر `Authorization: Bearer ${token}`
  - `cache: "no-store"`
  - اگر `401` دریافت شود → ریدایرکت به `/admin/login`

## متغیرهای محیطی

### Backend (`my-medusa-backend/.env`)
| متغیر | توضیح | نوع | NEXT_PUBLIC |
|-------|--------|-----|-------------|
| `DATABASE_URL` | آدرس دیتابیس PostgreSQL | Connection String | ❌ |
| `REDIS_URL` | آدرس Redis | Connection String | ❌ |
| `JWT_SECRET` | کلید مخفی برای JWT | String | ❌ |
| `COOKIE_SECRET` | کلید مخفی برای کوکی‌ها | String | ❌ |
| `STORE_CORS` | لیست دامنه‌های مجاز برای Store API | CSV | ❌ |
| `ADMIN_CORS` | لیست دامنه‌های مجاز برای Admin API | CSV | ❌ |
| `AUTH_CORS` | لیست دامنه‌های مجاز برای Auth API | CSV | ❌ |
| `FILE_PROVIDER` | نوع provider ذخیره فایل (`local`, `s3`) | String | ❌ |
| `ZARINPAL_MERCHANT_ID` | شناسه مرچنت زرینپال | String | ❌ |
| `ADMIN_PHONE_NUMBER` | شماره موبایل ادمین برای پیامک‌ها | String | ❌ |
| `SMS_USERNAME` | نام کاربری سرویس پیامک (ملی‌پیامک) | String | ❌ |
| `SMS_PASSWORD` | رمز عبور سرویس پیامک (ملی‌پیامک) | String | ❌ |
| `SMS_PATTERN_OTP` | کد الگو برای پیامک OTP | String | ❌ |
| `SMS_PATTERN_ORDER_USER` | کد الگو برای پیامک سفارش به کاربر | String | ❌ |
| `SMS_PATTERN_ORDER_ADMIN` | کد الگو برای پیامک سفارش به ادمین | String | ❌ |
| `FARAZ_API_KEY` | کلید API سرویس فراز SMS | String | ❌ |
| `FARAZ_SENDER` | شماره فرستنده در فراز SMS | String | ❌ |

---

### Frontend (`my-medusa-storefront/.env`)
| متغیر | توضیح | نوع | NEXT_PUBLIC |
|-------|--------|-----|-------------|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | کلید عمومی مدوسا برای Store API | String | ✅ |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | آدرس بکاند مدوسا | URL | ✅ |
| `MEDUSA_BACKEND_URL` | آدرس بکاند مدوسا (برای Server Components) | URL | ❌ |

---

### متغیرهای Docker Compose
| متغیر | توضیح | استفاده در |
|-------|--------|-------------|
| `POSTGRES_USER` | نام کاربری PostgreSQL | Backend |
| `POSTGRES_PASSWORD` | رمز عبور PostgreSQL | Backend |
| `POSTGRES_DB` | نام دیتابیس PostgreSQL | Backend |
| `FRONTEND_URL` | آدرس فرانتاند | Backend, Caddy |
| `ADMIN_URL` | آدرس ادمین | Backend, Caddy |
| `BACKEND_URL` | آدرس بکاند | Backend, Frontend |

## دیپلوی و زیرساخت

### معماری Docker
- **Dockerfile Backend**: [`my-medusa-backend/Dockerfile`](my-medusa-backend/Dockerfile:1)
- **Dockerfile Frontend**: [`my-medusa-storefront/Dockerfile`](my-medusa-storefront/Dockerfile:1)
- **Docker Compose**: [`docker-compose.yml`](docker-compose.yml:1)

**سرویس‌ها**:
1. **PostgreSQL**: `postgres:15-alpine` (پورت 5432)
2. **Redis**: `redis:alpine` (پورت 6379)
3. **Backend**: `ghcr.io/hoseinmaddahi75/toolshouse/backend:latest` (پورت 9000)
4. **Frontend**: `ghcr.io/hoseinmaddahi75/toolshouse/frontend:latest` (پورت 3000)
5. **Caddy**: `caddy:alpine` (پورت 80, 443) - Reverse Proxy

### تنظیمات Caddy
**فایل**: [`Caddyfile`](Caddyfile:1)
- `toolshouse.ir` → `frontend:3000`
- `api.toolshouse.ir` → `backend:9000`

### GitHub Actions (CI/CD)
**فایل**: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml:1)

**جریان کار**:
1. **Trigger**: Push به branchهای `main` یا `master`
2. **Build & Push Images**:
   - ساخت و ارسال image فرانتاند به GHCR
   - ساخت و ارسال image بکاند به GHCR
3. **Deploy to Server**:
   - اتصال به سرور از طریق SSH
   - `docker compose pull`
   - `docker compose up -d --remove-orphans`
   - `docker system prune -f`

**متغیرهای Secret**:
- `SERVER_SSH_KEY`: کلید SSH سرور
- `SERVER_HOST`: آدرس سرور
- `SERVER_USER`: کاربر سرور
- `SERVER_PORT`: پورت SSH

### سرور هدف
- **سیستم‌عامل**: Ubuntu
- **Docker**: نصب شده
- **Docker Compose**: نصب شده
- **دامنه‌ها**: `toolshouse.ir`, `api.toolshouse.ir`

## نکات و مشکلات شناختهشده (Gotchas)

1. **Medusa v2 Admin API و متدهای HTTP**:
   در Medusa v2 Admin API، آپدیت entityها (مثل دسته‌بندی، محصول، و احتمالاً سایر entityها) با متد **`POST`** انجام می‌شود، نه `PUT` — برخلاف کانوانسیون معمول REST. استفاده از PUT باعث خطای ۴۰۴ (نه ۴۰۵) می‌شود.
   
   **مثال**:
   ```typescript
   // ✅ درست
   POST /admin/products/{id}
   
   // ❌ غلط (خطای 404)
   PUT /admin/products/{id}
   ```

2. **مدت اعتبار کوکی‌ها**:
   - در بکاند (`medusa-config.ts`): کوکی‌ها روی 24 ساعت تنظیم شده‌اند
   - در فرانتاند: کوکی‌ها روی 7 روز تنظیم شده‌اند
   - این تفاوت می‌تواند باعث رفتار غیرمنتظره در سشن‌ها شود

3. **اطلاعات تماس در Medusa v2**:
   در نسخه ۲ مدوسا، اطلاعات تماس مشتری در `shipping_address` موجود است، نه در `customer`. در subscriberها باید از `shipping_address` برای دسترسی به شماره موبایل استفاده کرد.

4. **پرداخت زرینپال**:
   - مبلغ باید از ریال به تومان تبدیل شود (`amount / 10`)
   - `currency` باید `IRT` باشد (تومان)
   - آدرس callback باید کامل باشد (مثال: `https://api.toolshouse.ir/zarinpal/verify`)

5. **مایگریشنهای TypeORM**:
   مایگریشنهای TypeORM موجود در پوشه [`my-medusa-backend/src/migrations/`](my-medusa-backend/src/migrations/) توسط دستور `npx medusa db:migrate` اجرا **نمی‌شوند**. این مایگریشنها مربوط به نسخه قدیمی TypeORM هستند و سیستم مایگریشن Medusa v2 بر پایه MikroORM کار می‌کند. برای اجرا باید به صورت دستی با TypeORM CLI اجرا شوند.

6. **ماژول بلاگ**:
   در حال حاضر دو پیاده‌سازی برای بلاگ وجود دارد:
   - پیاده‌سازی **inline** در خود پروژه (`my-medusa-backend/src/api/admin/blog/`, `my-medusa-backend/src/lib/blog-service.ts`)
   - ماژول **جداگانه** در [`/media/hosein/personal1/programing/js/medusa-blog-extention/medusa-plugin-blog/`](media/hosein/personal1/programing/js/medusa-blog-extention/medusa-plugin-blog/)
   
   ماژول جداگانه رها شده و پیاده‌سازی inline فعال است. برای جلوگیری از ابهام، باید یکی را انتخاب و دیگری را حذف کرد.

7. **سیستم نظرات (Reviews)**:
   دو سیستم کاملا جداگانه برای نظرات وجود دارد:
   - **جدول `review` در PostgreSQL**: توسط [`ReviewService`](my-medusa-backend/src/services/review.ts:1) و مایگریشن [`1765876851688-ReviewCreate.ts`](my-medusa-backend/src/migrations/1765876851688-ReviewCreate.ts:1) مدیریت می‌شود
   - **فایل JSON `product-reviews.json`**: در [`my-medusa-backend/.data/product-reviews.json`](my-medusa-backend/.data/product-reviews.json:1) ذخیره می‌شود و توسط APIهای [`/api/store/product-reviews/`](my-medusa-backend/src/api/store/product-reviews/route.ts:1) و [`/api/admin/product-reviews/`](my-medusa-backend/src/api/admin/product-reviews/route.ts:1) مدیریت می‌شود
   
   این دو سیستم هیچ ارتباطی با هم ندارند و باید با هم همگام‌سازی یا یکی حذف شوند.

8. **فایل `product-reviews.json`**:
   فایل [`my-medusa-backend/.data/product-reviews.json`](my-medusa-backend/.data/product-reviews.json:1) در Docker container ایجاد می‌شود و با restart container پاک می‌شود. برای حفظ داده‌ها باید در `docker-compose.yml` به عنوان volume mount شود:
   ```yaml
   volumes:
     - ./my-medusa-backend/.data:/app/.data
   ```

9. **راه‌اندازی اولیه دیتابیس**:
   در دیتابیس خالی، جدولهای بلاگ (`blog_posts`, `blog_categories`, `blog_comments`) به صورت خودکار ایجاد **نمی‌شوند**. باید از APIهای [`/admin/setup-blog`](my-medusa-backend/src/api/admin/setup-blog/route.ts:1) و [`/admin/setup-blog-db`](my-medusa-backend/src/api/admin/setup-blog-db/route.ts:1) برای ایجاد اولیه استفاده کرد.

## چکلیست دیپلوی روی سرور جدید

### قبل از دیپلوی
- [ ] فایلهای `.env` را برای بکاند و فرانتاند با مقادیر مناسب پر کنید
- [ ] دامنهها را در `Caddyfile` و `docker-compose.yml` تنظیم کنید
- [ ] درگاه پرداخت (زرینپال) و سرویس پیامک را تنظیم کنید
- [ ] اطلاعات برندینگ (نام، لوگو، رنگها) را در فرانتاند اعمال کنید
- [ ] محصولات و دستهبندیها را وارد کنید
- [ ] فایل `product-reviews.json` را از سرور قدیمی کپی کنید (اگر وجود دارد)

### دیپلوی
- [ ] `docker compose down` روی سرور قدیمی (اگر وجود دارد)
- [ ] کدها را به سرور جدید منتقل کنید
- [ ] `docker compose pull` برای دریافت آخرین images
- [ ] `docker compose up -d --remove-orphans` برای راه‌اندازی
- [ ] `docker system prune -f` برای پاکسازی

### بعد از دیپلوی
- [ ] بررسی کنید تمام سرویسها (`backend`, `frontend`, `postgres`, `redis`, `caddy`) در حال اجرا هستند
- [ ] تست کنید API بکاند پاسخ می‌دهد
- [ ] تست کنید فرانتاند به درستی لود می‌شود
- [ ] تست کنید پرداختها کار می‌کنند
- [ ] تست کنید پیامکها ارسال می‌شوند
- [ ] بررسی کنید فایل `product-reviews.json` در volume mount شده حفظ شده است

## نکات کسبوکاری و هدف پروژه

### هدف اصلی پروژه
این پروژه با هدف تبدیل شدن به یک **تمپلیت قابل تکرار** برای مشتریان فریلنس توسعه داده شده است. هدف این است که بتوان با حداقل تغییرات، پروژه را برای مشتریان جدید راه‌اندازی کرد.

### مواردی که باید Config-Pذیر باشند
برای تبدیل به تمپلیت، موارد زیر باید به راحتی قابل تنظیم باشند:

1. **برندینگ و اطلاعات سایت**:
   - نام سایت
   - لوگو و فاویکن
   - رنگ‌های اصلی (Tailwind config)
   - فونت‌ها

2. **اتصالات خارجی**:
   - درگاه پرداخت (زرینپال، سایر درگاه‌ها)
   - سرویس‌های پیامک (فراز، ملی‌پیامک)
   - API Keyها و توکن‌ها

3. **دامنه‌ها و آدرس‌ها**:
   - آدرس فرانتاند
   - آدرس بکاند
   - CORS settings

4. **دیتابیس و Redis**:
   - Connection strings
   - تنظیمات اتصال

5. **محصولات و دسته‌بندی‌ها**:
   - امکان وارد کردن محصولات از WooCommerce
   - مدیریت دسته‌بندی‌ها

### ویژگی‌های کلیدی برای فریلنسری
- **پشتیبانی از فارسی**: فونت‌ها، RTL، قالب‌های فارسی
- **پرداخت ایرانی**: زرینپال و سایر درگاه‌های ایرانی
- **پیامک ایرانی**: فراز و ملی‌پیامک
- **داشبورد ادمین کامل**: مدیریت محصولات، سفارشات، مشتریان
- **OTP برای مشتریان**: احراز هویت با شماره موبایل
- **Dockerized**: آماده دیپلوی با Docker
- **CI/CD**: GitHub Actions برای دیپلوی خودکار

### ساختار تمپلیت
```
project-template/
├── my-medusa-backend/    # بکاند مدوسا
├── my-medusa-storefront/ # فرانتاند Next.js
├── docker-compose.yml    # تنظیمات Docker
├── Caddyfile            # تنظیمات Reverse Proxy
└── .github/workflows/   # GitHub Actions
```

### نکات برای مشتریان جدید
1. فایل‌های `.env` را با مقادیر جدید پر کنید
2. دامنه‌ها را در `Caddyfile` و `docker-compose.yml` تنظیم کنید
3. درگاه پرداخت و سرویس پیامک را تنظیم کنید
4. اطلاعات برندینگ را در فرانتاند اعمال کنید
5. محصولات و دسته‌بندی‌ها را وارد کنید