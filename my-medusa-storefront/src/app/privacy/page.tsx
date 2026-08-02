import { Metadata } from "next"
import {
  Shield,
  Eye,
  Database,
  Lock,
  Cookie,
  UserCog,
  AlertCircle
} from "lucide-react"

export const metadata: Metadata = {
  title: "حریم خصوصی | خانه ابزار",
  description: "سیاست‌های حفظ حریم خصوصی و امنیت اطلاعات کاربران در فروشگاه اینترنتی خانه ابزار.",
}

export default function PrivacyPage() {
  return (
    <div className="bg-background min-h-screen dir-rtl text-foreground font-sans pb-16">
      
      {/* 1. Header / Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-16 px-4 text-center overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-black/10 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-background/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-2 text-primary-foreground">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            سیاست حفظ حریم خصوصی
          </h1>
          <p className="text-primary-foreground/90 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            حفاظت از اطلاعات شخصی شما، اولویت و تعهد اصلی ما در خانه ابزار است.
          </p>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20 space-y-8">
        
        {/* مقدمه */}
        <div className="bg-card text-card-foreground p-6 md:p-8 rounded-2xl border border-border shadow-lg space-y-3">
          <div className="flex items-center space-x-3 space-x-reverse text-primary">
            <Eye className="w-6 h-6 flex-shrink-0" />
            <h2 className="text-lg font-bold">تعهد ما به شما</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            فروشگاه اینترنتی <strong>خانه ابزار</strong> به اطلاعات خصوصی اشخاصی که از خدمات سایت استفاده می‌کنند، احترام گذاشته و از آن محافظت می‌کند. ما متعهد می‌شویم در حد توان از حریم شخصی شما دفاع کنیم و در این راستا، تکنولوژی مورد نیاز برای هرچه مطمئن‌تر و امن‌تر شدن استفاده شما از سایت را توسعه دهیم.
          </p>
        </div>

        {/* بند ۱: اطلاعاتی که جمع‌آوری می‌کنیم */}
        <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse border-b border-border pb-4">
            <div className="p-2.5 bg-primary/15 text-primary rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">۱. چه اطلاعاتی را جمع‌آوری می‌کنیم؟</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            هنگام ثبت‌نام، ثبت سفارش و یا استفاده از فرم‌های تماس، اطلاعاتی نظیر نام و نام خانوادگی، شماره تماس، آدرس پستی، کد پستی و ایمیل از شما دریافت می‌شود. این اطلاعات صرفاً جهت پردازش و ارسال دقیق سفارشات و همچنین ارتباط موثر با شما دریافت می‌گردند.
          </p>
        </div>

        {/* بند ۲: امنیت داده‌ها */}
        <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse border-b border-border pb-4">
            <div className="p-2.5 bg-primary/15 text-primary rounded-xl">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">۲. امنیت و محافظت از اطلاعات</h2>
          </div>
          <ul className="space-y-3 text-muted-foreground text-sm leading-relaxed list-disc list-inside pr-2">
            <li>خانه ابزار هویت شخصی کاربران را محرمانه می‌داند و اطلاعات شخصی آنان را به هیچ شخص یا سازمان دیگری منتقل نمی‌کند، مگر اینکه با حکم مقام قضایی یا اداری صالحه موظف باشد این اطلاعات را در اختیار مراجع ذی‌صلاح قرار دهد.</li>
            <li>ارتباطات شبکه و تبادل اطلاعات در سایت ما بر بستر امن (HTTPS) و با استفاده از پروتکل‌های رمزنگاری صورت می‌گیرد.</li>
            <li>رمز عبور کاربران به صورت رمزنگاری شده (Hash) در دیتابیس ذخیره می‌شود و حتی مدیران سایت نیز به آن دسترسی ندارند.</li>
          </ul>
        </div>

        {/* بند ۳: کوکی‌ها */}
        <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse border-b border-border pb-4">
            <div className="p-2.5 bg-primary/15 text-primary rounded-xl">
              <Cookie className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">۳. استفاده از کوکی‌ها (Cookies)</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            سایت خانه ابزار مانند بسیاری از وب‌سایت‌ها از کوکی‌ها استفاده می‌کند. کوکی‌ها فایل‌های متنی کوچکی هستند که در مرورگر شما ذخیره می‌شوند تا تجربه کاربری بهتری را (مانند ذخیره سبد خرید شما یا حفظ وضعیت ورود به حساب کاربری) فراهم کنند. شما می‌توانید از طریق تنظیمات مرورگر خود، پذیرش کوکی‌ها را مدیریت کنید.
          </p>
        </div>

        {/* بند ۴: حقوق کاربران */}
        <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse border-b border-border pb-4">
            <div className="p-2.5 bg-primary/15 text-primary rounded-xl">
              <UserCog className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">۴. حقوق شما در قبال اطلاعاتتان</h2>
          </div>
          <ul className="space-y-3 text-muted-foreground text-sm leading-relaxed list-disc list-inside pr-2">
            <li>شما در هر زمان می‌توانید با ورود به حساب کاربری خود، اطلاعات شخصی‌تان را مشاهده، ویرایش و تکمیل نمایید.</li>
            <li>در صورتی که تمایل به دریافت پیامک‌ها و ایمیل‌های اطلاع‌رسانی و خبرنامه ندارید، می‌توانید لغو عضویت را از طریق پنل کاربری خود انتخاب کنید.</li>
          </ul>
        </div>

        {/* باکس هشدار فیشینگ */}
        <div className="bg-destructive/10 border border-destructive/20 p-6 md:p-8 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">هشدار امنیتی</h3>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            خانه ابزار هرگز از طریق پیامک یا ایمیل از شما درخواست رمز عبور یا اطلاعات کارت بانکی نمی‌کند. لطفاً در صورت مشاهده چنین مواردی، سریعاً پشتیبانی را در جریان بگذارید و از کلیک روی لینک‌های مشکوک خودداری کنید.
          </p>
        </div>

      </div>

    </div>
  )
}