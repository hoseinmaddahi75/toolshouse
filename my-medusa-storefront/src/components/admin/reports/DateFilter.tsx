// src/components/admin/reports/DateFilter.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { CalendarDays } from "lucide-react";

export default function DateFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // خواندن تاریخ‌های فعلی از URL
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const [dateRange, setDateRange] = useState<DateObject[]>([
    fromParam ? new DateObject({ date: new Date(fromParam), calendar: persian }) : new DateObject({ calendar: persian }).subtract(7, "days"),
    toParam ? new DateObject({ date: new Date(toParam), calendar: persian }) : new DateObject({ calendar: persian }),
  ]);

  const handleDateChange = (dates: DateObject[]) => {
    setDateRange(dates);
    if (dates.length === 2 && dates[0] && dates[1]) {
      // وقتی کاربر هر دو تاریخ (شروع و پایان) رو انتخاب کرد، URL رو آپدیت می‌کنیم
      const fromIso = dates[0].toDate().toISOString();
      // تاریخ پایان رو میذاریم روی آخرین ثانیه اون روز
      const toIso = new Date(dates[1].toDate().setHours(23, 59, 59, 999)).toISOString();

      const params = new URLSearchParams(searchParams.toString());
      params.set("from", fromIso);
      params.set("to", toIso);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const quickFilters = [
    { label: "امروز", days: 0 },
    { label: "۷ روز اخیر", days: 7 },
    { label: "۳۰ روز اخیر", days: 30 },
  ];

  const applyQuickFilter = (days: number) => {
    const today = new DateObject({ calendar: persian });
    const past = new DateObject({ calendar: persian }).subtract(days, "days");
    handleDateChange([past, today]);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-blue-600" />
        <h2 className="text-sm font-bold text-gray-700">بازه زمانی گزارش:</h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* دکمه‌های فیلتر سریع */}
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
          {quickFilters.map((f) => (
            <button
              key={f.label}
              onClick={() => applyQuickFilter(f.days)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* تقویم بازه دلخواه */}
        <div className="relative">
          <DatePicker
            value={dateRange}
            onChange={handleDateChange}
            range
            calendar={persian}
            locale={persian_fa}
            format="YYYY/MM/DD"
            dateSeparator=" تا "
            inputClass="border border-gray-300 text-gray-700 text-sm rounded-lg px-4 py-2 w-[240px] text-center outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-sans"
            placeholder="انتخاب بازه دلخواه..."
          />
        </div>
      </div>
    </div>
  );
}