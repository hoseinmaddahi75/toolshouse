import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

// متد دریافت اطلاعات
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.headers["x-customer-id"] as string;

  if (!customerId) return res.status(401).json({ message: "شناسه مشتری نامعتبر است" });

  try {
    const customerModule: any = req.scope.resolve("customer");
    
    // استفاده از retrieveCustomer برای دریافت تکی
    const customer = await customerModule.retrieveCustomer(customerId).catch(() => null);
    
    if (!customer) return res.status(404).json({ message: "مشتری یافت نشد" });

    return res.json({ customer });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

// متد ویرایش اطلاعات
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.headers["x-customer-id"] as string;
  const body = req.body as any;

  if (!customerId) return res.status(401).json({ message: "شناسه مشتری نامعتبر است" });

  try {
    const customerModule: any = req.scope.resolve("customer");

    // ۱. دریافت مشتری فعلی (با نام متد صحیح)
    const currentCustomer = await customerModule.retrieveCustomer(customerId);

    // ۲. آماده‌سازی داده‌ها (فقط چیزهایی که پر شده‌اند را آپدیت می‌کنیم)
    const updateData: any = {
      first_name: body.first_name || currentCustomer.first_name,
      last_name: body.last_name || currentCustomer.last_name,
      email: body.email || currentCustomer.email,
    };
    
    // اگر شماره موبایل در بادی بود آپدیت کن، وگرنه از قبلی استفاده کن
    // (این خط تضمین می‌کند شماره موبایل هیچ‌وقت نپرد)
    if (body.phone) {
        updateData.phone = body.phone;
    } else {
        // برای محکم‌کاری، شماره قبلی را دوباره ست نمی‌کنیم چون خود مدوسا نگه می‌دارد
        // اما اگر نگرانی، می‌توانی این خط را بگذاری:
        // updateData.phone = currentCustomer.phone;
    }

    // ۳. اعمال تغییرات
    const updatedCustomer = await customerModule.updateCustomers(customerId, updateData);

    return res.json({ customer: updatedCustomer });

  } catch (error: any) {
    console.error("❌ Update Error:", error);
    return res.status(500).json({ message: "خطا در ویرایش: " + error.message });
  }
}