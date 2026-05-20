// فایل: src/app/(admin)/layout.tsx
import "@/app/globals.css";
import { Vazirmatn } from "next/font/google";


export const dynamic = "force-dynamic";


const vazir = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata = {
  title: "پنل مدیریت",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={vazir.className} dir="rtl">
      {/* اینجا دیگر سایدبار نیست، فقط کانتینر اصلی */}
      <div className="min-h-screen bg-[#F3F4F6]">
        {children}
      </div>
    </div>
  );
}