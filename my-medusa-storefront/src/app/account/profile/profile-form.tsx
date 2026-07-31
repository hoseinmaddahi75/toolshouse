"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

type CustomerProps = {
  customer: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  customerId: string;
};

export default function ProfileForm({ customer, customerId }: CustomerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [firstName, setFirstName] = useState(customer.first_name || "");
  const [lastName, setLastName] = useState(customer.last_name || "");
  const [email, setEmail] = useState(customer.email || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const BASE_URL = MEDUSA_BACKEND_URL;
    const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

    try {
      const res = await fetch(`${BASE_URL}/store/custom-auth/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY,
          "x-customer-id": customerId,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "خطا در ویرایش اطلاعات");
      }

      setMsg({ type: 'success', text: "اطلاعات با موفقیت بروزرسانی شد" });
      router.refresh();

    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {msg && (
        <div className={`p-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-black outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-black outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل (جهت اطلاع‌رسانی سفارش)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-black outline-none dir-ltr text-left"
          required
        />
        <p className="text-xs text-gray-500 mt-1">این ایمیل فقط برای ارسال فاکتور استفاده می‌شود.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل</label>
        <input
          type="text"
          value={customer.phone}
          disabled
          className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed dir-ltr text-left"
        />
        <p className="text-xs text-gray-400 mt-1">شماره موبایل قابل تغییر نیست.</p>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          ذخیره تغییرات
        </button>
      </div>
    </form>
  );
}
