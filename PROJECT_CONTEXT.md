# PROJECT_CONTEXT.md

## وضعیت پیشرفت

- [x] فاز 1: راه‌اندازی اولیه پروژه Medusa v2
- [x] فاز 2: پیاده‌سازی فرانت‌اند Next.js
- [x] فاز 3: یکپارچه‌سازی پرداخت زرینپال
- [x] فاز 4: سیستم احراز هویت (OTP)
- [x] فاز 5: تست و دیپلوی (رسیدن به نسخه پایدار v1.0.0)
- [ ] فاز 6: توسعه فیچرهای جدید (Workflow محلی)

## معرفی پروژه

این پروژه یک پلتفرم تجارت الکترونیک کامل بر پایه Medusa v2 (فریمورک Node.js) و Next.js (فریمورک React) است.

### Backend (`my-medusa-backend`)
- **فریمورک**: Medusa v2
- **بانک اطلاعاتی**: PostgreSQL 15
- **Cache**: Redis
- **پورت**: 9000
- **ویژگی‌ها**:
  - مدیریت محصولات، سفارشات، مشتریان
  - درگاه پرداخت زرینپال
  - سیستم احراز هویت با OTP
  - API RESTful برای فرانت‌اند
  - ماژول‌های سفارشی (بلاگ، نظرات)

### Frontend (`my-medusa-storefront`)
- **فریمورک**: Next.js 14 (App Router)
- **CSS**: Tailwind CSS v3
- **State Management**: React Context + Server Actions
- **پورت**: 3000
- **ویژگی‌ها**:
  - نمایش محصولات و دسته‌بندی‌ها
  - سبد خرید و پرداخت
  - پنل کاربری
  - صفحات استاتیک (About, Contact, etc.)

### Backend (`my-medusa-backend/`)
- **فریمورک**: Medusa v2 با TypeScript
- **بانک اطلاعاتی**: PostgreSQL 15 (با TypeORM برای مایگریشن‌های قدیمی)
- **Cache**: Redis
- **Authentication**: JWT-based با OTP
- **Payment**: زرینپال
- **SMS**: فراز و ملیپیامک

### Frontend (`my-medusa-storefront/`)
- **فریمورک**: Next.js 14 با App Router
- **Styling**: Tailwind CSS v3
- **State Management**: React Context + Server Actions
- **RTL Support**: کامل برای فارسی
- **Responsive Design**: Mobile-first

### تنظیمات اصلی ([`medusa-config.ts`](my-medusa-backend/medusa-config.ts:1))
- **Database**: PostgreSQL connection configuration
- **Redis**: Cache and session storage
- **CORS**: Configured for frontend and admin domains
- **JWT**: Secret and expiration settings
- **Storage**: Local file system for uploads

### ماژولها
- **Zarinpal**: درگاه پرداخت ایرانی
- **Blog**: سیستم مدیریت بلاگ (پیاده‌سازی inline)
- **Reviews**: سیستم مدیریت نظرات (دو سیستم جداگانه)

### ماژول سفارشی Zarinpal (`src/modules/zarinpal/`)
- پیاده‌سازی درگاه پرداخت زرینپال
- تبدیل مبلغ از ریال به تومان
- مدیریت callback و verification

### Subscribers
- **Order Placed**: ارسال پیامک تایید سفارش
- **Payment Completed**: ارسال پیامک تایید پرداخت
- **Customer Created**: ارسال پیامک خوش‌آمدگویی

### یوتیلیتیهای SMS
- **FarazSMS**: ارسال پیامک از طریق API فراز
- **Melipayamak**: ارسال پیامک از طریق API ملیپیامک
- **OTP Generation**: تولید کد یکبار مصرف 6 رقمی

### مدلهای سفارشی
- **Review**: مدل نظرات برای محصولات ([`src/models/review.ts`](my-medusa-backend/src/models/review.ts:11))
- **BlogPost, BlogCategory, BlogComment**: مدلهای بلاگ

### API Routes سفارشی
- **Admin**: مدیریت محصولات، سفارشات، مشتریان
- **Store**: دسترسی عمومی به محصولات، دسته‌بندی‌ها
- **Custom**: APIهای سفارشی برای OTP، پرداخت، و غیره

### تنظیمات Region/Currency
- **Currency**: IRR (ریال)
- **Country**: IR (ایران)
- **Language**: fa (فارسی)

### ساختار App Router
```
app/
├── (admin)/          # صفحات ادمین
│   ├── dashboard/    # داشبورد
│   ├── products/     # مدیریت محصولات
│   ├── orders/       # مدیریت سفارشات
│   └── customers/    # مدیریت مشتریان
├── (store)/          # صفحات فروشگاه
│   ├── products/     # لیست محصولات
│   ├── categories/   # دسته‌بندی‌ها
│   └── cart/         # سبد خرید
├── account/          # حساب کاربری
│   ├── login/        # ورود
│   ├── register/     # ثبت‌نام
│   └── profile/      # پروفایل
└── blog/             # بلاگ
    ├── [slug]/      # پست‌های بلاگ
    └── categories/   # دسته‌بندی‌های بلاگ
```

### تنظیمات Tailwind CSS
- **Config**: [`tailwind.config.ts`](my-medusa-storefront/tailwind.config.ts:1)
- **Colors**: رنگ‌های اصلی سایت
- **Fonts**: فونت Vazirmatn برای فارسی
- **RTL**: پشتیبانی کامل از راست‌به‌چپ

### کامپوننتهای UI
- **Shared**: کامپوننت‌های قابل استفاده مجدد
- **Product**: کامپوننت‌های مربوط به محصولات
- **Cart**: کامپوننت‌های سبد خرید
- **Auth**: کامپوننت‌های احراز هویت

### State Management
- **React Context**: برای stateهای جهانی
- **Server Actions**: برای عملیات CRUD در سرور
- **Local Storage**: برای ذخیره سبد خرید

### الگوی داده‌خوانی
```typescript
// در فایل data.ts
interface Product {
  id: string
  title: string
  price: number
  // ...
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${process.env.BACKEND_URL}/store/products`)
  return res.json()
}
```

### جریان OTP احراز هویت مشتری
1. کاربر شماره موبایل را وارد می‌کند
2. سرور کد OTP تولید و به شماره موبایل ارسال می‌کند
3. کاربر کد OTP را وارد می‌کند
4. سرور کد را بررسی و در صورت صحیح بودن، توکن JWT ایجاد می‌کند
5. توکن در کوکی ذخیره می‌شود

### جریان لاگین ادمین
1. ادمین ایمیل و پسورد را وارد می‌کند
2. سرور اطلاعات را بررسی می‌کند
3. در صورت صحیح بودن، توکن JWT ایجاد می‌شود
4. توکن در کوکی ذخیره می‌شود

### نگهداری سشن
- **JWT**: توکن‌های JWT برای احراز هویت
- **Cookie**: ذخیره توکن در کوکی با مدت اعتبار 7 روز (فرانت‌اند) / 24 ساعت (بک‌اند)
- **Redis**: ذخیره سشن‌ها برای مدیریت state

### محافظت مسیر (`middleware.ts`)
- **Public Routes**: قابل دسترسی بدون احراز هویت
- **Protected Routes**: نیاز به احراز هویت
- **Admin Routes**: نیاز به نقش ادمین

### الگوی Server Action برای CRUD ادمین
```typescript
// در فایل actions.ts
'use server'

export async function createProduct(data: ProductData) {
  const res = await fetch(`${process.env.BACKEND_URL}/admin/products`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  })
  return res.json()
}
```

### Backend (`my-medusa-backend/.env`)
```env
DATABASE_URL=postgres://user:pass@postgres:5432/medusa_db
REDIS_URL=redis://redis:6379
JWT_SECRET=your_jwt_secret
BACKEND_URL=https://api.toolshouse.ir
FRONTEND_URL=https://toolshouse.ir
ADMIN_URL=https://admin.toolshouse.ir
ZARINPAL_MERCHANT_ID=your_merchant_id
FARAZ_SMS_USER=your_faraz_user
FARAZ_SMS_PASS=your_faraz_pass
MELIPAYAMAK_USER=your_melipayamak_user
MELIPAYAMAK_PASS=your_melipayamak_pass
FRONTEND_URL=https://toolshouse.ir
ADMIN_CORS=https://toolshouse.ir,http://localhost:3000
STORE_CORS=https://toolshouse.ir,http://localhost:3000
AUTH_CORS=https://toolshouse.ir,http://localhost:3000
```

### Frontend (`my-medusa-storefront/.env`)
**برای سرور (پروداکشن - تنظیم در GitHub Actions):**
```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=[https://api.toolshouse.ir](https://api.toolshouse.ir)
NEXT_PUBLIC_BASE_URL=[https://toolshouse.ir](https://toolshouse.ir)

## برای محیط لوکال

NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

### متغیرهای Docker Compose
| متغیر | توضیح | استفاده در |
|--------|---------|------------|
| `POSTGRES_USER` | کاربر PostgreSQL | Backend |
| `POSTGRES_PASSWORD` | رمز عبور PostgreSQL | Backend |
| `POSTGRES_DB` | نام دیتابیس PostgreSQL | Backend |
| `FRONTEND_URL` | آدرس فرانت‌اند | Backend, Caddy |
| `ADMIN_URL` | آدرس ادمین | Backend, Caddy |
| `BACKEND_URL` | آدرس بک‌اند | Backend, Frontend |

## دیپلوی و زیرساخت

### معماری Docker
- **Dockerfile Backend**: [`my-medusa-backend/Dockerfile`](my-medusa-backend/Dockerfile:1)
- **Dockerfile Frontend**: [`my-medusa-storefront/Dockerfile`](my-medusa-storefront/Dockerfile:1)
- **Docker Compose**: [`docker-compose.yml`](docker-compose.yml:1)

**سرویسها**:
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
   - ساخت و ارسال image فرانت‌اند به GHCR
   - ساخت و ارسال image بک‌اند به GHCR
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
- **سیستمعامل**: Ubuntu
- **Docker**: نصب شده
- **Docker Compose**: نصب شده
- **دامنه‌ها**: `toolshouse.ir`, `api.toolshouse.ir`

## نکات و مشکلات شناختهشده (Gotchas)

1. **Medusa v2 Admin API و متدهای HTTP**:
   در Medusa v2 Admin API، آپدیت entityها (مثل دستهبندی، محصول، و احتمالاً سایر entityها) با متد **`POST`** انجام میشود، نه `PUT` — برخلاف کانوانسیون معمول REST. استفاده از PUT باعث خطای ۴۰۴ (نه ۴۰۵) میشود.
   
   **مثال**:
   ```typescript
   // ✅ درست
   POST /admin/products/{id}
    
   // ❌ غلط (خطای 404)
   PUT /admin/products/{id}
   ```

2. **مدت اعتبار کوکیها**:
   - در بک‌اند (`medusa-config.ts`): کوکیها روی 24 ساعت تنظیم شده‌اند
   - در فرانت‌اند: کوکیها روی 7 روز تنظیم شده‌اند
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

11. **احراز هویت ادمین در داشبورد کاستوم (CORS & Credentials):**
    برای ارسال درخواست‌های `fetch` از داشبورد اختصاصی فرانت‌اند به مسیرهای `/admin/...` در بک‌اند، حتماً باید `credentials: "include"` در تنظیمات fetch قرار داده شود. در غیر این صورت، کوکی `_medusa_admin_token` ارسال نشده و با خطای 401/403 مواجه می‌شوید.

12. **ریدارکت‌های درگاه پرداخت (Hardcoded URLs):**
    در پیاده‌سازی APIهای بازگشتی (Callback) مانند زرین‌پال، هرگز از آدرس‌های هاردکد شده مثل `http://localhost:3000` برای `res.redirect` استفاده نکنید. همیشه از متغیر `process.env.FRONTEND_URL` استفاده کنید تا در محیط پروداکشن مشتری به درستی به سایت اصلی بازگردد. همچنین در درگاه‌های تستی (Mock) از آدرس‌های نسبی (Relative) استفاده شود.

13. **چرخه توسعه و GitHub Actions (The CI/CD Trap):**
    بیلد شدن داکر در GitHub Actions حدود ۲۰ دقیقه زمان می‌برد. برای توسعه و تست تغییرات ظاهری یا فیچرهای جدید، نباید با هر تغییر کد را Push کرد. توسعه باید کاملاً روی سیستم Local (با `npm run dev` و `.env.local`) انجام شود و Push به شاخه `main` فقط برای دیپلوی نهایی و پایدار (Production) صورت گیرد.


## چکلیست دیپلوی روی سرور جدید

### قبل از دیپلوی
- [ ] فایلهای `.env` را برای بک‌اند و فرانت‌اند با مقادیر مناسب پر کنید
- [ ] دامنه‌ها را در `Caddyfile` و `docker-compose.yml` تنظیم کنید
- [ ] درگاه پرداخت (زرینپال) و سرویس پیامک را تنظیم کنید
- [ ] اطلاعات برندینگ (نام، لوگو، رنگها) را در فرانت‌اند اعمال کنید
- [ ] محصولات و دستهبندی‌ها را وارد کنید
- [ ] فایل `product-reviews.json` را از سرور قدیمی کپی کنید (اگر وجود دارد)
- [ ] جایگزینی Merchant ID تستی با Merchant ID واقعی مشتری
- [ ] ساخت اکانت ادمین اصلی برای مشتری و حذف/تغییر رمز اکانت‌های تستی (پیش‌فرض مدوسا)
- [ ] راه‌اندازی و تست سیستم ارسال ایمیل (SMTP) برای فاکتورها

### دیپلوی
- [ ] `docker compose down` روی سرور قدیمی (اگر وجود دارد)
- [ ] کدها را به سرور جدید منتقل کنید
- [ ] `docker compose pull` برای دریافت آخرین images
- [ ] `docker compose up -d --remove-orphans` برای راه‌اندازی
- [ ] `docker system prune -f` برای پاکسازی

### بعد از دیپلوی
- [ ] بررسی کنید تمام سرویسها (`backend`, `frontend`, `postgres`, `redis`, `caddy`) در حال اجرا هستند
- [ ] تست کنید API بک‌اند پاسخ می‌دهد
- [ ] تست کنید فرانت‌اند به درستی لود می‌شود
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
   - رنگهای اصلی (Tailwind config)
   - فونتها

2. **اتصالات خارجی**:
   - درگاه پرداخت (زرینپال، سایر درگاهها)
   - سرویسهای پیامک (فراز، ملیپیامک)
   - API Keyها و توکنها

3. **دامنه‌ها و آدرسها**:
   - آدرس فرانت‌اند
   - آدرس بک‌اند
   - CORS settings

4. **دیتابیس و Redis**:
   - Connection strings
   - تنظیمات اتصال

5. **محصولات و دستهبندیها**:
   - امکان وارد کردن محصولات از WooCommerce
   - مدیریت دستهبندیها

### ویژگیهای کلیدی برای فریلنسری
- **پشتیبانی از فارسی**: فونتها، RTL، قالبهای فارسی
- **پرداخت ایرانی**: زرینپال و سایر درگاههای ایرانی
- **پیامک ایرانی**: فراز و ملیپیامک
- **داشبورد ادمین کامل**: مدیریت محصولات، سفارشات، مشتریان
- **OTP برای مشتریان**: احراز هویت با شماره موبایل
- **Dockerized**: آماده دیپلوی با Docker
- **CI/CD**: GitHub Actions برای دیپلوی خودکار

### ساختار تمپلیت
```
project-template/
├── my-medusa-backend/    # بک‌اند مدوسا
├── my-medusa-storefront/ # فرانت‌اند Next.js
├── docker-compose.yml    # تنظیمات Docker
├── Caddyfile            # تنظیمات Reverse Proxy
└── .github/workflows/   # GitHub Actions
```

### نکات برای مشتریان جدید
1. فایلهای `.env` را با مقادیر جدید پر کنید
2. دامنه‌ها را در `Caddyfile` و `docker-compose.yml` تنظیم کنید
3. درگاه پرداخت و سرویس پیامک را تنظیم کنید
4. اطلاعات برندینگ را در فرانت‌اند اعمال کنید
5. محصولات و دستهبندی‌ها را وارد کنید
6. پوشه‌های `./data/backend-static` و `./data/backend` را برای حفظ تصاویر آپلودی و فایل‌های پایدار ایجاد کنید

### گچا 10: پوشه `static` بدون volume mapping
پوشه [`my-medusa-backend/static/`](my-medusa-backend/static/) که محل ذخیره تصاویر آپلودی است، در `docker-compose.yml` **volume mapping** نداشته و با هر deploy جدید، تمام تصاویر پاک می‌شوند. برای حفظ تصاویر باید در `docker-compose.yml` زیر سرویس `backend` اضافه شود:
```yaml
volumes:
  - ./data/backend-static:/app/static
