import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { updateCartWorkflow } from "@medusajs/medusa/core-flows"; // 👈 ایمپورت جریان کاری استاندارد

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const cartId = req.params.id;
  const body = req.body as any;
  const customerIdHeader = req.headers["x-customer-id"] as string;

  try {
    // استفاده از Workflow به جای Module برای محاسبه خودکار قیمت‌ها
    const { result: cart } = await updateCartWorkflow(req.scope).run({
      input: {
        id: cartId,
        email: body.email,
        shipping_address: body.shipping_address,
        billing_address: body.billing_address,
        customer_id: customerIdHeader || undefined, // اتصال مشتری
      },
    });

    return res.json({ cart });

  } catch (error: any) {
    console.error("❌ Cart Update Error:", error);
    return res.status(500).json({ message: error.message });
  }
}

// متد GET هم برای اطمینان از خروجی درست
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cartId = req.params.id;
  const { data: carts } = await req.scope.resolve("query").graph({
    entity: "cart",
    fields: ["*", "items.*", "region.*", "shipping_address.*", "payment_collection.*"],
    filters: { id: cartId },
  });
  return res.json({ cart: carts[0] });
}