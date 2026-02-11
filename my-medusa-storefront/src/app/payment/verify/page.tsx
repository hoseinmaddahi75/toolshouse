"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  
  // زرین‌پال این دو پارامتر را در بازگشت می‌فرستد
  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6">نتیجه پرداخت</h1>
        
        <div className="space-y-4 text-right">
          <div className="flex justify-between border-b pb-2">
            <span className="font-mono text-gray-600">{status}</span>
            <span className="font-bold text-gray-800">وضعیت زرین‌پال:</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="font-mono text-xs text-gray-600 truncate max-w-[200px]">{authority}</span>
            <span className="font-bold text-gray-800">شناسه (Authority):</span>
          </div>
        </div>

        <div className="mt-8">
          {status === "OK" ? (
            <div className="p-4 bg-green-50 text-green-700 rounded-md mb-4 border border-green-200">
              پرداخت در زرین‌پال موفق بود!
              <br />
              <span className="text-sm text-green-600">در حال تایید نهایی... (فعلا نمایشی)</span>
            </div>
          ) : (
            <div className="p-4 bg-red-50 text-red-700 rounded-md mb-4 border border-red-200">
              پرداخت توسط کاربر لغو شد یا ناموفق بود.
            </div>
          )}
          
          <Link 
            href="/cart" 
            className="inline-block bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            بازگشت به سبد خرید
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading payment details...</div>}>
      <VerifyContent />
    </Suspense>
  );
}