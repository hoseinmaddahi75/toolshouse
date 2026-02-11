import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/medusa-client";
import { CheckCircle, Package, ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import ClearCartEffect from "./clear-cart-effect"; // 👈 کامپوننت جدید که پایین‌تر می‌سازیم

export default async function OrderConfirmedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const BASE_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
  
  const cookieStore = await cookies();
  const customerId = cookieStore.get("_medusa_jwt")?.value;

  let order = null;

  try {
    // درخواست به API اصلاح شده (حتی بدون customerId هم کار می‌کند)
    let fetchUrl = `${BASE_URL}/store/custom-orders?id=${id}`;
    let headers: any = {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY,
    };

    if (customerId) headers["x-customer-id"] = customerId;

    // اضافه کردن timestamp برای جلوگیری از کش
    const res = await fetch(`${fetchUrl}&t=${Date.now()}`, { headers, cache: "no-store" });
    
    if (res.ok) {
        const data = await res.json();
        if (data.orders && data.orders.length > 0) {
            order = data.orders[0];
        }
    }
  } catch (e) {
    console.error("Fetch Order Error:", e);
  }

  if (!order) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
            <ClearCartEffect /> {/* 👈 پاکسازی سبد حتی در حالت خطا */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">سفارش با موفقیت ثبت شد!</h1>
                <p className="text-gray-500 mb-6">شماره پیگیری: <span className="font-mono font-bold text-black select-all">{id}</span></p>
                <div className="bg-yellow-50 text-yellow-800 text-sm p-4 rounded-xl mb-6 text-right">
                    سفارش شما در سیستم ثبت شده و پیامک تایید ارسال گردید. <br/>
                    <span className="text-xs opacity-75">در حال حاضر جزئیات سفارش قابل نمایش نیست، اما پردازش شروع شده است.</span>
                </div>
                <Link href="/">
                    <Button className="w-full bg-black text-white hover:bg-gray-800">بازگشت به فروشگاه</Button>
                </Link>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
        <ClearCartEffect /> {/* 👈 پاکسازی سبد در حالت موفق */}
        
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
                
                {/* هدر سبز */}
                <div className="bg-green-600 p-10 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-inner">
                            <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 tracking-tight">خرید شما با موفقیت انجام شد</h1>
                        <p className="opacity-90 text-lg">از اعتماد شما سپاسگزاریم.</p>
                    </div>
                </div>
                
                <div className="p-8 sm:p-10">
                    <div className="flex flex-col sm:flex-row justify-between items-center border-b border-dashed border-gray-200 pb-6 mb-8 gap-4">
                        <div className="text-center sm:text-right">
                            <span className="block text-gray-500 text-sm mb-1">شماره سفارش</span>
                            <span className="font-mono font-bold text-xl text-gray-900 tracking-wider">#{order.display_id}</span>
                        </div>
                        <div className="text-center sm:text-left">
                            <span className="block text-gray-500 text-sm mb-1">تاریخ ثبت</span>
                            <span className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString('fa-IR')}</span>
                        </div>
                    </div>

                    <div className="space-y-6 mb-10">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                            <Package className="w-5 h-5 text-gray-400"/>
                            اقلام سفارش
                        </h3>
                        <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center p-2 hover:bg-white rounded-xl transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-lg border flex items-center justify-center shrink-0">
                                            {/* اگر تصویر داشتید اینجا قرار دهید */}
                                            <span className="text-xs font-bold text-gray-400">IMG</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm sm:text-base">{item.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">تعداد: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-900">{formatPrice(item.unit_price * item.quantity, order.currency_code)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-2xl flex justify-between items-center mb-10 border border-green-100">
                        <span className="font-bold text-green-800 text-lg">مبلغ کل پرداخت شده</span>
                        <span className="font-black text-2xl text-green-700">{formatPrice(order.total, order.currency_code)}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/account/orders" className="w-full">
                            <Button variant="outline" className="w-full h-14 text-base border-gray-300 hover:bg-gray-50 hover:text-black transition-all">
                                پیگیری سفارشات
                            </Button>
                        </Link>
                        <Link href="/" className="w-full">
                            <Button className="w-full h-14 text-base bg-black hover:bg-gray-800 shadow-lg shadow-gray-200 transition-all flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4"/>
                                بازگشت به فروشگاه
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}