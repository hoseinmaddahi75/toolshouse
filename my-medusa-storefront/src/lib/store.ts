import { create } from "zustand";
import { persist } from "zustand/middleware";
import { medusaClient } from "./medusa-client";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

// ✅ کلید عمومی مدوسا را مستقیم اینجا هاردکد می‌کنیم تا در بیلد داکر گم نشود
const MEDUSA_PUBLISHABLE_KEY = "pk_82b953b964ad71f051bb02d1382200901c260d0e8628f845fd00856125b14336";

interface CartState {
  cartId: string | null;
  items: any[];
  currencyCode: string;
  isOpen: boolean;

  // اکشن‌ها
  initializeCart: () => Promise<void>;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      items: [],
      currencyCode: "irr", // پیش‌فرض ریال یا تومان
      isOpen: false,

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      initializeCart: async () => {
        let currentCartId = get().cartId;
        let cartFound = false;

        // 1. تلاش برای بازیابی سبد خرید قدیمی
        if (currentCartId) {
          try {
            const { cart } = await medusaClient.store.cart.retrieve(currentCartId);
            set({ 
              items: cart.items || [], 
              currencyCode: cart.currency_code 
            });
            cartFound = true; // موفق شدیم!
          } catch (error) {
            console.warn("⚠️ Old cart not found (expired or deleted). Creating a new one...");
            // اگر ارور داد (مثل الان)، آی‌دی خراب را پاک می‌کنیم
            set({ cartId: null, items: [] });
            currentCartId = null;
          }
        }

        // 2. اگر سبد قبلی نبود (یا خراب بود)، یکی جدید می‌سازیم
        if (!cartFound) {
          try {
            const { regions } = await medusaClient.store.region.list({ limit: 1 });
            if (regions.length > 0) {
              const { cart } = await medusaClient.store.cart.create({
                region_id: regions[0].id,
              });
              set({ 
                cartId: cart.id, 
                items: [], 
                currencyCode: cart.currency_code 
              });
              console.log("✅ New Cart Created:", cart.id);
            }
          } catch (e) {
            console.error("❌ Failed to create new cart:", e);
          }
        }
      },

      addItem: async (variantId: string, quantity: number) => {
        // اطمینان از اینکه سبد خرید وجود دارد
        let { cartId } = get();
        if (!cartId) {
          await get().initializeCart();
          cartId = get().cartId;
        }

        if (cartId) {
          try {
            const { cart } = await medusaClient.store.cart.createLineItem(
              cartId,
              {
                variant_id: variantId,
                quantity: quantity,
              }
            );
            
            set({ 
              items: cart.items || [], 
              currencyCode: cart.currency_code,
              isOpen: true 
            });
          } catch (error) {
            console.error("❌ Error adding item:", error);
            // اگر موقع افزودن خطا داد (مثلاً سبد خرید وسط کار پاک شد)، دوباره اینیشیالایز کن
            await get().initializeCart();
          }
        }
      },

      removeItem: async (lineId: string) => {
        const cartId = get().cartId;
        const BASE_URL = MEDUSA_BACKEND_URL;

        if (!cartId) return;

        try {
          const res = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items/${lineId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY, // 👈 کلید صحیح اینجا ارسال می‌شود
            },
          });

          if (!res.ok) {
            console.error("❌ API Error:", await res.text());
            return;
          }

          const data = await res.json();
          const updatedCart = data.cart || data;

          if (updatedCart && updatedCart.items) {
            set({ 
              items: updatedCart.items,
              cartId: updatedCart.id 
            });
          } else {
            // حذف خوش‌بینانه (Optimistic update)
            set((state) => ({
                items: state.items.filter((item: any) => item.id !== lineId)
            }));
          }

        } catch (error) {
          console.error("💥 Network Error:", error);
        }
      },
    }),
    {
      name: "medusa-cart-storage",
      partialize: (state) => ({ cartId: state.cartId }),
    }
  )
);