import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/utils";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { order_id } = (req.body as { order_id?: string }) || {};

  if (!order_id) {
    return res.status(400).json({ error: "لطفا شناسه سفارش (order_id) را ارسال کنید." });
  }

  try {
    // گرفتن ماژول Event Bus مدوسا در نسخه ۲
    const eventBus = req.scope.resolve(Modules.EVENT_BUS);

    // شلیک دستیِ رویداد با سینتکس جدید Message در Medusa v2
    await eventBus.emit({
      name: "order.placed",
      data: { id: order_id }
    });

    return res.status(200).json({
      success: true,
      message: `رویداد ثبت سفارش برای ${order_id} با موفقیت شلیک شد! به ترمینال لاگ‌ها نگاه کنید.`
    });
  } catch (error: any) {
    console.error("Simulation error:", error);
    return res.status(500).json({ error: error.message });
  }
};