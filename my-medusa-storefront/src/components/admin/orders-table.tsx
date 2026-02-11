// src/components/admin/orders-table.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, AlertCircle } from "lucide-react";
import Link from "next/link";

// تعریف تایپ ورودی
type OrdersTableProps = {
  orders: any[];
  count: number;
};

export default function OrdersTable({ orders, count }: OrdersTableProps) {
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">مدیریت سفارشات</h1>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
          تعداد کل: {count}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لیست سفارشات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-right">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="h-10 px-4 font-medium text-gray-500">شماره</th>
                  <th className="h-10 px-4 font-medium text-gray-500">تاریخ</th>
                  <th className="h-10 px-4 font-medium text-gray-500">مشتری</th>
                  <th className="h-10 px-4 font-medium text-gray-500">مبلغ</th>
                  <th className="h-10 px-4 font-medium text-gray-500">وضعیت</th>
                  <th className="h-10 px-4 font-medium text-gray-500">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      هیچ سفارشی یافت نشد.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono font-medium">#{order.display_id}</td>
                      <td className="p-4 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                            <span className="font-medium">
                                {order.shipping_address?.first_name 
                                ? `${order.shipping_address.first_name} ${order.shipping_address.last_name}`
                                : (order.customer?.first_name ? `${order.customer.first_name} ${order.customer.last_name}` : "مهمان")}
                            </span>
                            <span className="text-xs text-gray-400">{order.email}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-700">
                         {new Intl.NumberFormat('fa-IR').format(order.total)} <span className="text-xs font-normal text-gray-400">{order.currency_code?.toUpperCase()}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.payment_status === 'captured' ? 'bg-green-100 text-green-700' : 
                          order.payment_status === 'awaiting' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <button className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors text-xs font-medium">
                            <Eye className="w-3 h-3" /> جزئیات
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}