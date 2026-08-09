// src/components/admin/reports/OrderStatusChart.tsx
"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ترجمه وضعیت‌های پرداخت
const paymentMap: Record<string, string> = {
  captured: "پرداخت شده",
  authorized: "تایید شده",
  awaiting: "در انتظار پرداخت",
  not_paid: "پرداخت نشده",
  canceled: "لغو شده",
  refunded: "مسترد شده",
};

// ترجمه وضعیت‌های ارسال
const fulfillmentMap: Record<string, string> = {
  fulfilled: "آماده ارسال",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  not_fulfilled: "ارسال نشده",
  canceled: "لغو شده",
  partially_fulfilled: "در حال آماده‌سازی",
};

// پلت رنگی جذاب
const COLOR_PALETTE: Record<string, string> = {
  captured: "#10b981", // سبز
  delivered: "#059669", // سبز تیره
  shipped: "#3b82f6", // آبی
  authorized: "#6366f1", // نیلی
  fulfilled: "#8b5cf6", // بنفش
  partially_fulfilled: "#38bdf8", // آبی روشن
  awaiting: "#f59e0b", // زرد/نارنجی
  not_fulfilled: "#eab308", // زرد
  not_paid: "#f97316", // نارنجی
  canceled: "#ef4444", // قرمز
  refunded: "#dc2626", // قرمز تیره
};

type OrderStatusChartProps = {
  orders: any[];
};

export default function OrderStatusChart({ orders }: OrderStatusChartProps) {
  const [activeType, setActiveType] = useState<"payment" | "fulfillment">("payment");

  // پردازش و تفکیک سفارشات بر اساس نوع انتخابی
  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    const map = activeType === "payment" ? paymentMap : fulfillmentMap;
    const keyName = activeType === "payment" ? "payment_status" : "fulfillment_status";

    const counts: Record<string, number> = {};

    orders.forEach((order) => {
      const status = order[keyName] || "not_fulfilled";
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      rawStatus: status,
      name: map[status] || status,
      value: count,
      percentage: Math.round((count / orders.length) * 100),
      color: COLOR_PALETTE[status] || "#9ca3af",
    }));
  }, [orders, activeType]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-right">
          <p className="text-sm font-bold text-gray-800">{data.name}</p>
          <p className="text-xs text-gray-600 mt-1">
            تعداد: <span className="font-bold text-gray-900">{data.value}</span> سفارش ({data.percentage}٪)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
        <div>
          <h2 className="text-lg font-bold text-gray-800">تفکیک وضعیت سفارشات</h2>
          <p className="text-xs text-gray-500 mt-1">بررسی ساختار پرداخت‌ها و بسته‌بندی‌ها</p>
        </div>

        {/* دکمه سوئیچ بین وضعیت پرداخت و ارسال */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveType("payment")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeType === "payment"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            وضعیت پرداخت
          </button>
          <button
            onClick={() => setActiveType("fulfillment")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeType === "fulfillment"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            وضعیت ارسال
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center bg-gray-50 rounded-xl">
          <p className="text-gray-400 text-sm">دیتایی برای نمایش وجود ندارد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* نمودار دونات */}
          <div className="w-full h-[280px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* خلاصه متنی و درصدها */}
          <div className="space-y-3">
            {chartData.map((item) => (
              <div key={item.rawStatus} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-gray-900">{item.value} سفارش</span>
                  <span className="text-gray-400">({item.percentage}٪)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}