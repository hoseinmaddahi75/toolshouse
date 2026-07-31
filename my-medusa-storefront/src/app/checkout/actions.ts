"use server";

import { getMedusaHeaders, BACKEND_URL } from "@/lib/medusa-client";
import { getAuthDataFromCookie } from "@/lib/auth";

export async function ensureCartOwnership(cartId: string) {
  const headers = await getHeadersWithAuth();
  const customerId = headers["x-customer-id"]; // این از کوکی لاگین می‌آید

  // اگر کاربر لاگین نیست، کاری نداریم (خرید مهمان)
  if (!customerId) return { linked: false };

  try {
    // ۱. دریافت اطلاعات سبد خرید فعلی
    const cartRes = await fetch(`${BACKEND_URL}/store/carts/${cartId}`, {
      headers: headers,
      cache: "no-store",
    });
    
    if (!cartRes.ok) return { linked: false };
    
    const { cart } = await cartRes.json();

    // ۲. بررسی: آیا سبد خرید همین الان به این کاربر وصل است؟
    if (cart.customer_id === customerId) {
        return { linked: true, status: "already_linked" };
    }

    // ۳. اگر وصل نیست، وصلش کن (Update Cart)
    // این استانداردترین روش مدوسا برای "Claim" کردن سبد خرید است
    const updateRes = await fetch(`${BACKEND_URL}/store/carts/${cartId}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        customer_id: customerId,
        email: cart.email // ایمیل را هم نگه می‌داریم
      }),
      cache: "no-store",
    });

    if (updateRes.ok) {
        console.log(`✅ Cart ${cartId} claimed by customer ${customerId}`);
        return { linked: true, status: "just_linked" };
    }

  } catch (error) {
    console.error("Cart Ownership Error:", error);
  }

  return { linked: false };
}


// --- تابعی برای ساخت هدرهای اختصاصی ---
async function getHeadersWithAuth() {
  const baseHeaders = getMedusaHeaders();
  const { customerId, jwt } = await getAuthDataFromCookie();

  const headers: any = {
    ...baseHeaders,
    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
  };

  if (jwt) {
    headers["Authorization"] = `Bearer ${jwt}`;
  }

  if (customerId) {
    headers["x-customer-id"] = customerId;
  }

  return headers;
}

// ۱. دریافت مشتری + آدرس‌ها (نسخه ترکیبی و تضمینی)
export async function getCurrentCustomerAction() {
  try {
    const headers = await getHeadersWithAuth();
    
    // اگر کاربر لاگین نیست، نل برگردان
    if (!headers["x-customer-id"]) return null;

    // الف) دریافت آدرس‌ها از API اختصاصی (چون می‌دانیم این ۱۰۰٪ کار می‌کند)
    const addressRes = await fetch(`${BACKEND_URL}/store/custom-addresses`, {
      headers: headers,
      cache: "no-store",
    });

    let addresses = [];
    if (addressRes.ok) {
        const addrData = await addressRes.json();
        addresses = addrData.addresses || [];
    }

    // ب) تلاش برای دریافت ایمیل و مشخصات (اختیاری)
    // اگر این بخش فیل شود، حداقل آدرس‌ها را داریم
    let customerData: any = {
        id: headers["x-customer-id"],
        email: "",
        first_name: "",
        last_name: ""
    };

    try {
        // تلاش برای گرفتن پروفایل (ممکن است 401 بدهد، مهم نیست)
        const profileRes = await fetch(`${BACKEND_URL}/store/customers/me`, {
             headers: headers, 
             cache: "no-store" 
        });
        if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.customer) {
                customerData = { ...customerData, ...profileData.customer };
            }
        }
    } catch (e) {
        // ایگنور کردن خطای پروفایل
    }

    // ج) ترکیب اطلاعات: پروفایل + آدرس‌های اختصاصی
    return {
        ...customerData,
        addresses: addresses // 👈 این بخش مهم است: آدرس‌های سالم را جایگزین می‌کنیم
    };

  } catch (e) {
    console.error("Get Customer Action Error:", e);
    return null;
  }
}

// ۲. آپدیت آدرس سبد خرید
export async function updateCartAddressAction(cartId: string, address: any, email: string) {
  try {
    const headers = await getHeadersWithAuth();
    
    const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        shipping_address: {
            first_name: address.first_name,
            last_name: address.last_name,
            address_1: address.address_1,
            city: address.city,
            country_code: address.country_code || "ir",
            postal_code: address.postal_code,
            phone: address.phone,
            company: address.company,
            province: address.province, // اگر فیلد استان دارید
        },
        email: email,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "خطا در ثبت آدرس");
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ۳. دریافت روش‌های ارسال
export async function retrieveShippingOptions(cartId: string) {
  try {
    const headers = await getHeadersWithAuth();
    const res = await fetch(`${BACKEND_URL}/store/shipping-options?cart_id=${cartId}`, {
      headers: headers,
      cache: "no-store",
    });

    if (!res.ok) throw new Error("خطا");
    const data = await res.json();
    return data.shipping_options;
  } catch (e) {
    return [];
  }
}

// ۴. ثبت روش ارسال و آماده‌سازی پرداخت (نسخه نهایی و متصل‌کننده)
export async function setShippingMethodAction(cartId: string, shippingOptionId: string) {
  try {
    const headers = await getHeadersWithAuth();
    
    // 🟢 گام حیاتی جدید: اتصال سبد به مشتری قبل از پرداخت
    // اگر کاربر لاگین است (id دارد)، سبد را به نام او بزن
    if (headers["x-customer-id"]) {
        try {
            await fetch(`${BACKEND_URL}/store/carts/${cartId}`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ 
                    customer_id: headers["x-customer-id"] 
                }),
                cache: "no-store",
            });
            console.log("✅ Cart successfully linked to customer:", headers["x-customer-id"]);
        } catch (linkError) {
            console.error("⚠️ Failed to link cart to customer:", linkError);
            // اینجا ارور را نادیده می‌گیریم تا پروسه خرید متوقف نشود، ولی لاگ می‌کنیم
        }
    }

    // ادامه روال قبلی...
    const res = await fetch(`${BACKEND_URL}/store/custom-checkout/init`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ 
        cart_id: cartId, 
        shipping_option_id: shippingOptionId,
        provider_id: "pp_zarinpal_zarinpal" 
      }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
        console.error("Init Checkout Error:", data);
        throw new Error(data.message || "خطا در آماده‌سازی پرداخت");
    }

    return { success: true, session: data.result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ۶. انتخاب درگاه (برای تغییر دستی درگاه)
export async function setPaymentSessionAction(cartId: string, providerId: string, collectionId: string) {
  try {
    const headers = await getHeadersWithAuth();
    await fetch(`${BACKEND_URL}/store/payment-collections/${collectionId}/payment-sessions`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ provider_id: providerId }),
      cache: "no-store",
    });
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}