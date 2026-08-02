import { Metadata } from "next"
import Link from "next/link"
import { 
  HelpCircle, 
  ChevronDown, 
  MessageCircleQuestion, 
  PhoneCall 
} from "lucide-react"

export const metadata: Metadata = {
  title: "سوالات متداول | خانه ابزار",
  description: "پاسخ به پرتکرارترین سوالات مشتریان درباره خرید، ارسال، گارانتی و مرجوعی در خانه ابزار.",
}

// آرایه‌ای از سوالات برای اینکه کد تمیزتر بماند و بعداً راحت‌تر اضافه یا کم کنی
const faqs = [
  {
    question: "چگونه می‌توانم وضعیت سفارش خود را پیگیری کنم؟",
    answer: "پس از ثبت نهایی سفارش، یک پیامک حاوی کد پیگیری برای شما ارسال می‌شود. همچنین می‌توانید با ورود به حساب کاربری خود در سایت، در بخش «سفارش‌های من»، وضعیت لحظه‌ای ارسال کالای خود را مشاهده کنید."
  },
  {
    question: "آیا ابزارآلات سایت شما اصلی هستند و گارانتی دارند؟",
    answer: "بله، خانه ابزار ضمانت ۱۰۰ درصدی اصالت تمام کالاها را ارائه می‌دهد. ابزارآلاتی که از برندهای معتبر (مثل بوش، ماکیتا، رونیکس، توسن و...) هستند، همگی با کارت گارانتی معتبر شرکتی برای شما ارسال می‌شوند."
  },
  {
    question: "چه روش‌های پرداختی در سایت امکان‌پذیر است؟",
    answer: "در حال حاضر، پرداخت تنها از طریق درگاه‌های امن بانکی (به صورت آنلاین) امکان‌پذیر است. شما می‌توانید با تمامی کارت‌های عضو شتاب، مبلغ سفارش خود را به راحتی پرداخت نمایید."
  },
  {
    question: "هزینه ارسال کالا چگونه محاسبه می‌شود؟",
    answer: "هزینه ارسال بر اساس وزن کالا، ابعاد بسته‌بندی و شهر مقصد محاسبه می‌گردد. این مبلغ پیش از نهایی کردن خرید و در مرحله تسویه حساب، به صورت شفاف به شما نمایش داده می‌شود."
  },
  {
    question: "آیا امکان لغو سفارش یا مرجوع کردن کالا وجود دارد؟",
    answer: "بله. طبق قوانین اینماد، شما تا ۷ روز پس از دریافت کالا مهلت تست دارید. اگر کالا دارای نقص فنی باشد یا مغایرتی با سفارش شما داشته باشد، به صورت رایگان تعویض می‌شود. در صورت انصراف از خرید (بدون باز کردن پلمپ)، کالا قابل مرجوع شدن است. برای جزئیات بیشتر صفحه «قوانین و مقررات» را مطالعه کنید."
  },
  {
    question: "آیا امکان خرید حضوری از فروشگاه خانه ابزار وجود دارد؟",
    answer: "بله! شما می توانید با مراجعه به آدرس فروشگاه در «مشهد قاسم اباد بلوار شاهد نبش شاهد ۷۳ رنگ و ابزار حسینی» نسبت به خرید حضوری اقدام کنید."

  }
]

export default function FAQPage() {
  return (
    <div className="bg-background min-h-screen dir-rtl text-foreground font-sans pb-16">
      
      {/* 1. Header / Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-16 px-4 text-center overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-black/10 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-background/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-2 text-primary-foreground">
            <MessageCircleQuestion className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            سوالات متداول
          </h1>
          <p className="text-primary-foreground/90 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            پاسخ به پرسش‌های پرتکرار شما. اگر جواب سوال خود را پیدا نکردید، با ما تماس بگیرید.
          </p>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-20 space-y-6">
        
        {/* لیست آکاردئونی سوالات */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details 
              key={index} 
              className="group bg-card border border-border rounded-2xl shadow-sm [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-6 text-foreground hover:text-primary transition-colors">
                <span className="text-base md:text-lg pl-4">{faq.question}</span>
                <span className="transition duration-300 group-open:rotate-180 text-muted-foreground group-open:text-primary flex-shrink-0">
                  <ChevronDown className="w-6 h-6" />
                </span>
              </summary>
              <div className="text-muted-foreground p-6 pt-0 text-sm md:text-base leading-relaxed border-t border-border/50 mt-2">
                <p className="pt-4">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        {/* 3. Call to Action - پشتیبانی بیشتر */}
        <div className="mt-12 bg-primary/10 border border-primary/20 p-8 rounded-3xl text-center space-y-5">
          <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <PhoneCall className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold">هنوز ابهامی دارید؟</h3>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
            تیم پشتیبانی فنی و فروش خانه ابزار، آماده ارائه مشاوره تخصصی و پاسخگویی به سوالات شما هستند.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-block bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl shadow-md hover:opacity-90 transition duration-200"
            >
              ارتباط با پشتیبانی
            </Link>
          </div>
        </div>

      </div>

    </div>
  )
}