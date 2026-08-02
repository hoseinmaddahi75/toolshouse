import { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, Tag, Truck, Headphones, Award, Target } from "lucide-react"

export const metadata: Metadata = {
  title: "درباره ما | خانه ابزار",
  description: "آشنایی با فروشگاه اینترنتی خانه ابزار، مرجع تأمین ابزارآلات باکیفیت، اصالت کالا و پشتیبانی حرفه‌ای.",
}

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen dir-rtl text-foreground font-sans pb-16">
      
      {/* 1. Hero Section - هدر بالای صفحه با رنگ اصلی (زرد شما) */}
      <section className="relative bg-primary text-primary-foreground py-20 px-4 text-center overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-black/10 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            درباره خانه ابزار
          </h1>
          <p className="text-primary-foreground/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            آغاز یک کار حرفه‌ای، با انتخاب ابزار مناسب شکل می‌گیرد.
          </p>
        </div>
      </section>

      {/* 2. Main Story - متن ارسالی شما */}
      <section className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-card text-card-foreground rounded-2xl p-8 md:p-12 shadow-xl border border-border space-y-6 text-right leading-loose">
          <div className="inline-block bg-primary/15 text-primary text-sm font-bold px-4 py-1.5 rounded-full mb-2">
            داستان ما
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold border-r-4 border-primary pr-4">
            تأمین‌کننده مطمئن ابزارآلات باکیفیت و کاربردی
          </h2>

          <p className="text-muted-foreground text-base md:text-lg">
            ما در <strong className="text-primary font-bold">خانه ابزار</strong> با هدف تأمین انواع ابزارآلات باکیفیت و کاربردی برای مشتریان عزیزمان فعالیت می‌کنیم. از ابتدای مسیرمان تلاش کرده‌ایم تا با ارائه محصولات متنوع، قیمت‌های مناسب و ضمانت اصالت کالا، تجربه‌ای مطمئن و رضایت‌بخش برای مشتریان خود فراهم کنیم.
          </p>

          <p className="text-muted-foreground text-base md:text-lg">
            ما باور داریم که انتخاب ابزار مناسب، آغاز یک کار حرفه‌ای است؛ به همین دلیل با دقت در انتخاب برندها و پشتیبانی همه‌جانبه، در کنار شما مشتریان عزیز هستیم تا بهترین خرید را تجربه کنید.
          </p>
        </div>
      </section>

      {/* 3. Core Values - ارزش‌ها و ویژگی‌های اصلی */}
      <section className="max-w-6xl mx-auto px-4 mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">چرا خانه ابزار؟</h2>
          <p className="text-muted-foreground mt-2">مزایایی که ما را از دیگران متمایز می‌کند</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition text-center space-y-4">
            <div className="w-14 h-14 bg-primary/15 text-primary rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">ضمانت اصالت کالا</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              تضمین ۱۰۰٪ اصلی بودن تمامی ابزارها و تجهیزات از برندهای معتبر جهانی.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition text-center space-y-4">
            <div className="w-14 h-14 bg-primary/15 text-primary rounded-2xl flex items-center justify-center mx-auto">
              <Tag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">قیمت مناسب</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              ارائه منصفانه‌ترین قیمت‌ها در بازار بدون واسطه‌های اضافی.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition text-center space-y-4">
            <div className="w-14 h-14 bg-primary/15 text-primary rounded-2xl flex items-center justify-center mx-auto">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">تنوع بی‌نظیر</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              مجموعه‌ای کامل از ابزارهای برقی، شارژی، دستی و صنعتی برای همه نیازها.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition text-center space-y-4">
            <div className="w-14 h-14 bg-primary/15 text-primary rounded-2xl flex items-center justify-center mx-auto">
              <Headphones className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">پشتیبانی تخصصی</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              مشاوره فنی پیش از خرید برای انتخاب دقیق‌ترین ابزار متناسب با کار شما.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Statistics - آمار و ارقام */}
      <section className="bg-foreground text-background mt-20 py-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl font-extrabold text-primary">+۵,۰۰۰</div>
            <div className="text-background/80 text-sm">مشتری رضایت‌مند</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl font-extrabold text-primary">+۱,۲۰۰</div>
            <div className="text-background/80 text-sm">تنوع ابزارآلات</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl font-extrabold text-primary">+۵۰</div>
            <div className="text-background/80 text-sm">برند معتبر</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl md:text-4xl font-extrabold text-primary">۲۴/۷</div>
            <div className="text-background/80 text-sm">پشتیبانی و مشاوره</div>
          </div>
        </div>
      </section>

      {/* 5. Mission & Vision - ماموریت و چشم‌انداز */}
      <section className="max-w-5xl mx-auto px-4 mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-3 bg-primary/15 text-primary rounded-xl">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">ماموریت ما</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed text-sm">
            تأمین آسان، سریع و مقرون‌به‌صرفه بهترین ابزارهای کاری برای متخصصان، کارگاه‌ها و علاقمندان به کارهای فنی در سراسر کشور.
          </p>
        </div>

        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-3 bg-primary/15 text-primary rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">چشم‌انداز ما</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed text-sm">
            تبدیل شدن به مرجع شماره یک تخصصی نقد، بررسی و فروش آنلاین انواع ابزارآلات صنعتی و خانگی در ایران.
          </p>
        </div>
      </section>

      {/* 6. Call to Action - دعوت به بازدید از فروشگاه */}
      <section className="max-w-4xl mx-auto px-4 mt-20 text-center">
        <div className="bg-primary rounded-3xl p-10 text-primary-foreground shadow-xl space-y-6">
          <h2 className="text-2xl md:text-3xl font-extrabold">
            آماده‌اید کار خود را حرفه‌ای شروع کنید؟
          </h2>
          <p className="text-primary-foreground/90 max-w-xl mx-auto">
            از کاتالوگ ابزارهای ما دیدن کنید و ابزار مناسب پروژه خود را با ضمانت اصالت خریداری نمایید.
          </p>
          <div>
            <Link
              href="/store"
              className="inline-block bg-background text-foreground font-bold px-8 py-3.5 rounded-xl shadow-lg hover:bg-secondary transition duration-200"
            >
              مشاهده محصولات فروشگاه
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}