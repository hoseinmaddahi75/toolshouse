"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // اگر نصب ندارید، با alert جایگزین کنید یا پکیجش را نصب کنید

interface AddToCartProps {
  variantId: string; // این خیلی مهمه
  available: boolean;
}

export default function AddToCart({ variantId, available }: AddToCartProps) {
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async () => {
    if (!available) return;
    
    setLoading(true);
    try {
      await addItem(variantId, 1);
      // نمایش پیام موفقیت (اختیاری)
      // alert("به سبد اضافه شد"); 
    } catch (error) {
      console.error(error);
      // alert("خطا در افزودن به سبد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      size="lg" 
      className="w-full" 
      onClick={handleAddToCart}
      disabled={!available || loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : available ? (
        "افزودن به سبد خرید"
      ) : (
        "ناموجود"
      )}
    </Button>
  );
}