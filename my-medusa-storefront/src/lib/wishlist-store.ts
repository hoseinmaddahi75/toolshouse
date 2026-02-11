import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistItem {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  variants?: any[]; // برای محاسبه قیمت نیاز داریم
  options?: any[]; // برای رنگ‌ها نیاز داریم
}

interface WishlistState {
  items: WishlistItem[];
  toggleItem: (product: any) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleItem: (product) => {
        const { items } = get();
        const exists = items.find((i) => i.id === product.id);

        if (exists) {
          // اگر هست، حذفش کن
          set({ items: items.filter((i) => i.id !== product.id) });
        } else {
          // اگر نیست، اضافه‌اش کن
          // ما کل آبجکت محصول را ذخیره می‌کنیم تا بتوانیم در صفحه wishlist نمایش دهیم
          set({ items: [...items, product] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      isInWishlist: (id) => {
        return !!get().items.find((i) => i.id === id);
      },
    }),
    {
      name: 'medusa-wishlist-storage', // نام کلید در LocalStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);