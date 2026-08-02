"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, CheckCircle, Smartphone, KeyRound } from "lucide-react";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";
import { setOtpCookie } from "./actions";

export default function LoginForm() {
  const router = useRouter();
  
  // استیت‌ها: مدیریت مراحل (شماره -> کد)
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  // تنظیمات (این‌ها را بهتر است از env بخوانید)
  const BACKEND_URL = MEDUSA_BACKEND_URL;
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
  
  // مرحله ۱: ارسال درخواست کد تایید
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/store/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "خطا در ارسال پیامک");

      // موفقیت: رفتن به مرحله بعد
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // مرحله ۲: بررسی کد تایید و ورود
  const handleVerifyOtp = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch(`${BACKEND_URL}/store/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ phone, code: otp }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "کد اشتباه است");

    // ✅ ذخیره JWT به صورت httpOnly از طریق server action
    if (data.access_token) {
       await setOtpCookie(data.access_token);
    }

    // ریدایرکت
    router.push("/account");
    router.refresh(); 
    
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      
      {/* نمایش ارور */}
      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      {/* --- مرحله ۱: دریافت شماره موبایل --- */}
      {step === "phone" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="text-center mb-6">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-lg">ورود / ثبت‌نام</h3>
             <p className="text-gray-500 text-sm">شماره موبایل خود را وارد کنید</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              شماره موبایل
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-left dir-ltr placeholder:text-right"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ارسال کد تایید"}
          </button>
        </form>
      )}

      {/* --- مرحله ۲: وارد کردن کد تایید --- */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-6">
             <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-lg">تایید شماره</h3>
             <p className="text-gray-500 text-sm">کد ارسال شده به {phone} را وارد کنید</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              کد ۵ رقمی
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Wait for SMS..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-center tracking-[10px] text-lg font-bold"
              required
              maxLength={5}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                 تایید و ورود <CheckCircle className="w-4 h-4" />
                </>
            )}
          </button>

          {/* دکمه بازگشت برای ویرایش شماره */}
          <button
            type="button"
            onClick={() => { setStep("phone"); setError(""); }}
            className="w-full text-sm text-gray-500 hover:text-black flex items-center justify-center gap-1 py-2"
          >
            <ArrowRight className="w-3 h-3" />
            ویرایش شماره موبایل
          </button>
        </form>
      )}
    </div>
  );
}