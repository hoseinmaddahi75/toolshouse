import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
// 👇 ایمپورت‌ها را اینجا انجام دهید
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ClientLayout from "@/components/layout/ClientLayout";


export const dynamic = "force-dynamic";


const vazir = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  title: "فروشگاه مدوسا",
  description: "فروشگاه اینترنتی مدرن با نکست جی‌اس و مدوسا",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          vazir.className
        )}
      >
        {/* 👇 حالا هدر و فوتر را به عنوان پراپ پاس می‌دهیم */}
        <ClientLayout
          header={<Header />}
          footer={<Footer />}
        >
          {children}
        </ClientLayout>

        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}