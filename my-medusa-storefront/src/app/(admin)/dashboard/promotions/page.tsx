import Link from 'next/link'
import { getPromotions } from './actions'
import DeleteButton from './DeleteButton'

export const metadata = {
  title: 'مدیریت تخفیف‌ها | داشبورد ادمین',
}

export default async function PromotionsPage() {
  // دریافت لیست تخفیف‌ها از بک‌اند
  const promotions = await getPromotions()

  return (
    <div className="p-6">
      {/* هدر صفحه */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">تخفیف‌ها (Promotions)</h1>
          <p className="text-sm text-gray-500 mt-1">
            مدیریت کمپین‌ها و کدهای تخفیف فروشگاه
          </p>
        </div>
        <Link
          href="/dashboard/promotions/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + ایجاد تخفیف جدید
        </Link>
      </div>

      {/* جدول تخفیف‌ها */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">کد / عنوان</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">نوع</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">وضعیت</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promotions && promotions.length > 0 ? (
                promotions.map((promo: any) => (
                  <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{promo.code || 'بدون کد (خودکار)'}</div>
                      {/* در مدوسا v2 معمولا اسم یا توصیفی هم برای پروموشن در نظر گرفته میشه */}
                      <div className="text-xs text-gray-500 mt-1">{promo.is_automatic ? 'اعمال خودکار' : 'نیازمند کد'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {promo.type === 'standard' ? 'استاندارد' : promo.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {/* در اینجا می‌تونی شرط‌های دقیق‌تری برای وضعیت بنویسی */}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        فعال
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <Link
                          href={`/dashboard/promotions/${promo.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          ویرایش
                        </Link>
                        <DeleteButton id={promo.id} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                /* حالت خالی (Empty State) */
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="text-gray-400 mb-2">هیچ تخفیفی یافت نشد</div>
                    <p className="text-sm text-gray-500">
                      اولین کمپین تخفیف خود را برای افزایش فروش ایجاد کنید.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}