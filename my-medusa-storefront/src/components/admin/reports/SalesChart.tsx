// src/components/admin/reports/SalesChart.tsx
"use client";

import { useMemo } from "react";
import { format } from "date-fns-jalali";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type SalesChartProps = {
  orders: any[];
};

export default function SalesChart({ orders }: SalesChartProps) {
  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    const groupedData = orders.reduce((acc: any, order: any) => {
      // فقط سفارش‌های لغو شده نادیده گرفته می‌شوند
      if (order.payment_status === 'canceled') return acc;

      const dateStr = format(new Date(order.created_at), "yyyy/MM/dd");

      if (!acc[dateStr]) {
        acc[dateStr] = { date: dateStr, revenue: 0, orderCount: 0 };
      }

      acc[dateStr].revenue += (order.total || 0) / 10; // تبدیل به تومان
      acc[dateStr].orderCount += 1;
      return acc;
    }, {});

    return Object.values(groupedData).sort((a: any, b: any) => 
      a.date.localeCompare(b.date)
    );
  }, [orders]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 text-right">
          <p className="text-sm font-bold text-gray-700 mb-2 border-b pb-2">{label}</p>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-emerald-600 font-medium">
              درآمد: <span className="font-bold font-mono text-gray-900">{new Intl.NumberFormat('fa-IR').format(payload[0]?.value || 0)}</span> تومان
            </p>
            <p className="text-sm text-blue-600 font-medium">
              تعداد سفارش: <span className="font-bold font-mono text-gray-900">{new Intl.NumberFormat('fa-IR').format(payload[1]?.value || 0)}</span> عدد
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-gray-500 text-sm">در این بازه زمانی سفارشی برای نمایش نمودار یافت نشد.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800">روند فروش و درآمد</h2>
        <p className="text-xs text-gray-500 mt-1">نمودار روزانه بر اساس تاریخ‌های انتخاب شده</p>
      </div>

      <div className="w-full h-[350px]" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#6b7280', fontSize: 12, fontFamily: 'sans-serif' }} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={(value) => `${new Intl.NumberFormat('en-US').format(value / 1000)}k`}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dx={10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
            
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              name="درآمد (تومان)" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              animationDuration={1500}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="orderCount" 
              name="تعداد سفارش" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}