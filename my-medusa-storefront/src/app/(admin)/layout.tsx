// فایل: src/app/(admin)/layout.tsx
import "@/app/globals.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "پنل مدیریت",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    // 💡 کلاس فونت رو از اینجا برداشتیم، چون از لیوت اصلی سایت به ارث می‌رسه
    <div dir="rtl">
      {/* اینجا دیگر سایدبار نیست، فقط کانتینر اصلی */}
      <div className="min-h-screen bg-[#F3F4F6]">
        {children}
      </div>
    </div>
  );
}