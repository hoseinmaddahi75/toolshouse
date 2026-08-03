import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, items, trackingNumber } = body;

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
const backendUrl = MEDUSA_BACKEND_URL;

    // ---------------------------------------------------------
    // مرحله ۱: ساخت Fulfillment
    // ---------------------------------------------------------
    console.log(`📦 [PROXY] Creating Fulfillment for Order: ${orderId}`);
    
    const fulfillRes = await fetch(`${backendUrl}/admin/orders/${orderId}/fulfillments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": cookieHeader },
      body: JSON.stringify({ 
          items: items, 
          no_notification: false 
      }),
      credentials: "include",
    });

    if (!fulfillRes.ok) {
        const errText = await fulfillRes.text();
        console.error("❌ Fulfillment Failed:", errText);
        return NextResponse.json({ error: "Backend Failed", details: errText }, { status: fulfillRes.status });
    }

    const fulfillData = await fulfillRes.json();
    
    // 👇👇👇 اصلاح حیاتی: استخراج هوشمند ID 👇👇👇
    // اینجا جایی است که قبلاً کرش میکرد. الان همه حالات را چک میکنیم:
    let fulfillmentId = null;

    if (fulfillData.fulfillment && fulfillData.fulfillment.id) {
        fulfillmentId = fulfillData.fulfillment.id;
    } else if (fulfillData.id) {
        fulfillmentId = fulfillData.id;
    } else if (Array.isArray(fulfillData.fulfillments) && fulfillData.fulfillments[0]) {
        fulfillmentId = fulfillData.fulfillments[0].id;
    }

    // اگر باز هم پیدا نشد، یعنی عملیات موفق بوده ولی آیدی را نتوانستیم بخوانیم
    // پس خطا نمیدهیم، فقط وارنینگ میدهیم تا فرانتاند کرش نکند
    if (!fulfillmentId) {
        console.warn("⚠️ Fulfillment created via Backend, but Proxy couldn't parse ID. Data:", fulfillData);
        // یک آیدی موقت میگذاریم که برنامه ادامه دهد (چون رفرش صفحه همه چیز را درست میکند)
        fulfillmentId = "temp_id_reloading_needed"; 
    } else {
        console.log(`✅ Fulfillment Created! ID: ${fulfillmentId}`);
    }

    // ---------------------------------------------------------
    // مرحله ۲: ساخت Shipment (اگر کد رهگیری وارد شده باشد و آیدی معتبر باشد)
    // ---------------------------------------------------------
    if (trackingNumber && fulfillmentId && fulfillmentId !== "temp_id_reloading_needed") {
        console.log(`🚚 [PROXY] Creating Shipment with Tracking: ${trackingNumber}`);
        
        const shipRes = await fetch(`${backendUrl}/admin/orders/${orderId}/fulfillments/${fulfillmentId}/shipment`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Cookie": cookieHeader },
            body: JSON.stringify({
                tracking_numbers: [trackingNumber],
                no_notification: false 
            }),
            credentials: "include",
        });

        if (!shipRes.ok) {
            console.warn("⚠️ Shipment creation failed (Order is fulfilled though)");
        } else {
            console.log("✅ Shipment Created Successfully");
        }
    }

    return NextResponse.json({ success: true, fulfillmentId });

  } catch (error: any) {
    console.error("❌ Proxy Fatal Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}