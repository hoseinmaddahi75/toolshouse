"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store"; // مسیر استور خود را چک کنید

export default function ClearCartEffect() {
  useEffect(() => {
    console.log("🧹 Cleaning up cart data after success...");
    
    // ۱. پاک کردن از حافظه مرورگر
    localStorage.removeItem("medusa_cart_id");
    
    // ۲. ریست کردن استیت زوستاند
    useCartStore.setState({ 
        cartId: null, 
        items: [] 
    });
    
  }, []);

  return null; // این کامپوننت چیزی نمایش نمی‌دهد
}