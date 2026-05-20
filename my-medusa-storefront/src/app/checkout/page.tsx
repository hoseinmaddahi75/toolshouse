"use client";

import { useState, useEffect, Suspense } from "react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/medusa-client";
import { 
  updateCartAddressAction, 
  retrieveShippingOptions, 
  getCurrentCustomerAction,
  setShippingMethodAction, 
  ensureCartOwnership
} from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, MapPin, CreditCard, Truck, Home, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

// تنظیمات صفحه
export const dynamic = "force-dynamic";

// --- توابع کمکی ---
async function getCartDetails(cartId: string) {
  const baseUrl = MEDUSA_BACKEND_URL;
  const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
  try {
    const res = await fetch(`${baseUrl}/store/carts/${cartId}?fields=+payment_collection.payment_sessions`, {
      method: "GET",
      headers: { "Content-Type": "application/json", "x-publishable-api-key": apiKey },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) { return null; }
}

// --- کامپوننت اصلی محتوا (منطق اصلی اینجاست) ---
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartId, items, initializeCart } = useCartStore();
  
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [step, setStep] = useState(1); 
  const [currencyCode, setCurrencyCode] = useState("irt");

  const [customer, setCustomer] = useState<any>(null);
  
  // استیت‌های فرم
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [shippingAddress, setShippingAddress] = useState({
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    country_code: "ir", 
    postal_code: "",
    phone: "",
  });

  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  
  const [paymentSessions, setPaymentSessions] = useState<any[]>([]);
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<string>("");

  // ۱. افکت اولیه
  useEffect(() => {
    const init = async () => {
      if (!cartId) await initializeCart();
      const currentCartId = cartId || localStorage.getItem("medusa_cart_id");
      
      if (currentCartId) {
          await ensureCartOwnership(currentCartId);
      }

      try {
        const authCustomer = await getCurrentCustomerAction();
        if (authCustomer) {
            setCustomer(authCustomer);
            if (authCustomer.email) setEmail(authCustomer.email);
            
            if (authCustomer.addresses?.length > 0) {
                handleSelectSavedAddress(authCustomer.addresses[0], false); 
            }
        }

        if (currentCartId) {
            const data = await getCartDetails(currentCartId);
            if (data?.cart) {
                setCurrencyCode(data.cart.region.currency_code);
                if (data.cart.email && !authCustomer?.email) {
                    setEmail(data.cart.email);
                }
                if (data.cart.payment_collection?.payment_sessions?.length > 0) {
                    setPaymentSessions(data.cart.payment_collection.payment_sessions);
                }
            }
        }
      } catch (e) { console.error(e); } finally { setInitializing(false); }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartId]);

  // ۲. هندل کردن بازگشت از بانک
  useEffect(() => {
    const paymentStatus = searchParams.get("payment_status");
    const orderId = searchParams.get("order_id");

    if (paymentStatus === "success" && orderId) {
        localStorage.removeItem("medusa_cart_id");
        useCartStore.setState({ cartId: null, items: [] });
        router.push(`/order/confirmed/${orderId}`);
    }
  }, [searchParams, router]);

  const handleSelectSavedAddress = (addr: any, showToast = true) => {
    setShippingAddress({
        first_name: addr.first_name || "",
        last_name: addr.last_name || "",
        address_1: addr.address_1 || "",
        city: addr.city || "",
        country_code: addr.country_code || "ir",
        postal_code: addr.postal_code || "",
        phone: addr.phone || "",
    });
    
    if (!email && customer?.email) {
        setEmail(customer.email);
    }
    
    setEmailError("");
    if (showToast) toast.info("آدرس انتخاب شد");
  };

  const handleClearAddress = () => {
      setShippingAddress({
        first_name: "",
        last_name: "",
        address_1: "",
        city: "",
        country_code: "ir",
        postal_code: "",
        phone: "",
      });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      if (e.target.value.trim().length > 0) {
          setEmailError(""); 
      }
  };

  const handleSubmitAddress = async () => {
    if (!cartId) return;

    if (!email || email.trim() === "") {
        setEmailError("لطفاً ایمیل خود را وارد کنید");
        toast.error("وارد کردن ایمیل الزامی است");
        const emailInput = document.getElementById("email-input");
        if(emailInput) emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setEmailError("فرمت ایمیل صحیح نیست.");
        toast.error("لطفاً یک ایمیل معتبر وارد کنید");
        return;
    }

    setLoading(true);
    try {
      const result = await updateCartAddressAction(cartId, shippingAddress, email);
      if (!result.success) throw new Error(result.error);

      const options = await retrieveShippingOptions(cartId);
      if (options?.length > 0) {
        setShippingOptions(options);
        setStep(2); 
        toast.success("اطلاعات ثبت شد");
      } else {
        toast.warning("روشی برای ارسال به این آدرس پیدا نشد");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally { setLoading(false); }
  };

  const handleSubmitShipping = async () => {
      if (!cartId || !selectedShipping) return;
      setLoading(true);
      try {
          const result = await setShippingMethodAction(cartId, selectedShipping);
          if (!result.success) throw new Error(result.error);

          if (result.session) {
              const newSession = result.session;
              if (!newSession.provider_id) newSession.provider_id = "pp_zarinpal_zarinpal";
              setPaymentSessions([newSession]); 
              setSelectedPaymentProvider(newSession.provider_id);
          } else {
             const cartData = await getCartDetails(cartId);
             setPaymentSessions(cartData?.cart?.payment_collection?.payment_sessions || []);
          }
          
          setStep(3); 
      } catch (error: any) {
          toast.error(error.message);
      } finally {
          setLoading(false);
      }
  };

  const handleSelectPayment = async (providerId: string) => {
      setSelectedPaymentProvider(providerId);
  };

  const handleFinalPayment = async () => {
    if (searchParams.get("payment_status") === "success") return;

    if (!cartId || !selectedPaymentProvider) {
        toast.error("درگاه انتخاب نشده است");
        return;
    }
    setLoading(true);
    
    try {
      const currentSession = paymentSessions.find(s => s.provider_id === selectedPaymentProvider);
      let paymentUrl = currentSession?.data?.payment_url || currentSession?.data?.data?.payment_url;

      if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
      }

      const freshCartData = await getCartDetails(cartId);
      const freshSessions = freshCartData?.cart?.payment_collection?.payment_sessions || [];
      const session = freshSessions.find((s: any) => s.provider_id === selectedPaymentProvider);
      
      paymentUrl = session?.data?.payment_url || session?.data?.data?.payment_url;

      if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
      }
      throw new Error("لینک پرداخت یافت نشد.");

    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  const subtotal = items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);

  if (initializing) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-10" dir="rtl">
      <div className="container px-4">
        <h1 className="text-3xl font-bold mb-10 text-center text-gray-800">تکمیل فرآیند خرید</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 max-w-6xl mx-auto">
          
          <div className="lg:col-span-8 space-y-6">
            <CardContainer active={step === 1} done={step > 1} title="۱. اطلاعات ارسال" icon={<MapPin className="w-5 h-5"/>}>
                {step === 1 ? (
                    <div className="space-y-4">
                        {customer?.addresses?.length > 0 && (
                            <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                <Label className="flex items-center gap-2 mb-3 text-blue-800">
                                    <Home className="w-4 h-4"/>
                                    انتخاب سریع از آدرس‌های ذخیره شده:
                                </Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {customer.addresses.map((addr: any) => (
                                        <div 
                                            key={addr.id} 
                                            onClick={() => handleSelectSavedAddress(addr)}
                                            className={`
                                                relative p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md
                                                ${shippingAddress.address_1 === addr.address_1 
                                                    ? "bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm" 
                                                    : "bg-white border-gray-200 hover:border-blue-300"}
                                            `}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-sm text-gray-800">{addr.first_name} {addr.last_name}</span>
                                                {shippingAddress.address_1 === addr.address_1 && <CheckCircle className="w-4 h-4 text-blue-600"/>}
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{addr.province}، {addr.city}، {addr.address_1}</p>
                                        </div>
                                    ))}
                                    
                                    <div 
                                        onClick={handleClearAddress}
                                        className="flex flex-col items-center justify-center p-3 rounded-lg border border-dashed border-gray-300 text-gray-500 cursor-pointer hover:bg-white hover:border-gray-400 hover:text-gray-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5 mb-1"/>
                                        <span className="text-xs">تایپ آدرس جدید</span>
                                    </div>
                                </div>
                                <div className="relative flex py-5 items-center">
                                    <div className="flex-grow border-t border-gray-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs bg-transparent">یا ویرایش دستی فیلدهای زیر</span>
                                    <div className="flex-grow border-t border-gray-200"></div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><Label>نام <span className="text-red-500">*</span></Label><Input value={shippingAddress.first_name} onChange={(e) => setShippingAddress({...shippingAddress, first_name: e.target.value})} /></div>
                            <div className="space-y-1"><Label>نام خانوادگی <span className="text-red-500">*</span></Label><Input value={shippingAddress.last_name} onChange={(e) => setShippingAddress({...shippingAddress, last_name: e.target.value})} /></div>
                        </div>
                        
                        <div className="space-y-1">
                            <Label className="flex justify-between">
                                <span>ایمیل <span className="text-red-500">*</span></span>
                                {emailError && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {emailError}</span>}
                            </Label>
                            <Input 
                                id="email-input"
                                value={email} 
                                onChange={handleEmailChange} 
                                className={`dir-ltr text-left ${emailError ? "border-red-500 focus-visible:ring-red-500 bg-red-50" : ""}`}
                                placeholder="example@gmail.com"
                            />
                        </div>

                        <div className="space-y-1"><Label>آدرس دقیق <span className="text-red-500">*</span></Label><Input value={shippingAddress.address_1} onChange={(e) => setShippingAddress({...shippingAddress, address_1: e.target.value})} /></div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1"><Label>شهر <span className="text-red-500">*</span></Label><Input value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} /></div>
                            <div className="space-y-1"><Label>کدپستی <span className="text-red-500">*</span></Label><Input value={shippingAddress.postal_code} onChange={(e) => setShippingAddress({...shippingAddress, postal_code: e.target.value})} className="dir-ltr text-right" /></div>
                            <div className="space-y-1"><Label>تلفن <span className="text-red-500">*</span></Label><Input value={shippingAddress.phone} onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})} className="dir-ltr text-right" /></div>
                        </div>
                        
                        <Button onClick={handleSubmitAddress} disabled={loading} className="w-full h-12 mt-4 text-lg bg-blue-600 hover:bg-blue-700">
                            {loading ? <Loader2 className="animate-spin" /> : "تایید آدرس و ادامه"}
                        </Button>
                    </div>
                ) : (
                    <div className="flex justify-between items-center text-sm">
                        <div>
                            <p className="font-bold">{shippingAddress.first_name} {shippingAddress.last_name}</p>
                            <p className="text-gray-600">{shippingAddress.address_1}، {shippingAddress.city}</p>
                            <p className="text-gray-400 text-xs mt-1">{email} | {shippingAddress.phone}</p>
                        </div>
                        <Button variant="link" onClick={() => setStep(1)} className="text-blue-600">ویرایش</Button>
                    </div>
                )}
            </CardContainer>

            <CardContainer active={step === 2} done={step > 2} title="۲. شیوه ارسال" icon={<Truck className="w-5 h-5"/>}>
                {step === 2 ? (
                    <div className="space-y-6">
                        <RadioGroup onValueChange={setSelectedShipping} className="grid gap-3">
                            {shippingOptions.map((option) => (
                                <div key={option.id} className={`flex items-center space-x-reverse space-x-3 border p-4 rounded-xl cursor-pointer transition-all ${selectedShipping === option.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}>
                                    <RadioGroupItem value={option.id} id={option.id} />
                                    <Label htmlFor={option.id} className="flex-1 cursor-pointer flex justify-between pr-2">
                                        <span className="font-medium">{option.name}</span>
                                        <span className="font-bold text-blue-600">{formatPrice(option.amount, currencyCode)}</span>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">بازگشت</Button>
                            <Button onClick={handleSubmitShipping} disabled={!selectedShipping || loading} className="flex-[2] h-12 text-lg bg-blue-600 hover:bg-blue-700">
                                {loading ? <Loader2 className="animate-spin" /> : "ادامه به پرداخت"}
                            </Button>
                        </div>
                    </div>
                ) : step > 2 && (
                    <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">روش انتخابی ثبت شد</p>
                        <Button variant="link" onClick={() => setStep(2)} className="text-blue-600">تغییر</Button>
                    </div>
                )}
            </CardContainer>

            <CardContainer active={step === 3} done={false} title="۳. پرداخت" icon={<CreditCard className="w-5 h-5"/>}>
                {step === 3 && (
                    <div className="space-y-6">
                        <p className="text-sm text-gray-500">لطفاً درگاه پرداخت مورد نظر خود را انتخاب کنید:</p>
                        
                        <RadioGroup onValueChange={handleSelectPayment} value={selectedPaymentProvider} className="grid gap-3">
                            {paymentSessions.length > 0 ? (
                                paymentSessions.map((session) => (
                                    <div key={session.id} className={`flex items-center space-x-reverse space-x-3 border p-4 rounded-xl cursor-pointer transition-all ${selectedPaymentProvider === session.provider_id ? "border-green-500 bg-green-50 ring-1 ring-green-500" : "hover:bg-gray-50"}`}>
                                        <RadioGroupItem value={session.provider_id} id={session.id} />
                                        <Label htmlFor={session.id} className="flex-1 cursor-pointer flex justify-between items-center pr-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-lg">
                                                    {session.provider_id.includes("zarinpal") ? "پرداخت امن زرین‌پال" : "پرداخت آنلاین"}
                                                </span>
                                            </div>
                                            {session.provider_id.includes("zarinpal") && (
                                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">پیشنهادی</span>
                                            )}
                                        </Label>
                                    </div>
                                ))
                            ) : (
                                <p className="text-red-500 text-sm">هیچ روش پرداختی برای این آدرس فعال نیست.</p>
                            )}
                        </RadioGroup>

                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-14">بازگشت</Button>
                            <Button 
                                className="flex-[2] h-14 text-xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100 transition-transform active:scale-[0.98]" 
                                disabled={!selectedPaymentProvider || loading}
                                onClick={handleFinalPayment}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" />
                                        <span>در حال اتصال به بانک...</span>
                                    </div>
                                ) : "پرداخت و تکمیل خرید"}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContainer>

          </div>

          <div className="lg:col-span-4">
             <div className="sticky top-10 border rounded-2xl bg-white overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-4 border-b">
                    <h2 className="font-bold">خلاصه سفارش</h2>
                </div>
                <div className="p-4 space-y-4">
                    <div className="flex justify-between"><span>جمع کل</span><span>{formatPrice(subtotal, currencyCode)}</span></div>
                    {selectedShipping && (
                        <div className="flex justify-between text-green-600">
                            <span>هزینه ارسال</span>
                            <span>{formatPrice(shippingOptions.find(o => o.id === selectedShipping)?.amount || 0, currencyCode)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xl font-black border-t pt-4">
                        <span>مبلغ نهایی</span>
                        <span>
                            {formatPrice(
                                subtotal + (selectedShipping ? (shippingOptions.find(o => o.id === selectedShipping)?.amount || 0) : 0),
                                currencyCode
                            )}
                        </span>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- کامپوننت پوششی (Wrapper) برای رفع ارور بیلد ---
export default function CheckoutPage() {
  return (
    <Suspense fallback={
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
        </div>
    }>
        <CheckoutContent />
    </Suspense>
  );
}

function CardContainer({ children, active, done, title, icon }: any) {
    return (
        <div className={`bg-white rounded-2xl border transition-all duration-500 
            ${active ? "shadow-lg ring-1 ring-blue-100 scale-100 opacity-100" : ""} 
            ${!active && !done ? "opacity-50 grayscale" : ""} 
            ${!active && done ? "opacity-90 bg-gray-50/50" : ""}
        `}>
            <div className={`p-5 flex items-center justify-between border-b ${active ? "bg-white" : "bg-gray-50"}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500"}`}>
                        {done ? <CheckCircle className="w-5 h-5"/> : icon}
                    </div>
                    <h2 className={`font-bold text-lg ${!active && "text-gray-500"}`}>{title}</h2>
                </div>
            </div>
            
            {/* اصلاحیه: محتوا فقط وقتی مخفی شود که نه فعال است و نه تمام شده */}
            <div className={`p-6 transition-all duration-300 ${(!active && !done) ? "hidden" : "block"}`}>
                {children}
            </div>
        </div>
    );
}