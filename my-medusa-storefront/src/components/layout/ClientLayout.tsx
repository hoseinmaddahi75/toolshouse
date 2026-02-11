// مسیر: src/components/layout/ClientLayout.tsx
"use client";

import { usePathname } from "next/navigation";

// 👇 تعریف می‌کنیم که این کامپوننت چه ورودی‌هایی می‌گیرد
interface ClientLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode; // هدر به عنوان یک المنت ریکت
  footer: React.ReactNode; // فوتر به عنوان یک المنت ریکت
}

export default function ClientLayout({
  children,
  header,
  footer,
}: ClientLayoutProps) {
  const pathname = usePathname();
  
  // شرط: اگر آدرس با /dashboard شروع شود
  const isDashboard = pathname?.startsWith("/dashboard");

  // حالت ۱: اگر در داشبورد هستیم، هدر و فوتر را رندر نکن
  if (isDashboard) {
    return <>{children}</>;
  }

  // حالت ۲: در غیر این صورت، همه چیز را نشان بده
  return (
    <div className="relative flex min-h-screen flex-col">
      {header}
      <main className="flex-1">{children}</main>
      {footer}
    </div>
  );
}