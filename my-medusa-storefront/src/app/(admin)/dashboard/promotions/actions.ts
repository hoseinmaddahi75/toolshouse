'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

// --- تابع کمکی برای ساخت هدرهای احراز هویت ---
async function getAdminHeaders() {
  const cookieStore = await cookies()
  const token = cookieStore.get('_medusa_admin_token')?.value || ''

  // اگر توکن خالی بود، بهتره توی کنسول متوجه بشیم
  if (!token) {
    console.warn('هشدار: توکن ادمین در کوکی‌ها یافت نشد!')
  }

  return {
    'Content-Type': 'application/json',
    // در مدوسا v2، اضافه کردن Bearer token بسیار مطمئن‌تر از فقط ارسال کوکی است
    'Authorization': `Bearer ${token}`, 
    'Cookie': `_medusa_admin_token=${token}`, 
  }
}

// --- ۱. دریافت لیست تمام تخفیف‌ها ---
export async function getPromotions() {
  try {
    const headers = await getAdminHeaders()
    
    const res = await fetch(`${BACKEND_URL}/admin/promotions`, {
      method: 'GET',
      headers: headers,
      cache: 'no-store', 
    })

    // لاگ کردن دقیق خطای بک‌اند برای دیباگ راحت‌تر
    if (!res.ok) {
      const errorText = await res.text() // گرفتن متن خطای دقیق از مدوسا
      console.error(`Medusa API Error (${res.status}):`, errorText)
      throw new Error(`خطای بک‌اند مدوسا (کد ${res.status}): ${errorText || res.statusText}`)
    }

    const data = await res.json()
    return data.promotions 
  } catch (error) {
    console.error('Error fetching promotions:', error)
    // برگرداندن آرایه خالی برای جلوگیری از کرش کردن صفحه در صورت خطا
    return []
  }
}

// --- ۲. ایجاد یک کمپین تخفیف جدید ---
export async function createPromotion(promotionData: any) {
  try {
    const headers = await getAdminHeaders()
    const payload = { ...promotionData }

    // ۱. تبدیل مبلغ از تومان به ریال
    if (
      payload.application_method &&
      payload.application_method.type === 'fixed'
    ) {
      payload.application_method.value = payload.application_method.value * 10
    }

    // ۲. پردازش قانون حداقل سفارش
    if (payload.min_amount) {
      const minAmountRial = payload.min_amount * 10
      payload.application_method.currency_code = 'irr'
      payload.rules = [
        {
          // در مدوسا معمولا بهترین کلمه برای جمع کل کالاها item_total است
          attribute: "item_total", 
          operator: "gte",
          values: [minAmountRial.toString()]
        }
      ]
      payload.is_automatic = false;
      delete payload.min_amount
    }

    // ۳. 💡 حل قطعی مشکل اعمال نشدن: همیشه یک کمپین بساز!
    payload.campaign = {
      name: `کمپین برای ${payload.code || 'تخفیف'}`,
      campaign_identifier: `camp-${Date.now()}`,
    }
    payload.status = 'active';
    
    // اگر تاریخ داشت، به کمپین اضافه‌اش کن
    if (payload.starts_at) payload.campaign.starts_at = payload.starts_at
    if (payload.ends_at) payload.campaign.ends_at = payload.ends_at
    
    delete payload.starts_at
    delete payload.ends_at

    const res = await fetch(`${BACKEND_URL}/admin/promotions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error('خطا در ایجاد تخفیف')
    
    revalidatePath('/dashboard/promotions') 
    return { success: true, promotion: (await res.json()).promotion }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}


// --- ۳. حذف یک کمپین تخفیف ---
export async function deletePromotion(id: string) {
  try {
    const headers = await getAdminHeaders()
    
    const res = await fetch(`${BACKEND_URL}/admin/promotions/${id}`, {
      method: 'DELETE',
      headers: headers,
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'خطا در حذف تخفیف')
    }

    // پاک کردن کش صفحه برای آپدیت شدن بلافاصله جدول
    revalidatePath('/dashboard/promotions') 
    
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting promotion:', error)
    return { success: false, error: error.message }
  }
}


// --- ۴. دریافت اطلاعات یک تخفیف با ID ---
export async function getPromotionById(id: string) {
  try {
    const headers = await getAdminHeaders()
    
    // 💡 اضافه کردن فیلدهای مرتبط برای لود شدن کمپین و قوانین
    const res = await fetch(`${BACKEND_URL}/admin/promotions/${id}?fields=*application_method,*rules,*campaign`, {
      method: 'GET',
      headers: headers,
      cache: 'no-store',
    })

    if (!res.ok) throw new Error('خطا در دریافت اطلاعات تخفیف')
    const data = await res.json()
    return data.promotion
  } catch (error) {
    console.error('Error fetching promotion:', error)
    return null
  }
}

// --- ۵. ویرایش تخفیف موجود ---
export async function updatePromotion(id: string, promotionData: any) {
  try {
    const headers = await getAdminHeaders()
    const payload = { ...promotionData }

    // ۱. دریافت دیتای فعلی برای پیدا کردن کمپین و قوانین
    const getRes = await fetch(`${BACKEND_URL}/admin/promotions/${id}?fields=*campaign,*rules`, { headers });
    
    if (getRes.ok) {
      const existingData = await getRes.json();
      const existingPromo = existingData.promotion;

      // الف) آپدیت تاریخ‌ها (Campaign)
      if (existingPromo?.campaign?.id) {
        await fetch(`${BACKEND_URL}/admin/campaigns/${existingPromo.campaign.id}`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            starts_at: payload.starts_at || null, 
            ends_at: payload.ends_at || null,
          })
        });
      }

      // ب) 💡 آپدیت قانون "حداقل مبلغ سفارش" (Rules)
      const existingRule = existingPromo?.rules?.find((r: any) => r.attribute === 'item_total' || r.attribute === 'subtotal');
      
      // اگر قبلاً قانونی بوده، اول پاکش می‌کنیم
      if (existingRule) {
        await fetch(`${BACKEND_URL}/admin/promotions/${id}/rules/${existingRule.id}`, {
          method: 'DELETE',
          headers: headers
        });
      }

      // حالا اگر کاربر مبلغ جدیدی وارد کرده، قانون جدید رو می‌سازیم
      if (payload.min_amount) {
        const minAmountRial = payload.min_amount * 10;
        await fetch(`${BACKEND_URL}/admin/promotions/${id}/rules`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            rules: [{ attribute: 'item_total', operator: 'gte', values: [minAmountRial.toString()] }]
          })
        });
      }
    }

    // ۲. آماده‌سازی و ویرایش دیتای اصلی خود کد تخفیف
    if (payload.application_method && payload.application_method.type === 'fixed') {
      payload.application_method.value = payload.application_method.value * 10
      payload.application_method.currency_code = 'irr'
    }

    payload.is_automatic = false;
    // این فیلدها از payload اصلی حذف می‌شن تا مدوسا ارور 400 نده
    delete payload.rules; 
    delete payload.min_amount;
    delete payload.starts_at;
    delete payload.ends_at;
    if (payload.application_method?.buy_rules) delete payload.application_method.buy_rules;

    const res = await fetch(`${BACKEND_URL}/admin/promotions/${id}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error('خطا در ویرایش تخفیف')

    const data = await res.json()
    revalidatePath('/dashboard/promotions')
    revalidatePath(`/dashboard/promotions/${id}`)
    
    return { success: true, promotion: data.promotion }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}