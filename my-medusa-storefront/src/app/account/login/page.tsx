import LoginForm from "./login-form"; // ✅ اتصال به فایل بالا
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "ورود | فروشگاه توس هوس",
  description: "وارد حساب کاربری خود شوید.",
};

export default function LoginPage() {
  return (
    // 1. لایه پوشاننده (Overlay) برای مخفی کردن هدر و فوتر سایت
    <div className="fixed inset-0 z-[100] bg-white flex min-h-screen font-sans">
      
      {/* 2. ستون تصویر (سمت چپ - فقط دسکتاپ) */}
      <div className="hidden md:block w-1/2 relative bg-gray-900">
        {/* حتما یک عکس به نام login-bg.jpg در پوشه public/images بگذارید */}
        {/* اگر عکس ندارید، فعلا این خط Image را کامنت کنید تا ارور ندهد */}
        <Image
          src="/images/login-bg.jpg"
          alt="Login Background"
          fill
          className="object-cover opacity-70"
          priority
        />
        
        {/* متن روی عکس */}
        <div className="absolute inset-0 flex flex-col justify-end p-16 text-white bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            به دنیای کیفیت<br />خوش آمدید.
          </h2>
          <p className="text-gray-200 text-lg opacity-90 max-w-md">
            وارد شوید تا از وضعیت سفارش‌ها باخبر شوید و خریدی سریع‌تر را تجربه کنید.
          </p>
        </div>
      </div>

      {/* 3. ستون فرم (سمت راست) */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 overflow-y-auto relative bg-white">
        
        {/* دکمه بازگشت */}
        <Link 
          href="/" 
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors"
        >
          بازگشت به خانه <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="w-full max-w-sm space-y-8">
          <div className="text-center md:text-right">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">ورود به حساب</h1>
            <p className="text-sm text-gray-500 mt-2">
              اطلاعات ورود خود را وارد کنید.
            </p>
          </div>

          {/* فرم لاگین */}
          <LoginForm /> 
          
        </div>

        <div className="mt-12 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} تمامی حقوق محفوظ است.
        </div>
      </div>

    </div>
  );
}