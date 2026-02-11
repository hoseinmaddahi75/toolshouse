import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* سایدبار که الان فیکس شده است */}
      <AdminSidebar />
      
      {/* تغییر مهم: mr-64 (مارجین راست) برای اینکه محتوا زیر سایدبار نرود */}
      <div className="mr-64 flex flex-col min-h-screen transition-all duration-300">
        <AdminHeader />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}