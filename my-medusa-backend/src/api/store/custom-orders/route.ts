import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.headers["x-customer-id"] as string;
  const orderId = req.query.id as string; // دریافت ID از کوئری

  // 🟢 تغییر مهم: اگر آیدی سفارش را خواست، سخت‌گیری نکن (برای صفحه تایید سفارش)
  // اما اگر لیست کلی خواست، حتما باید مشتری باشد
  if (!customerId && !orderId) {
      return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    // ساخت فیلترها
    const filters: any = {};
    
    // اگر آیدی مشخص بود، فقط همان را بیاور (حتی بدون customer_id)
    if (orderId) {
        filters.id = orderId;
    } else {
        // اگر لیست می‌خواست، حتما باید مال خودش باشد
        filters.customer_id = customerId;
    }

    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id", "display_id", "created_at", "status", "currency_code", "email",
        "total", "subtotal", "tax_total", "discount_total", "shipping_total",
        "payment_status", "fulfillment_status",
        "items.*",
        "fulfillments.*",
        "fulfillments.labels.*",
        "shipping_address.*",
        "payment_collections.*"
      ],
      filters: filters,
    });

    // بازسازی دیتا (Sanitization)
    const cleanOrders = orders.map((order: any) => ({
        ...order,
        items: order.items || [],
        fulfillments: order.fulfillments || [],
        total: (order.total > 0) ? order.total : 
               (order.summary?.total > 0 ? order.summary.total : 
               (order.items?.reduce((acc:number, i:any) => acc + i.unit_price * (i.quantity||1), 0) || 0))
    }));

    return res.json({ orders: cleanOrders });

  } catch (error: any) {
    console.error("❌ API Error:", error.message);
    return res.json({ orders: [] }); 
  }
}