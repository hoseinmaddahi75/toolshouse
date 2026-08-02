import { Metadata } from "next"
import { 
  MapPin, 
  PhoneCall, 
  Smartphone, 
  Clock, 
  Mail, 
  Headset,
  Map
} from "lucide-react"

export const metadata: Metadata = {
  title: "تماس با ما | خانه ابزار",
  description: "اطلاعات تماس، آدرس و ساعات کاری فروشگاه رنگ و ابزار حسینی (خانه ابزار).",
}

export default function ContactPage() {
  return (
    <div className="bg-background min-h-screen dir-rtl text-foreground font-sans pb-16">
      
      {/* 1. Header / Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-16 px-4 text-center overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-black/10 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-background/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-2 text-primary-foreground">
            <PhoneCall className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            تماس با خانه ابزار
          </h1>
          <p className="text-primary-foreground/90 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            ما همیشه آماده شنیدن صدای شما هستیم. برای مشاوره، پیگیری سفارش یا خرید، با ما در ارتباط باشید.
          </p>
        </div>
      </section>

      {/* 2. Contact Information Cards */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* کارت آدرس */}
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition duration-300 flex flex-col md:flex-row items-center md:items-start text-center md:text-right gap-6">
            <div className="w-16 h-16 bg-primary/15 text-primary rounded-2xl flex-shrink-0 flex items-center justify-center">
              <MapPin className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">آدرس فروشگاه</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">
                مشهد، قاسم آباد، بلوار شاهد<br/>
                نبش شاهد ۷۳، رنگ و ابزار حسینی
              </p>
            </div>
          </div>

          {/* کارت تلفن‌ها */}
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition duration-300 flex flex-col md:flex-row items-center md:items-start text-center md:text-right gap-6">
            <div className="w-16 h-16 bg-primary/15 text-primary rounded-2xl flex-shrink-0 flex items-center justify-center">
              <Smartphone className="w-8 h-8" />
            </div>
            <div className="space-y-4 w-full">
              <h3 className="text-xl font-bold">شماره‌های تماس</h3>
              
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/50 pb-2 gap-2">
                  <span className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                    <PhoneCall className="w-4 h-4" /> تلفن فروشگاه:
                  </span>
                  <div className="font-bold text-foreground text-left dir-ltr">
                    <a href="tel:05136631233" className="hover:text-primary transition">051-36631233</a>
                    <span className="mx-2 text-muted-foreground">|</span>
                    <a href="tel:05136618134" className="hover:text-primary transition">051-36618134</a>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between pt-1 gap-2">
                  <span className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                    <Smartphone className="w-4 h-4" /> موبایل:
                  </span>
                  <div className="font-bold text-foreground text-left dir-ltr">
                    <a href="tel:09152058764" className="hover:text-primary transition">0915 205 8764</a>
                    <span className="mx-2 text-muted-foreground">|</span>
                    <a href="tel:09154157204" className="hover:text-primary transition">0915 415 7204</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* کارت ساعات کاری */}
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition duration-300 flex flex-col md:flex-row items-center md:items-start text-center md:text-right gap-6">
            <div className="w-16 h-16 bg-primary/15 text-primary rounded-2xl flex-shrink-0 flex items-center justify-center">
              <Clock className="w-8 h-8" />
            </div>
            <div className="space-y-4 w-full">
              <h3 className="text-xl font-bold">ساعات فعالیت</h3>
              
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/50 pb-2 gap-2">
                  <span className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                    <Clock className="w-4 h-4" /> فروشگاه حضوری:
                  </span>
                  <span className="font-bold text-foreground">شنبه تا پنجشنبه، ۷ صبح تا ۸:۳۰ شب <span className="text-xs text-primary font-bold">(یکسره)</span></span>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between pt-1 gap-2">
                  <span className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                    <Headset className="w-4 h-4" /> پاسخگویی تلفنی:
                  </span>
                  <span className="font-bold text-foreground">۹ صبح تا ۸:۳۰ شب</span>
                </div>
              </div>
            </div>
          </div>

          {/* کارت ایمیل */}
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition duration-300 flex flex-col md:flex-row items-center md:items-start text-center md:text-right gap-6">
            <div className="w-16 h-16 bg-primary/15 text-primary rounded-2xl flex-shrink-0 flex items-center justify-center">
              <Mail className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">پست الکترونیک</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                برای ارسال مکاتبات رسمی، رزومه یا پیشنهادات همکاری از طریق ایمیل زیر با ما در ارتباط باشید:
              </p>
              <a href="mailto:info@toolshouse.ir" className="inline-block font-bold text-lg text-foreground hover:text-primary transition-colors dir-ltr">
                info@toolshouse.ir
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Google Maps Placeholder / Embed */}
      <div className="max-w-5xl mx-auto px-4 mt-12">
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm relative h-[400px] flex items-center justify-center group">
          
          {/* راهنما: برای نمایش نقشه واقعی، کافیست کد iframe نقشه گوگل خود را جایگزین تگ iframe زیر کنید. 
            برای این کار در گوگل مپ آدرس خود را جستجو کنید، دکمه Share را بزنید، تب Embed a map را انتخاب کنید و لینک src آن را کپی کنید.
          */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12852.123456789!2d59.5312345!3d36.3612345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDIxJzQwLjQiTiA1OcKwMzEnNTIuNCJF!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 z-0 grayscale hover:grayscale-0 transition duration-700 opacity-80 hover:opacity-100"
          ></iframe>
          
          {/* این لایه روی نقشه قرار می‌گیرد تا ظاهر زیباتری بدهد. وقتی کاربر روی نقشه برود این لایه محو می‌شود */}
          <div className="relative z-10 bg-background/90 backdrop-blur-md p-6 rounded-2xl border border-border text-center group-hover:opacity-0 transition duration-500 pointer-events-none">
            <Map className="w-10 h-10 text-primary mx-auto mb-3" />
            <h4 className="font-bold text-lg">مسیریابی روی نقشه</h4>
            <p className="text-sm text-muted-foreground mt-1">برای مشاهده نقشه تعاملی موس را اینجا بیاورید</p>
          </div>

        </div>
      </div>

    </div>
  )
}