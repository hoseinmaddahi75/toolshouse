// src/app/(admin)/dashboard/page.tsx
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ShoppingBag } from "lucide-react";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_admin_token")?.value;
  const BASE_URL = MEDUSA_BACKEND_URL;

  if (!token) return null;

  const headers = { 
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  try {
    // دریافت آمار به صورت موازی
    const [ordersRes, productsRes, customersRes] = await Promise.all([
      fetch(`${BASE_URL}/admin/orders?limit=1`, { headers, cache: 'no-store', credentials: 'include' }),
      fetch(`${BASE_URL}/admin/products?limit=1&status=published`, { headers, cache: 'no-store', credentials: 'include' }),
      fetch(`${BASE_URL}/admin/customers?limit=1`, { headers, cache: 'no-store', credentials: 'include' })
    ]);

    // اگر توکن نامعتبر بود
    if (ordersRes.status === 401) return null;

    const orders = await ordersRes.json();
    const products = await productsRes.json();
    const customers = await customersRes.json();

    return {
       orderCount: orders.count || 0,
       productCount: products.count || 0,
       customerCount: customers.count || 0,
    };
  } catch (e) {
    console.error("Dashboard Fetch Error:", e);
    return null;
  }
}

export default async function DashboardPage() {
   const stats = await getDashboardStats();

   if (!stats) {
     return (
       <div className="p-8 text-center text-gray-500">
         دسترسی منقضی شده است. لطفاً دوباره وارد شوید.
       </div>
     );
   }

   return (
     <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">داشبورد</h1>
        
        <div className="grid gap-4 md:grid-cols-3">
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">سفارشات کل</CardTitle>
               <Package className="h-4 w-4 text-gray-500" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{stats.orderCount}</div>
             </CardContent>
           </Card>

           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">محصولات منتشر شده</CardTitle>
               <ShoppingBag className="h-4 w-4 text-gray-500" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{stats.productCount}</div>
             </CardContent>
           </Card>

           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">مشتریان</CardTitle>
               <Users className="h-4 w-4 text-gray-500" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{stats.customerCount}</div>
             </CardContent>
           </Card>
        </div>
     </div>
   )
}