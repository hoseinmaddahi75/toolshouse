"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react"; // 👈 اضافه شد
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  LogOut, 
  Store,
  Users,
  FileText,
  MessageSquare,
  Tag,
  TableProperties,
  MessageSquareQuote,
  ChevronLeft,
  ChevronDown
} from "lucide-react";
import { SwatchIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

// تعریف تایپ برای آیتم‌های منو
type MenuItem = {
  title: string;
  href: string;
  icon: any;
  exact?: boolean;
  children?: { title: string; href: string }[]; // 👈 قابلیت زیرمنو
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const BASE_URL = MEDUSA_BACKEND_URL;

  // استیت برای ذخیره نام منوی باز شده
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    {
      title: "داشبورد",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "محصولات",
      href: "/dashboard/products",
      icon: ShoppingBag,
      exact: false,
      // 👇 زیرمنوهای محصولات
      children: [
        { title: "لیست محصولات", href: "/dashboard/products" },
        { title: "دسته‌بندی‌ها", href: "/dashboard/categories" },
        { title: "تخفیف ها", href: "/dashboard/promotions" },
      ]
    },
    {
      title: "ویژگی‌ها (متغیرها)", 
      href: "/dashboard/attributes",
      icon: SwatchIcon,
      exact: false, 
    },
    {
      title: "منابع محصول",
      href: "/dashboard/resources",
      icon: TableProperties,
      exact: false,
    },
    {
      title: "سفارشات",
      href: "/dashboard/orders",
      icon: ShoppingCart,
      exact: false,
    },
    {
      title: "مشتریان",
      href: "/dashboard/customers",
      icon: Users,
      exact: false,
    },
    {
      title: "وبلاگ",
      href: "/dashboard/blog",
      icon: FileText,
      exact: true,
      // 👇 می‌توانید برای وبلاگ هم زیرمنو بگذارید
      children: [
        { title: "لیست مقالات", href: "/dashboard/blog" },
        { title: "دسته‌بندی‌های وبلاگ", href: "/dashboard/blog/categories" },
      ]
    },
    {
      title: "نظرات وبلاگ",
      href: "/dashboard/comments",
      icon: MessageSquare,
      exact: false,
    },
    {
      title: "نظرات محصولات",
      href: "/dashboard/reviews",
      icon: MessageSquare,
      exact: false,
    },
    {
      title: "نظرات سایت",
      href: "/dashboard/site-reviews",
      icon: MessageSquareQuote,
      exact: false,
    },
  ];

  // 👈 این افکت باعث می‌شود اگر داخل صفحه‌ای بودید، منوی مادر آن خودکار باز شود
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(child => pathname === child.href);
        if (isChildActive || pathname.startsWith(item.href)) {
          setOpenMenu(item.title);
        }
      }
    });
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/session`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("با موفقیت خارج شدید");
        router.push("/admin/login");
        router.refresh();
      } else {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Logout error", error);
      router.push("/admin/login");
    }
  };

  const toggleMenu = (title: string) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  return (
    <aside className="fixed top-0 right-0 z-50 h-screen w-64 bg-white border-l border-gray-200 flex flex-col shadow-sm transition-transform overflow-hidden">
      {/* لوگو */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0 bg-white z-10">
        <Store className="h-6 w-6 text-blue-600 ml-2" />
        <span className="font-bold text-lg text-gray-800">داشبورد مدیریت</span>
      </div>

      {/* منوها */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide pb-20">
        {menuItems.map((item) => {
          // بررسی فعال بودن لینک اصلی
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
          
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openMenu === item.title;

          return (
            <div key={item.title}>
              {hasChildren ? (
                // --- حالت منوی کشویی (Parent) ---
                <button
                  onClick={() => toggleMenu(item.title)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive || isOpen ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("h-5 w-5", isActive || isOpen ? "text-blue-600" : "text-gray-400")} />
                    {item.title}
                  </div>
                  {isOpen ? <ChevronDown className="h-4 w-4 opacity-50" /> : <ChevronLeft className="h-4 w-4 opacity-50" />}
                </button>
              ) : (
                // --- حالت لینک معمولی ---
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-gray-400")} />
                  {item.title}
                </Link>
              )}

              {/* --- نمایش فرزندان --- */}
              {hasChildren && isOpen && (
                <div className="mr-6 mt-1 space-y-1 border-r border-gray-200 pr-2 animate-in slide-in-from-top-2 duration-200">
                  {item.children?.map((child) => {
                    const isChildActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-3 py-2 rounded-md text-sm transition-colors",
                          isChildActive 
                            ? "text-blue-600 bg-blue-50/50 font-medium" 
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        )}
                      >
                        {child.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* فوتر */}
      <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0 absolute bottom-0 w-full">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          خروج از حساب
        </button>
      </div>
    </aside>
  );
}