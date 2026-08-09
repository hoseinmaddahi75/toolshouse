"use server";

import { getMedusaHeaders, BACKEND_URL } from "@/lib/medusa-client";
import { getAuthDataFromCookie } from "@/lib/auth";

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

export async function ensureCartOwnership(cartId: string) {
  const headers = await getHeadersWithAuth();
  const customerId = headers["x-customer-id"]; 

  if (!customerId) return { linked: false };

  try {
    const cartRes = await fetch(`${BACKEND_URL}/store/carts/${cartId}`, {
      headers: headers,
      cache: "no-store",
    });
    
    if (!cartRes.ok) return { linked: false };
    
    const { cart } = await cartRes.json();

    if (cart.customer_id === customerId) {
        return { linked: true, status: "already_linked" };
    }

    const updateRes = await fetch(`${BACKEND_URL}/store/carts/${cartId}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        customer_id: customerId,
        email: cart.email 
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

export async function getCurrentCustomerAction() {
  try {
    const headers = await getHeadersWithAuth();
    
    if (!headers["x-customer-id"]) return null;

    const addressRes = await fetch(`${BACKEND_URL}/store/custom-addresses`, {
      headers: headers,
      cache: "no-store",
    });

    let addresses = [];
    if (addressRes.ok) {
        const addrData = await addressRes.json();
        addresses = addrData.addresses || [];
    }

    let customerData: any = {
        id: headers["x-customer-id"],
        email: "",
        first_name: "",
        last_name: ""
    };

    try {
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
    } catch (e) {}

    return {
        ...customerData,
        addresses: addresses 
    };

  } catch (e) {
    console.error("Get Customer Action Error:", e);
    return null;
  }
}

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
            province: address.province, 
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

// 🟢 مسیر موفقیت‌آمیز شما برای ساخت درگاه
export async function setShippingMethodAction(cartId: string, shippingOptionId: string) {
  try {
    const headers = await getHeadersWithAuth();
    
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
        } catch (linkError) {}
    }

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

// 🔴 توابع ضروری اضافه‌شده جهت رفع کرش فرانت‌اند
export async function updateItemQuantityAction(cartId: string, lineId: string, quantity: number) {
  const headers = await getHeadersWithAuth();
  try {
    let res;
    if (quantity <= 0) {
      res = await fetch(`${BACKEND_URL}/store/carts/${cartId}/line-items/${lineId}`, {
        method: "DELETE",
        headers,
      });
    } else {
      res = await fetch(`${BACKEND_URL}/store/carts/${cartId}/line-items/${lineId}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ quantity }),
      });
    }

    if (!res.ok) return { success: false, message: await res.text() };
    const data = await res.json();
    return { success: true, cart: data.cart };
  } catch (error: any) {
    return { success: false, message: "خطای شبکه" };
  }
}

export async function applyPromotionAction(cartId: string, promoCode: string) {
  const headers = await getHeadersWithAuth();
  try {
    const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}/promotions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ promo_codes: [promoCode] }),
    });
    if (!res.ok) return { success: false, error: "کد تخفیف نامعتبر" };
    const data = await res.json();
    return { success: true, cart: data.cart };
  } catch (e) {
    return { success: false, error: "خطا در ارتباط" };
  }
}

export async function removePromotionAction(cartId: string, promoCode: string) {
  const headers = await getHeadersWithAuth();
  try {
    const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}/promotions`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ promo_codes: [promoCode] }),
    });
    if (!res.ok) return { success: false, error: "خطا در حذف کد تخفیف" };
    const data = await res.json();
    return { success: true, cart: data.cart };
  } catch (e) {
    return { success: false, error: "خطا در ارتباط" };
  }
}