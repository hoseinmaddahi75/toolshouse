"use client";

import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/medusa-client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag } from "lucide-react";

export default function CartDrawer() {
  // ✅ currencyCode را از استور می‌گیریم
  const { items, isOpen, toggleCart, removeItem, currencyCode } = useCartStore();

  const subtotal = items.reduce((acc, item) => {
    return acc + item.unit_price * item.quantity;
  }, 0);

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-4 text-right">
          <SheetTitle>سبد خرید ({items.length})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-4">
            <ShoppingBag className="h-16 w-16 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">سبد خرید خالی است</p>
            <Button variant="outline" onClick={toggleCart}>
              بازگشت به فروشگاه
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <ul className="space-y-6">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          بدون عکس
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between space-x-2 space-x-reverse">
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium">
                            <Link href={`/products/${item.variant?.product?.handle || "#"}`}>
                              {item.title}
                            </Link>
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {item.variant?.title}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {/* ✅ استفاده از currencyCode اصلی سبد */}
                          {formatPrice(item.unit_price, currencyCode)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                           تعداد: {item.quantity}
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="border-t bg-gray-50 p-4 sm:px-6">
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between text-base font-medium">
                  <span>جمع کل</span>
                  {/* ✅ استفاده از currencyCode اصلی سبد */}
                  <span>{formatPrice(subtotal, currencyCode)}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  هزینه ارسال در مرحله بعد محاسبه می‌شود.
                </p>
                <Button className="w-full h-12 text-base" asChild>
                  <Link href="/checkout" onClick={toggleCart}>
                    تسویه حساب
                  </Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}