// ایمپورت کردن کامپوننت‌های طراحی شده توسط خودتان
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";


export const dynamic = "force-dynamic";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* استفاده از هدر خودتان */}
      <Header />
      
      <main className="flex-1 w-full">
        {children}
      </main>
      
      {/* استفاده از فوتر خودتان */}
      <Footer />
    </div>
  );
}