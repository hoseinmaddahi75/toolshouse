'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createPromotion } from '../actions'
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";

export default function CreatePromotionPage() {
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // استیت فرم با فیلدهای جدید
  const [formData, setFormData] = useState({
    code: '',
    is_automatic: false,
    type: 'percentage',
    value: '',
    min_amount: '', // حداقل مبلغ سفارش به تومان
    starts_at: '',  // تاریخ شروع
    ends_at: '',    // تاریخ پایان
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // آماده‌سازی دیتای ارسالی
      const payload: any = {
        code: formData.code,
        type: 'standard',
        is_automatic: formData.is_automatic,
        // تبدیل تاریخ‌های وارد شده به فرمت استاندارد ISO
        starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : undefined,
        ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString() : undefined,
        application_method: {
          type: formData.type,
          target_type: 'order',
          value: Number(formData.value),
        },
      }

      // اضافه کردن حداقل مبلغ فقط در صورتی که کاربر مقداری وارد کرده باشد
      if (formData.min_amount) {
        payload.min_amount = Number(formData.min_amount)
      }

      const result = await createPromotion(payload)

      if (result.success) {
        router.push('/dashboard/promotions')
      } else {
        setError(result.error || 'خطایی در ثبت تخفیف رخ داد.')
      }
    } catch (err: any) {
      setError(err.message || 'خطای شبکه')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ایجاد تخفیف جدید</h1>
          <p className="text-sm text-gray-500 mt-1">یک کمپین تخفیف کامل با شرایط دلخواه ایجاد کنید.</p>
        </div>
        <Link href="/dashboard/promotions" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
          بازگشت به لیست
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* بخش اول: اطلاعات اصلی */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">اطلاعات اصلی</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">کد تخفیف <span className="text-red-500">*</span></label>
              <input type="text" name="code" required value={formData.code} onChange={handleChange} placeholder="YALDA1403" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-left disabled:bg-gray-100 outline-none focus:ring-2 focus:ring-blue-500" dir="ltr" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">نوع تخفیف</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="percentage">درصدی (%)</option>
                <option value="fixed">مبلغ ثابت (تومان)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">مقدار تخفیف <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="number" name="value" required min="1" value={formData.value} onChange={handleChange} placeholder={formData.type === 'percentage' ? '20' : '50000'} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-left outline-none focus:ring-2 focus:ring-blue-500" dir="ltr" />
                <span className="absolute right-4 top-2.5 text-gray-400 text-sm">{formData.type === 'percentage' ? '%' : 'تومان'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">حداقل مبلغ سفارش (اختیاری)</label>
              <div className="relative">
                <input type="number" name="min_amount" min="1" value={formData.min_amount} onChange={handleChange} placeholder="مثال: 1000000" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-left outline-none focus:ring-2 focus:ring-blue-500" dir="ltr" />
                <span className="absolute right-4 top-2.5 text-gray-400 text-sm">تومان</span>
              </div>
              <p className="text-xs text-gray-500">مشتری برای استفاده از این تخفیف باید حداقل این مبلغ را خرید کند.</p>
            </div>
          </div>
        </div>

        {/* زمان‌بندی */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">زمان‌بندی اعتبار (اختیاری)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 flex flex-col">
              <label className="block text-sm font-medium text-gray-700">تاریخ و ساعت شروع</label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD HH:mm"
                plugins={[<TimePicker position="bottom" key="time-picker" />]}
                value={formData.starts_at ? new Date(formData.starts_at) : ""}
                onChange={(date: any) => {
                  setFormData(prev => ({
                    ...prev,
                    starts_at: date ? date.toDate().toISOString() : ""
                  }))
                }}
                containerClassName="w-full"
                inputClass="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-right font-sans"
                placeholder="انتخاب تاریخ و ساعت"
              />
            </div>
            
            <div className="space-y-2 flex flex-col">
              <label className="block text-sm font-medium text-gray-700">تاریخ و ساعت پایان</label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD HH:mm"
                plugins={[<TimePicker position="bottom" key="time-picker" />]}
                value={formData.ends_at ? new Date(formData.ends_at) : ""}
                onChange={(date: any) => {
                  setFormData(prev => ({
                    ...prev,
                    ends_at: date ? date.toDate().toISOString() : ""
                  }))
                }}
                containerClassName="w-full"
                inputClass="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-right font-sans"
                placeholder="انتخاب تاریخ و ساعت"
              />
            </div>
          </div>
        </div>

        {/* دکمه‌های عملیات */}
        <div className="flex justify-end gap-3 pb-8">
          <Link href="/dashboard/promotions" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            انصراف
          </Link>
          <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-blue-400">
            {isLoading ? 'در حال ذخیره...' : 'ذخیره تخفیف'}
          </button>
        </div>
      </form>
    </div>
  )
}


