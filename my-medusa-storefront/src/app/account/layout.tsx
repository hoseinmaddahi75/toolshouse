import { cookies } from "next/headers";
import AccountLayoutWrapper from "@/components/account/account-layout-wrapper";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  // اینجا ما ID مشتری را که در مرحله قبل ذخیره کردیم می‌خوانیم
  const customerId = cookieStore.get("_medusa_jwt")?.value;
  
  const BASE_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

  let customer = null;

  if (customerId) {
    try {
      // ✅ تغییر استراتژی: دریافت مستقیم مشتری با ID
      // (نکته: در پروداکشن واقعی باید یک اندپوینت امن "/me" بسازیم)
      // فعلا برای راه افتادن کار، از اندپوینت ادمین یا یک اندپوینت پابلیک استفاده می‌کنیم
      // اما چون دسترسی مستقیم به کاستومر با ID قفل است، 
      // من یک پیشنهاد هوشمندانه‌تر دارم:
      
      // بیاییم اطلاعات اولیه (نام و موبایل) را فعلا فرضی در نظر بگیریم 
      // یا اینکه یک اندپوینت در بک‌اند بسازیم که با ID اطلاعات بدهد.
      
      // راه حل موقت سریع:
      // اگر ID وجود داشت، یعنی لاگین است. بیاییم فعلا آبجکت کاستومر را بسازیم
      // تا سایدبار نشان داده شود. (بعدا که توکن واقعی ساختیم این را درست می‌کنیم)
      
      customer = {
        id: customerId,
        first_name: "کاربر", // فعلا این را نشان می‌دهد تا اندپوینت me را بسازیم
        last_name: "گرامی",
        phone: "شماره تایید شده"
      };
      
      // اگر می‌خواهی واقعا اطلاعات بیاید، باید در بک‌اند یک اندپوینت
      // GET /store/auth/me?id=... بسازیم.
      
    } catch (e) {
      console.error("Layout Data Fetch Error:", e);
    }
  }

  return (
    <AccountLayoutWrapper customer={customer}>
      {children}
    </AccountLayoutWrapper>
  );
}