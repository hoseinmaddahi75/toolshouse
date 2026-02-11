"use client";

import { usePathname } from "next/navigation";
import AccountNav from "@/components/account/account-nav";
import MobileAccountNav from "@/components/account/mobile-nav";

export default function AccountLayoutWrapper({ 
  children, 
  customer 
}: { 
  children: React.ReactNode;
  customer: any;
}) {
  const pathname = usePathname();

  // ✅ این خط جادویی است: اگر در صفحه ورود یا ثبت‌نام هستیم، سایدبار را مخفی کن
  const isAuthPage = pathname.includes("/login") || pathname.includes("/register");

  // حالت ۱: صفحه ورود/ثبت‌نام (بدون سایدبار)
  if (isAuthPage) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] py-12">
        <div className="w-full max-w-md px-4">
          {children}
        </div>
      </div>
    );
  }

  // حالت ۲: صفحات داخلی (با سایدبار)
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1400px]">
      <MobileAccountNav />

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <aside className="shrink-0 hidden md:block md:w-72 sticky top-4">
            {/* فقط اگر مشتری وجود داشت سایدبار را نشان بده */}
            {customer && <AccountNav customer={customer} />}
        </aside>

        <main className="flex-1 min-w-0 w-full">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm min-h-[500px]">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}