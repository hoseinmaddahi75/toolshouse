import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.headers["x-customer-id"] as string;
  if (!customerId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["addresses.*"],
      filters: { id: customerId },
    });
    return res.json({ addresses: customers[0]?.addresses || [] });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.headers["x-customer-id"] as string;
  const body = req.body as any;

  if (!customerId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const customerModule = req.scope.resolve("customer") as any;

    const payload = {
        customer_id: customerId,
        first_name: body.first_name,
        last_name: body.last_name,
        phone: body.phone,
        company: body.company,
        address_1: body.address_1,
        city: body.city,
        country_code: "ir",
        province: body.province,
        postal_code: body.postal_code,
        metadata: {}
    };

    let address;

    // 🕵️‍♂️ راه حل نهایی: دسترسی مستقیم به سرویس داخلی آدرس
    // چون در لاگ شما 'customerAddressService_' وجود داشت
    if (customerModule.customerAddressService_) {
        console.log("✅ Using internal customerAddressService_");
        // سرویس داخلی معمولاً متد create دارد
        address = await customerModule.customerAddressService_.create(payload);
    } 
    // تلاش دوم: متد استاندارد createAddresses روی ماژول اصلی
    else if (typeof customerModule.createAddresses === 'function') {
        const res = await customerModule.createAddresses([payload]);
        address = res[0];
    }
    // تلاش سوم: متد قدیمی
    else if (typeof customerModule.addAddresses === 'function') {
        const res = await customerModule.addAddresses(customerId, [payload]);
        address = res[0];
    }
    else {
        throw new Error("سرویس آدرس پیدا نشد.");
    }

    return res.json({ success: true, address });

  } catch (error: any) {
    console.error("Create Address Error:", error);
    return res.status(500).json({ message: error.message });
  }
}