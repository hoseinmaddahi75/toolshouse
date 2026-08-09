"use server";

// ⚠️ این مقادیر قبلاً مستقیم توی کد هاردکد بودن (ریسک امنیتی: اگه ریپو جایی لو بره، هرکسی می‌تونه
// از حساب تاپین شما سفارش بسازه). حالا اول از .env خونده می‌شن؛ فقط اگه .env تنظیم نشده بود،
// همون مقدار قبلی به‌عنوان fallback استفاده می‌شه تا چیزی ناگهان خراب نشه.
// لطفاً TAPIN_TOKEN و TAPIN_SHOP_ID رو به‌زودی توی .env اضافه کن و این fallback رو حذف کن.
const TAPIN_TOKEN =
  process.env.TAPIN_TOKEN ||
  "jwt eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiNzc2MzY1ZTEtMjc1My00OTkyLWE1Y2UtYmEzMTZhNTA5MDMyIiwidXNlcm5hbWUiOiIwOTE1MjA1ODc2NCIsImVtYWlsIjoiaG9qanN0Y295Z0BnbWFpbC5jb20iLCJleHAiOjI1NjA0OTQ3NjIsIm9yaWdfaWF0IjoxNjk2NDk0NzYyfQ.QMHpK5xndkGda_tBGoT_3WJCekVmzqTK7jATGpByJcs";
const TAPIN_SHOP_ID = process.env.TAPIN_SHOP_ID || "05bfc83c-bdcf-4e8e-8e68-c280c70e87e1";

const getAuthHeader = () => {
  return TAPIN_TOKEN.toLowerCase().startsWith("jwt") 
    ? TAPIN_TOKEN 
    : `Bearer ${TAPIN_TOKEN}`;
};

export async function getTapinLocations() {
  try {
    const res = await fetch("https://api.tapin.ir/api/v2/public/state/tree/", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": getAuthHeader()
      },
      body: JSON.stringify({}),
      cache: "no-store" 
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data?.entries || []; 
  } catch (error) {
    return [];
  }
}

export async function calculateTapinShippingCost(
  addressDetails: any, 
  cartItems: any[],
  orderType: number = 1,
  payType: number = 2
) {
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

    const products = await Promise.all(cartItems.map(async (item) => {
      let variantWeight = item.variant?.weight || item.weight || item.product?.weight || 0;

      if (!variantWeight && item.product_id) {
        try {
          const prodRes = await fetch(`${BACKEND_URL}/store/products/${item.product_id}?fields=*variants,+weight`, {
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key": PUBLISHABLE_KEY
            },
            cache: "no-store"
          });
          if (prodRes.ok) {
            const prodData = await prodRes.json();
            const targetVariant = prodData.product?.variants?.find((v: any) => v.id === item.variant_id);
            variantWeight = targetVariant?.weight || prodData.product?.weight || 0;
          }
        } catch (e) {
          console.error("Fetch product weight error:", e);
        }
      }

      return {
        count: item.quantity || 1,
        discount: 0,
        price: Math.round((item.unit_price || 100000) / 10), 
        title: item.title || "محصول فروشگاه",
        weight: variantWeight > 0 ? variantWeight : 1000,
        product_id: null
      };
    }));

    let realProvinceCode = 1;
    let realCityCode = 1;
    
    try {
      const locations = await getTapinLocations();
      const userProv = addressDetails.province?.trim();
      const userCity = addressDetails.city?.trim();

      const matchedProvince = locations.find((p: any) => p.name?.trim() === userProv || p.title?.trim() === userProv);
      if (matchedProvince) {
        realProvinceCode = matchedProvince.id || matchedProvince.code || 1;
        const cityList = matchedProvince.cities || matchedProvince.towns || matchedProvince.counties || [];
        const matchedCity = cityList.find((c: any) => c.name?.trim() === userCity || c.title?.trim() === userCity);
        if (matchedCity) {
          realCityCode = matchedCity.id || matchedCity.code || 1;
        }
      }
    } catch (e) {
      console.error("Location Mapping Error:", e);
    }

    const payload = {
      shop_id: TAPIN_SHOP_ID,
      address: addressDetails.address_1 || "آدرس وارد نشده است",
      province_code: realProvinceCode,
      city_code: realCityCode,
      first_name: addressDetails.first_name || "مشتری",
      last_name: addressDetails.last_name || "عزیز",
      mobile: addressDetails.phone || "09120000000",
      phone: addressDetails.phone || "02100000000",
      email: addressDetails.email || "info@example.com",
      description: "سفارش",
      employee_code: -1, 
      box_id: 10, 
      postal_code: addressDetails.postal_code || "1111111111",
      pay_type: payType, 
      order_type: orderType, 
      package_weight: 100, 
      packet_type: 2, 
      has_insurance: false, 
      products: products
    };

    const response = await fetch("https://api.tapin.ir/api/v2/public/order/post/check-price/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader()
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    const responseText = await response.text();
    const data = JSON.parse(responseText);

    // بررسی اینکه آیا تاپین ارور داده است یا خیر (مثل status 1565)
    if (!response.ok || data?.returns?.status !== 200) {
      console.warn(`Tapin Warning (OrderType ${orderType}):`, data?.returns?.message);
      return { success: false, cost: 0, message: data?.returns?.message || "سرویس ارسال در این مسیر فعال نیست" };
    }

    const entries = data?.entries || {};
    const rawCost = entries.total_price || entries.total_send_price || entries.send_price || 0;
    const cost = Math.round(rawCost / 10); // تبدیل ریال به تومان

    if (cost <= 0) return { success: false, cost: 0, message: "هزینه معتبر یافت نشد" };
    return { success: true, cost }; 
  } catch (error) {
    return { success: false, cost: 0, message: "ارتباط با سرور برقرار نشد" };
  }
}




// --- اضافه شود به انتهای فایل tapin-actions.ts ---

export async function registerTapinOrderAction(
  addressDetails: any, 
  cartItems: any[],
  medusaOrderId: string,
  orderType: number = 1, // 1 برای پست، 3 برای تیپاکس
  payType: number = 2 // 2 برای پس‌کرایه (کرایه در مقصد)
) {
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

    // آماده‌سازی لیست محصولات مطابق استاندارد تاپین
    const products = await Promise.all(cartItems.map(async (item) => {
      let variantWeight = item.variant?.weight || item.weight || item.product?.weight || 0;

      if (!variantWeight && item.product_id) {
        try {
          const prodRes = await fetch(`${BACKEND_URL}/store/products/${item.product_id}?fields=*variants,+weight`, {
            headers: { "Content-Type": "application/json", "x-publishable-api-key": PUBLISHABLE_KEY },
            cache: "no-store"
          });
          if (prodRes.ok) {
            const prodData = await prodRes.json();
            const targetVariant = prodData.product?.variants?.find((v: any) => v.id === item.variant_id);
            variantWeight = targetVariant?.weight || prodData.product?.weight || 0;
          }
        } catch (e) {}
      }

      return {
        count: item.quantity || 1,
        discount: 0, // در تاپین معمولاً تخفیف محصول را 0 رد می‌کنند
        price: Math.round((item.unit_price || 100000) / 10), // تبدیل به تومان
        title: item.title || "محصول فروشگاه",
        weight: variantWeight > 0 ? variantWeight : 1000,
        product_id: null
      };
    }));

    // پیدا کردن کدهای استان و شهر تاپین
    let realProvinceCode = 1;
    let realCityCode = 1;
    try {
      const locations = await getTapinLocations();
      const userProv = addressDetails.province?.trim();
      const userCity = addressDetails.city?.trim();

      const matchedProvince = locations.find((p: any) => p.name?.trim() === userProv || p.title?.trim() === userProv);
      if (matchedProvince) {
        realProvinceCode = matchedProvince.id || matchedProvince.code || 1;
        const cityList = matchedProvince.cities || matchedProvince.towns || matchedProvince.counties || [];
        const matchedCity = cityList.find((c: any) => c.name?.trim() === userCity || c.title?.trim() === userCity);
        if (matchedCity) realCityCode = matchedCity.id || matchedCity.code || 1;
      }
    } catch (e) { console.error("Location Mapping Error:", e); }

    // محاسبه وزن کل بسته
    const totalWeight = products.reduce((acc, p) => acc + (p.weight * p.count), 0);

    // پِیلود (Payload) نهایی برای API ثبت سفارش تاپین
    const payload = {
      register_type: 0,
      shop_id: TAPIN_SHOP_ID,
      address: addressDetails.address_1 || "آدرس وارد نشده است",
      province_code: realProvinceCode,
      city_code: realCityCode,
      description: `سفارش مدوسا: ${medusaOrderId}`,
      email: addressDetails.email || "info@example.com",
      employee_code: -1, 
      first_name: addressDetails.first_name || "مشتری",
      last_name: addressDetails.last_name || "عزیز",
      mobile: addressDetails.phone || "09120000000",
      phone: addressDetails.phone || "02100000000",
      postal_code: addressDetails.postal_code || "1111111111",
      pay_type: payType, 
      order_type: orderType, 
      package_weight: totalWeight > 0 ? totalWeight : 1000,
      packet_type: 2, 
      box_id: 10, 
      has_insurance: false, // بر اساس داکیومنت boolean یا "false"
      content_type: 1,
      manual_id: medusaOrderId, // شناسه سفارش مدوسا را می‌فرستیم تا در تاپین قابل رهگیری باشد
      products: products
    };

    const response = await fetch("https://api.tapin.ir/api/v2/public/order/post/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader()
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    const data = await response.json();

    if (!response.ok || data?.returns?.status !== 200) {
      console.error(`خطا در ثبت سفارش تاپین:`, data?.returns?.message);
      return { success: false, message: data?.returns?.message || "خطا در ثبت سفارش تاپین" };
    }

    return { success: true, tapin_data: data.entries }; 
  } catch (error) {
    console.error("Tapin Register Error:", error);
    return { success: false, message: "ارتباط با سرور تاپین برقرار نشد" };
  }
}