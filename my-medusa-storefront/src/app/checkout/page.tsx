"use client";

import { useState, useEffect, Suspense } from "react";
import { useCartStore } from "@/lib/store";
import { calculateTapinShippingCost } from "./tapin-actions";
import { 
  updateCartAddressAction, 
  retrieveShippingOptions, 
  getCurrentCustomerAction,
  setShippingMethodAction, 
  ensureCartOwnership,
  applyPromotionAction,
  removePromotionAction
} from "./actions";
import CheckoutCartItems from "@/components/checkout/CheckoutCartItems";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Loader2, CheckCircle, MapPin, CreditCard, 
  Truck, Home, Plus, AlertCircle, TicketPercent, X 
} from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";
import TapinProvinceCitySelector from "@/components/checkout/TapinProvinceCitySelector";

export const dynamic = "force-dynamic";

async function getCartDetails(cartId: string) {
  const baseUrl = MEDUSA_BACKEND_URL;
  const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
  try {
    const query = "?fields=*items,*items.variant,+items.variant.weight,+payment_collection.payment_sessions,+discount_total,+subtotal,+total";
    
    const res = await fetch(`${baseUrl}/store/carts/${cartId}${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", "x-publishable-api-key": apiKey },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) { return null; }
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartId, initializeCart } = useCartStore();
  
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [step, setStep] = useState(1); 
  const [customer, setCustomer] = useState<any>(null);
  const [fullCart, setFullCart] = useState<any>(null);

  const [promoCode, setPromoCode] = useState("");
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [shippingAddress, setShippingAddress] = useState({
    first_name: "", 
    last_name: "", 
    address_1: "", 
    province: "", 
    city: "", 
    country_code: "ir", 
    postal_code: "", 
    phone: "",
  });

  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>("tapin_post");
  const [paymentSessions, setPaymentSessions] = useState<any[]>([]);
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<string>("");
  
  const [postCost, setPostCost] = useState(0);
  const [tipaxCost, setTipaxCost] = useState(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!cartId) await initializeCart();
      let currentCartId = cartId;
      if (!currentCartId) {
        try {
          const raw = localStorage.getItem("medusa-cart-storage");
          if (raw) currentCartId = JSON.parse(raw)?.state?.cartId || null;
        } catch {}
      }
      
      if (currentCartId) await ensureCartOwnership(currentCartId);

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
                setFullCart(data.cart);
                if (data.cart.email && !authCustomer?.email) setEmail(data.cart.email);
                if (data.cart.payment_collection?.payment_sessions?.length > 0) {
                    setPaymentSessions(data.cart.payment_collection.payment_sessions);
                }
            }
        }
      } catch (e) {} finally { setInitializing(false); }
    };
    init();
  }, [cartId]);

  useEffect(() => {
    if (fullCart?.shipping_address && !shippingAddress.province) {
      setShippingAddress(prev => ({
        ...prev,
        first_name: fullCart.shipping_address.first_name || prev.first_name,
        last_name: fullCart.shipping_address.last_name || prev.last_name,
        address_1: fullCart.shipping_address.address_1 || prev.address_1,
        province: fullCart.shipping_address.province || prev.province,
        city: fullCart.shipping_address.city || prev.city,
        postal_code: fullCart.shipping_address.postal_code || prev.postal_code,
        phone: fullCart.shipping_address.phone || prev.phone,
      }));
    }
  }, [fullCart?.shipping_address?.id]);

  const calculatedSubtotal = fullCart?.items?.reduce((acc: number, item: any) => {
    const price = item.unit_price || 0;
    const qty = item.quantity || 1;
    return acc + (price * qty);
  }, 0) || 0;

  const rawSubtotal = fullCart?.subtotal ?? calculatedSubtotal;
  const rawDiscount = fullCart?.discount_total ?? 0;

  const subtotalInToman = Math.round(rawSubtotal / 10);
  const discountInToman = Math.round(rawDiscount / 10);

  useEffect(() => {
    const fetchTapinCost = async () => {
      if (shippingAddress.province && shippingAddress.city && fullCart?.items?.length > 0) {
        setIsCalculatingShipping(true);
        
        const postRes = await calculateTapinShippingCost(shippingAddress, fullCart.items, 1, 2);
        if (postRes.success && postRes.cost > 0) setPostCost(postRes.cost);
        else setPostCost(0);

        const tipaxRes = await calculateTapinShippingCost(shippingAddress, fullCart.items, 3, 2);
        if (tipaxRes.success && tipaxRes.cost > 0) setTipaxCost(tipaxRes.cost);
        else setTipaxCost(0);

        setIsCalculatingShipping(false);
      }
    };
    
    fetchTapinCost();
  }, [
    shippingAddress.province, 
    shippingAddress.city, 
    shippingAddress.address_1,
    shippingAddress.postal_code,
    fullCart?.items?.length
  ]);

  const grandTotalInToman = Math.max(0, subtotalInToman - discountInToman);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment_status");
    const orderId = searchParams.get("order_id");
    if (paymentStatus === "success" && orderId) {
        useCartStore.setState({ cartId: null, items: [] });
        useCartStore.persist.clearStorage();
        router.push(`/order/confirmed/${orderId}`);
    }
  }, [searchParams, router]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !cartId) return;
    setIsPromoLoading(true);
    setPromoError("");
    const res = await applyPromotionAction(cartId, promoCode.trim());
    if (res.success && res.cart) {
      toast.success("کد تخفیف اعمال شد.");
      setPromoCode("");
      setFullCart(res.cart); 
    } else {
      setPromoError(res.error || "خطا در اعمال کد تخفیف");
    }
    setIsPromoLoading(false);
  };

  const handleRemovePromo = async (code: string) => {
    if (!cartId) return;
    setIsPromoLoading(true);
    const res = await removePromotionAction(cartId, code);
    if (res.success && res.cart) {
      toast.success("کد تخفیف حذف شد.");
      setFullCart(res.cart); 
    } else {
      toast.error(res.error || "خطا در حذف کد تخفیف");
    }
    setIsPromoLoading(false);
  };

  const handleSelectSavedAddress = (addr: any, showToast = true) => {
    setShippingAddress({
        first_name: addr.first_name || "", 
        last_name: addr.last_name || "",
        address_1: addr.address_1 || "", 
        province: addr.province || "", 
        city: addr.city || "",
        country_code: addr.country_code || "ir", 
        postal_code: addr.postal_code || "",
        phone: addr.phone || "",
    });
    if (!email && customer?.email) setEmail(customer.email);
    setEmailError("");
    if (showToast) toast.info("آدرس انتخاب شد");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      if (e.target.value.trim().length > 0) setEmailError(""); 
  };

  const handleSubmitAddress = async () => {
    if (!cartId) return;
    if (!shippingAddress.first_name.trim()) { toast.error("نام الزامی است"); return; }
    if (!shippingAddress.last_name.trim()) { toast.error("نام خانوادگی الزامی است"); return; }
    if (!shippingAddress.address_1.trim()) { toast.error("آدرس دقیق الزامی است"); return; }
    if (!shippingAddress.city.trim()) { toast.error("شهر الزامی است"); return; }
    if (!shippingAddress.postal_code.trim()) { toast.error("کدپستی الزامی است"); return; }
    if (!shippingAddress.phone.trim()) { toast.error("تلفن تماس الزامی است"); return; }

    if (!email || email.trim() === "") {
        setEmailError("لطفاً ایمیل خود را وارد کنید");
        toast.error("وارد کردن ایمیل الزامی است");
        document.getElementById("email-input")?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      }
      setStep(2); 
      toast.success("اطلاعات ثبت شد");
    } catch (error: any) { toast.error(error.message); } 
    finally { setLoading(false); }
  };

  const handleSubmitShipping = async () => {
    if (!cartId || !selectedShipping) return;
    setLoading(true);
    try {
      // استفاده از شناسه واقعی آپشن ارسال به جای استیت UI
      const optionId = shippingOptions.length > 0 ? shippingOptions[0].id : selectedShipping;
      
      const result = await setShippingMethodAction(cartId, optionId);
      if (!result.success) throw new Error((result as any).message || "خطا در ثبت روش ارسال");

      if (result.session) {
          const raw = result.session;
          const session = Array.isArray(raw) ? raw[0] : raw;
          if (session) {
              if (!session.provider_id) session.provider_id = "pp_zarinpal_zarinpal";
              setPaymentSessions([session]);
              setSelectedPaymentProvider(session.provider_id);
          }
      } else {
         const cartData = await getCartDetails(cartId);
         setPaymentSessions(cartData?.cart?.payment_collection?.payment_sessions || []);
      }
      
      setStep(3); 
    } catch (error: any) { 
      toast.error(error.message || "مشکلی در ثبت ارسال پیش آمد"); 
    } finally { 
      setLoading(false); 
    }
  };

  const extractPaymentUrl = (session: any): string | null => {
    if (!session) return null;
    const d = session.data;
    if (!d) return null;
    return d.payment_url || d.data?.payment_url || null;
  };

  const handleFinalPayment = async () => {
    if (searchParams.get("payment_status") === "success") return;
    if (!cartId || !selectedPaymentProvider) { toast.error("درگاه انتخاب نشده است"); return; }
    
    setLoading(true);
    try {
      const currentSession = paymentSessions.find(s => s.provider_id === selectedPaymentProvider);
      let paymentUrl = extractPaymentUrl(currentSession);

      if (paymentUrl) { window.location.href = paymentUrl; return; }

      const freshCartData = await getCartDetails(cartId);
      const freshSessions = freshCartData?.cart?.payment_collection?.payment_sessions || [];
      const session = freshSessions.find((s: any) => s.provider_id === selectedPaymentProvider);
      
      paymentUrl = extractPaymentUrl(session);
      if (paymentUrl) { window.location.href = paymentUrl; return; }
      
      throw new Error("لینک پرداخت یافت نشد.");
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };
  
  const handleClearAddress = () => {
    setShippingAddress({ first_name: "", last_name: "", address_1: "", province: "", city: "", country_code: "ir", postal_code: "", phone: "" });
  };

  if (initializing) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-10" dir="rtl">
      <div className="container px-4">
        <h1 className="text-3xl font-bold mb-10 text-center text-gray-800">تکمیل فرآیند خرید</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 max-w-6xl mx-auto">
          
          <div className="lg:col-span-8 space-y-6">
            
            <div className="mb-6">
              <CheckoutCartItems cart={fullCart} onCartUpdate={(updatedCart) => setFullCart(updatedCart)} />
            </div>

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
                                            className={`relative p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${shippingAddress.address_1 === addr.address_1 ? "bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm" : "bg-white border-gray-200 hover:border-blue-300"}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-sm text-gray-800">{addr.first_name} {addr.last_name}</span>
                                                {shippingAddress.address_1 === addr.address_1 && <CheckCircle className="w-4 h-4 text-blue-600"/>}
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{addr.province}، {addr.city}، {addr.address_1}</p>
                                        </div>
                                    ))}
                                    <div onClick={handleClearAddress} className="flex flex-col items-center justify-center p-3 rounded-lg border border-dashed border-gray-300 text-gray-500 cursor-pointer hover:bg-white hover:border-gray-400 hover:text-gray-700 transition-colors">
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
                            <Input id="email-input" value={email} onChange={handleEmailChange} className={`dir-ltr text-left ${emailError ? "border-red-500 focus-visible:ring-red-500 bg-red-50" : ""}`} placeholder="example@gmail.com" />
                        </div>

                        <div className="space-y-1"><Label>آدرس دقیق <span className="text-red-500">*</span></Label><Input value={shippingAddress.address_1} onChange={(e) => setShippingAddress({...shippingAddress, address_1: e.target.value})} /></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TapinProvinceCitySelector
                              defaultProvince={shippingAddress.province}
                              defaultCity={shippingAddress.city}
                              onProvinceChange={(val) => setShippingAddress(prev => ({ ...prev, province: val }))}
                              onCityChange={(val) => setShippingAddress(prev => ({ ...prev, city: val }))}
                            />
                            <div className="space-y-1">
                                <Label>کدپستی <span className="text-red-500">*</span></Label>
                                <Input value={shippingAddress.postal_code} onChange={(e) => setShippingAddress({...shippingAddress, postal_code: e.target.value})} className="dir-ltr text-right" />
                            </div>
                            <div className="space-y-1">
                                <Label>تلفن <span className="text-red-500">*</span></Label>
                                <Input value={shippingAddress.phone} onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})} className="dir-ltr text-right" />
                            </div>
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
                        <RadioGroup onValueChange={setSelectedShipping} value={selectedShipping} className="grid gap-3">
                            
                            <div className={`flex items-center space-x-reverse space-x-3 border p-4 rounded-xl cursor-pointer transition-all ${selectedShipping === "tapin_post" ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}>
                                <RadioGroupItem value="tapin_post" id="tapin_post" />
                                <Label htmlFor="tapin_post" className="flex-1 cursor-pointer flex justify-between pr-2 items-center">
                                    <span className="font-medium flex flex-col">
                                        <span>ارسال با پست پیشتاز</span>
                                        <span className="text-xs text-gray-500 font-normal mt-1">ارسال ایمن و رهگیری مرسوله</span>
                                    </span>
                                    <span className="font-bold text-gray-800 flex flex-col items-end gap-1">
                                        {isCalculatingShipping ? (
                                            <span className="flex items-center text-gray-500 text-xs font-normal">
                                                <Loader2 className="w-3 h-3 animate-spin ml-1" /> در حال استعلام...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <span className="text-sm text-gray-800">
                                                    {postCost > 0 ? `${new Intl.NumberFormat("fa-IR").format(postCost)} تومان` : "محاسبه در مقصد"}
                                                </span>
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px]">پس‌کرایه</span>
                                            </span>
                                        )}
                                    </span>
                                </Label>
                            </div>

                            <div className={`flex items-center space-x-reverse space-x-3 border p-4 rounded-xl cursor-pointer transition-all ${selectedShipping === "tapin_tipax" ? "border-orange-500 bg-orange-50" : "hover:bg-gray-50"}`}>
                                <RadioGroupItem value="tapin_tipax" id="tapin_tipax" />
                                <Label htmlFor="tapin_tipax" className="flex-1 cursor-pointer flex justify-between pr-2 items-center">
                                    <span className="font-medium flex flex-col">
                                        <span>ارسال با تیپاکس</span>
                                        <span className="text-xs text-gray-500 font-normal mt-1">ارسال سریع به سراسر کشور</span>
                                    </span>
                                    <span className="font-bold text-gray-800 flex flex-col items-end gap-1">
                                        {isCalculatingShipping ? (
                                            <span className="flex items-center text-gray-500 text-xs font-normal">
                                                <Loader2 className="w-3 h-3 animate-spin ml-1" /> در حال استعلام...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <span className="text-sm text-gray-800">
                                                    {tipaxCost > 0 ? `${new Intl.NumberFormat("fa-IR").format(tipaxCost)} تومان` : "ناموجود برای این شهر"}
                                                </span>
                                                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px]">پس‌کرایه</span>
                                            </span>
                                        )}
                                    </span>
                                </Label>
                            </div>

                            {shippingAddress.city?.includes("مشهد") && (
        <div className={`flex items-center space-x-reverse space-x-3 border p-4 rounded-xl cursor-pointer transition-all ${selectedShipping === "peyk_motori" ? "border-green-500 bg-green-50" : "hover:bg-gray-50"}`}>
            <RadioGroupItem value="peyk_motori" id="peyk_motori" />
            <Label htmlFor="peyk_motori" className="flex-1 cursor-pointer flex justify-between pr-2 items-center">
                <span className="font-medium flex flex-col">
                    <span>ارسال با پیک موتوری (ویژه مشهد)</span>
                    <span className="text-xs text-gray-500 font-normal mt-1">ارسال سریع - تسویه با پیک</span>
                </span>
                <span className="font-bold text-gray-800 flex flex-col items-end gap-1">
                    <span className="flex items-center gap-2">
                        <span className="text-sm text-gray-800">پس‌کرایه</span>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px]">درب منزل</span>
                    </span>
                </span>
            </Label>
        </div>
    )}

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
                        <p className="text-gray-600">
                            {selectedShipping === "tapin_post" ? "ارسال با پست پیشتاز (پس‌کرایه)" : "ارسال با تیپاکس (پس‌کرایه)"}
                        </p>
                        <Button variant="link" onClick={() => setStep(2)} className="text-blue-600">تغییر</Button>
                    </div>
                )}
            </CardContainer>

            <CardContainer active={step === 3} done={false} title="۳. پرداخت" icon={<CreditCard className="w-5 h-5"/>}>
                {step === 3 && (
                    <div className="space-y-6">
                        <p className="text-sm text-gray-500">لطفاً درگاه پرداخت مورد نظر خود را انتخاب کنید:</p>
                        <RadioGroup onValueChange={(val) => setSelectedPaymentProvider(val)} value={selectedPaymentProvider} className="grid gap-3">
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
                            <Button className="flex-[2] h-14 text-xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100 transition-transform active:scale-[0.98]" disabled={!selectedPaymentProvider || loading} onClick={handleFinalPayment}>
                                {loading ? <div className="flex items-center gap-2"><Loader2 className="animate-spin" /><span>در حال اتصال به بانک...</span></div> : "پرداخت و تکمیل خرید"}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContainer>
          </div>

          <div className="lg:col-span-4">
             <div className="sticky top-10 border rounded-2xl bg-white overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-4 border-b">
                    <h2 className="font-bold text-gray-800">خلاصه سفارش</h2>
                </div>
                
                <div className="p-4 space-y-4">
                    <div className="space-y-3 pb-4 border-b border-gray-100">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <TicketPercent className="w-4 h-4" /> کد تخفیف
                        </Label>
                        <div className="flex gap-2">
                            <Input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="کد تخفیف خود را وارد کنید" className="h-10 text-center dir-ltr flex-1" disabled={isPromoLoading} />
                            <Button onClick={handleApplyPromo} disabled={!promoCode.trim() || isPromoLoading} variant="secondary" className="h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6">
                                {isPromoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ثبت"}
                            </Button>
                        </div>
                        {promoError && <p className="text-red-500 text-xs">{promoError}</p>}

                        {fullCart?.promotions && fullCart.promotions.length > 0 && (
                            <div className="flex flex-col gap-2 mt-3">
                                {fullCart.promotions.map((promo: any) => (
                                    <div key={promo.id} className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-lg flex items-center justify-between w-full shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4"/>
                                            <span className="font-bold">{promo.code ? promo.code : 'تخفیف خودکار'}</span>
                                        </div>
                                        {promo.code && (
                                            <button onClick={() => handleRemovePromo(promo.code)} disabled={isPromoLoading} className="text-red-500 hover:bg-red-100 p-1 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between text-gray-600">
                        <span>جمع کل کالاها</span>
                        <span>{subtotalInToman > 0 ? `${new Intl.NumberFormat("fa-IR").format(subtotalInToman)} تومان` : "در حال محاسبه..."}</span>
                    </div>

                    {discountInToman > 0 && (
                        <div className="flex justify-between text-red-500 font-medium">
                            <span>تخفیف اعمال شده</span>
                            <span className="dir-ltr">- {new Intl.NumberFormat("fa-IR").format(discountInToman)} تومان</span>
                        </div>
                    )}

                    {step > 1 && (
                        <div className="flex justify-between items-center text-sm mt-4 pb-4 border-b border-gray-100">
                            <span className="text-gray-600">کرایه حمل تا مقصد:</span>
                            <span className="font-semibold flex flex-col items-end">
                                {isCalculatingShipping ? (
    <span className="flex items-center text-blue-500"><Loader2 className="w-3 h-3 animate-spin ml-1" /> در حال استعلام...</span>
) : selectedShipping === "tapin_post" ? (
    <span className="text-sm text-gray-800">{postCost > 0 ? `${new Intl.NumberFormat("fa-IR").format(postCost)} تومان` : "محاسبه در مقصد"}</span>
) : selectedShipping === "tapin_tipax" ? (
    <span className="text-sm text-gray-800">{tipaxCost > 0 ? `${new Intl.NumberFormat("fa-IR").format(tipaxCost)} تومان` : "ناموجود برای این شهر"}</span>
) : selectedShipping === "peyk_motori" ? (
    <span className="text-sm text-gray-800">پس‌کرایه (پرداخت به پیک)</span>
) : (
    <span className="text-gray-400 text-xs font-normal">تعیین پس از انتخاب آدرس</span>
)}
                                <span className="text-[10px] text-orange-600 font-normal mt-1 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                                    کرایه درب منزل توسط مامور دریافت می‌شود
                                </span>
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-center text-lg font-bold mt-4 pt-2">
                      <span>مبلغ قابل پرداخت (آنلاین):</span>
                      <span className="text-blue-600">
                        {grandTotalInToman > 0 ? `${new Intl.NumberFormat("fa-IR").format(grandTotalInToman)} تومان` : "---"}
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>}>
        <CheckoutContent />
    </Suspense>
  );
}

function CardContainer({ children, active, done, title, icon }: any) {
    return (
        <div className={`bg-white rounded-2xl border transition-all duration-500 ${active ? "shadow-lg ring-1 ring-blue-100 scale-100 opacity-100" : ""} ${!active && !done ? "opacity-50 grayscale" : ""} ${!active && done ? "opacity-90 bg-gray-50/50" : ""}`}>
            <div className={`p-5 flex items-center justify-between border-b ${active ? "bg-white" : "bg-gray-50"}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500"}`}>
                        {done ? <CheckCircle className="w-5 h-5"/> : icon}
                    </div>
                    <h2 className={`font-bold text-lg ${!active && "text-gray-500"}`}>{title}</h2>
                </div>
            </div>
            <div className={`p-6 transition-all duration-300 ${(!active && !done) ? "hidden" : "block"}`}>
                {children}
            </div>
        </div>
    );
}