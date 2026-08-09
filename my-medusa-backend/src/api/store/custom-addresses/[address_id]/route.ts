import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.headers["x-customer-id"] as string;
  const addressId = req.params.address_id;

  if (!customerId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const customerModule = req.scope.resolve("customer") as any;
    
    if (customerModule.customerAddressService_) {
        // 💡 در سرویس‌های داخلی، ID را درون آرایه پاس می‌دهیم
        await customerModule.customerAddressService_.delete([addressId]);
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Delete Address Error:", error);
    return res.status(500).json({ message: error.message });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.headers["x-customer-id"] as string;
  const addressId = req.params.address_id;
  const body = req.body as any;

  if (!customerId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const customerModule = req.scope.resolve("customer") as any;

    // 💡 دقت کن که id رو داخل خود دیتا قرار دادیم
    const payload = {
        id: addressId, 
        first_name: body.first_name,
        last_name: body.last_name,
        phone: body.phone,
        company: body.company,
        address_1: body.address_1,
        city: body.city,
        province: body.province,
        postal_code: body.postal_code,
    };

    if (customerModule.customerAddressService_) {
        // 💡 نکته طلایی: فقط یک پارامتر (به شکل آرایه) پاس می‌دهیم
        await customerModule.customerAddressService_.update([payload]);
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Update Address Error:", error);
    return res.status(500).json({ message: error.message });
  }
}