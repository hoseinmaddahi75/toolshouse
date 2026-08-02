import { Metadata } from "next"
import {
  FileText,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  UserCheck,
  Lock,
  AlertCircle,
  HelpCircle,
} from "lucide-react"

export const metadata: Metadata = {
  title: "قوانین و مقررات | خانه ابزار",
  description: "شرایط، ضوابط و قوانین استفاده از خدمات و خرید از فروشگاه اینترنتی خانه ابزار.",
}

export default function TermsPage() {
  return (
    <div className="bg-background min-h-screen dir-rtl text-foreground font-sans pb-16">
      
      {/* 1. Header / Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-16 px-4 text-center overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-black/10 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-background/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-2 text-primary-foreground">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            قوانین و مقررات خانه ابزار
          </h1>
          <p className="text-primary-foreground/90 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            لطفاً قبل از ثبت سفارش و استفاده از خدمات خانه ابزار، این قوانین را با دقت مطالعه فرمایید.
          </p>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20 space-y-8">
        
        {/* مقدمه / هشدار اولیه */}
        <div className="bg-card text-card-foreground p-6 md:p-8 rounded-2xl border border-border shadow-lg space-y-3">
          <div className="flex items-center space-x-3 space-x-reverse text-primary">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <h2 className="text-lg font-bold">پذیرش قوانین</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            ورود کاربران به وب‌سایت <strong>خانه ابزار</strong> و ثبت سفارش در هر زمان به معنی پذیرفتن کامل کلیه شرایط و قوانین زیر از سوی کاربر است. کلیه اصول و روال‌های خانه ابزار منطبق با قوانین جمهوری اسلامی ایران، قانون تجارت الکترونیک و قانون حمایت از حقوق مصرف‌کننده است.
          </p>
        </div>

        {/* بند ۱: تعاریف و شرایط عمومی */}
        <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse border-b border-border pb-4">
            <div className="p-2.5 bg-primary/15 text-primary rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">۱. حساب کاربری و مسئولیت‌ها</h2>
          </div>
          <ul className="space-y-3 text-muted-foreground text-sm leading-relaxed list-disc list-inside pr-2">
            <li>کاربران موظفند هنگام ثبت‌نام و ثبت سفارش، اطلاعات دقیق و واقعی خود (شامل نام، شماره تماس و آدرس دقیق) را وارد نمایند.</li>
            <li>مسئولیت حفظ محرمانه بودن اطلاعات حساب کاربری و رمز عبور بر عهده خود کاربر می‌باشد.</li>
            <li>هرگونه فعالیت که با نام کاربری صورت گیرد، متوجه صاحب حساب خواهد بود.</li>
          </ul>
        </div>

        {/* بند ۲: ثبت، پردازش و ارسال سفارش */}
        <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse border-b border-border pb-4">
            <div className="p-2.5 bg-primary/15 text-primary rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">۲. ثبت، پردازش و ارسال کالا</h2>
          </div>
          <ul className="space-y-3 text-muted-foreground text-sm leading-relaxed list-disc list-inside pr-2">
            <li>ثبت سفارش در خانه ابزار در ۲۴ ساعت شبانه‌روز امکان‌پذیر است. پردازش سفارش‌ها در روزهای کاری (شنبه تا پنج‌شنبه به استثنای تعطیلات رسمی) انجام می‌شود.</li>
            <li>در صورت بروز مشکل در پردازش نهایی سبد خرید (مانند اتمام موجودی کالا یا تغییر قیمت)، مبلغ پرداختی طی ۲۴ الی ۴۸ ساعت کاری به حساب خریدار واریز خواهد شد.</li>
            <li>تحویل سفارش در آدرس اعلام‌شده انجام می‌شود و خریدار موظف است هنگام تحویل کالا، کارت شناسایی معتبر ارائه نماید.</li>
            <li>هزینه ارسال کالا بر اساس وزن، حجم و مقصد براساس تعرفه‌های پست یا پیک محاسبه شده و پیش از پرداخت نهایی به اطلاع مشتری می‌رسد.</li>
          </ul>
        </div>

        {/* بند ۳: قیمت‌گذاری و پرداخت */}
        <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse border-b border-border pb-4">
            <div className="p-2.5 bg-primary/15 text-primary rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">۳. قیمت‌گذاری و پرداخت</h2>
          </div>
          <ul className="space-y-3 text-muted-foreground text-sm leading-relaxed list-disc list-inside pr-2">
            <li>قیمت‌گذاری محصولات بر اساس اصول مشتری‌مداری و به روز رسانی دقیق انجام می‌پذیرد.</li>
            <li>پرداخت وجه سفارش صرفاً از طریق درگاه‌های رسمی شتاب موجود در وب‌سایت صورت می‌گیرد.</li>
            <li>تمام قیمت‌های درج‌شده روی کالاها شامل فاکتور رسمی فروشگاه خانه ابزار می‌باشد.</li>
          </ul>
        </div>

        {/* بند ۴: شرایط ۷ روز ضمانت بازگشت کالا */}
        <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse border-b border-border pb-4">
            <div className="p-2.5 bg-primary/15 text-primary rounded-xl">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">۴. شرایط بازگشت و تعویض کالا (۷ روز مهلت تست)</h2>
          </div>
          <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
            <p>
              خانه ابزار جهت جلب رضایت مشتریان، امکان بازگشت کالا تا <strong>۷ روز پس از تحویل</strong> را با شرایط زیر فراهم نموده است:
            </p>
            <ul className="space-y-2 list-disc list-inside pr-2">
              <li><strong>مغایرت کالا:</strong> در صورت وجود مغایرت در مشخصات یا ظاهر فیزیکی کالا، باید حداکثر ظرف ۲۴ ساعت پس از تحویل به پشتیبانی اطلاع داده شود.</li>
              <li><strong>ایراد فنی:</strong> ابزارآلات برقی یا شارژی در صورت داشتن اشکال فنی باید ظرف ۷ روز جهت بررسی به بخش پشتیبانی ارسال شوند.</li>
              <li><strong>شرایط بسته‌بندی:</strong> بازگرداندن کالا تنها در صورتی امکان‌پذیر است که کالا در پلمپ اصلی، بدون آسیب به جعبه و بدون استفاده فیزیکی باشد.</li>
              <li>انصراف از خرید بدون ایراد کالا، تنها در صورتی پذیرفته می‌شود که پلمپ کالا باز نشده باشد و هزینه بازگشت کالا بر عهده خریدار خواهد بود.</li>
            </ul>
          </div>
        </div>

        {/* بند ۵: اصالت کالا و گارانتی */}
        <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse border-b border-border pb-4">
            <div className="p-2.5 bg-primary/15 text-primary rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">۵. اصالت کالا و گارانتی شرکتی</h2>
          </div>
          <ul className="space-y-3 text-muted-foreground text-sm leading-relaxed list-disc list-inside pr-2">
            <li>خانه ابزار اصالت تمام کالاهای عرضه شده را تضمین می‌نماید.</li>
            <li>کالاهایی که دارای گارانتی شرکتی (مانند رونیکس، توسن، ماکیتا و ...) هستند، خدمات پس از فروش آن‌ها مستقیماً توسط شرکت گارانتی‌کننده ارائه می‌شود و خانه ابزار در ارائه خدمات گارانتی نقش واسط ندارد.</li>
          </ul>
        </div>

        {/* بند ۶: حریم خصوصی */}
        <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse border-b border-border pb-4">
            <div className="p-2.5 bg-primary/15 text-primary rounded-xl">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">۶. حریم خصوصی کاربران</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            خانه ابزار برای اطلاعات شخصی کاربران ارزش قائل شده و متعهد می‌شود که از حریم خصوصی شما صیانت کند. تمامی اطلاعات دریافتی از کاربران مجرمانه یا در اختیار هیچ سازمان و شخص ثالثی قرار نخواهد گرفت و تنها برای ارائه‌ خدمات بهتر و ارسال سفارش‌ها استفاده می‌شود.
          </p>
        </div>

        {/* باکس پشتیبانی و پاسخگویی */}
        <div className="bg-primary/10 border border-primary/20 p-6 md:p-8 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">سوال یا ابهامی در مورد قوانین دارید؟</h3>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            تیم پشتیبانی خانه ابزار در ساعات کاری آماده پاسخگویی به سوالات و ابهامات شما عزیزان در خصوص قوانین و سفارش‌ها می‌باشد.
          </p>
        </div>

      </div>

    </div>
  )
}