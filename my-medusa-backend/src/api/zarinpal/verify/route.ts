import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { completeCartWorkflow } from "@medusajs/medusa/core-flows";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { Status, Authority } = req.query;
  const FRONTEND_URL = process.env.FRONTEND_URL || "https://toolshouse.ir";
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  if (Status !== "OK" || !Authority) {
      return res.redirect(`${FRONTEND_URL}/checkout?payment_status=failed`);
  }

  let cartId: string | null = null;

  try {
    const paymentModule = req.scope.resolve(Modules.PAYMENT);

    // ۱. پیدا کردن سشن
    const { data: paymentSessions } = await query.graph({
      entity: "payment_session",
      fields: ["id", "payment_collection.id", "payment_collection.cart.id"],
      filters: { data: { authority: Authority } },
    });

    if (!paymentSessions.length) {
       return res.redirect(`${FRONTEND_URL}/checkout?payment_status=session_not_found`);
    }

    const session = paymentSessions[0];
    cartId = session.payment_collection.cart.id;

    // ۲. تایید و کپچر
    const payment = await paymentModule.authorizePaymentSession(session.id, {});
    if (payment?.id) {
        await paymentModule.capturePayment({ payment_id: payment.id, amount: payment.amount }).catch(() => {});
    }

    // ۳. تکمیل سفارش
    const { result } = await completeCartWorkflow(req.scope).run({
      input: { id: cartId },
    });

    if (result?.id) {
        return res.redirect(`${FRONTEND_URL}/checkout?payment_status=success&order_id=${result.id}`);
    }

    throw new Error("Workflow failed");

  } catch (error: any) {
    console.error("Verify Error:", error);
    if (error.message.includes("completed")) {
         try {
           if (cartId) {
             const { data: orders } = await query.graph({
               entity: "order",
               fields: ["id"],
               filters: { cart_id: cartId },
             });
             if (orders?.length > 0) {
               return res.redirect(`${FRONTEND_URL}/checkout?payment_status=success&order_id=${orders[0].id}`);
             }
           }
         } catch {}
         return res.redirect(`${FRONTEND_URL}/checkout?payment_status=success`);
    }
    return res.redirect(`${FRONTEND_URL}/checkout?payment_status=error&message=${error.message}`);
  }
}
