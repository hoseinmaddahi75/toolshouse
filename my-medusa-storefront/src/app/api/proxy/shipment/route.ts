import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  console.log("🚚 [PROXY-SHIPMENT] Request received");

  try {
    const body = await req.json();
    const { orderId, fulfillmentId, trackingNumber } = body;

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');

    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    const targetUrl = `${backendUrl}/admin/fulfillments/${fulfillmentId}/shipment`;
    
    console.log(`🔄 [PROXY-SHIPMENT] Forwarding to: ${targetUrl}`);

    // 👇 ساختار جدید و صحیح برای Medusa v2
    const payload = {
        labels: [
            {
                tracking_number: trackingNumber,
                tracking_url: `https://post.ir/${trackingNumber}`, // آدرس اختیاری برای ترکینگ
                label_url: "" // اختیاری
            }
        ],
        // این فیلدها در نسخه جدید حذف شده‌اند یا جایشان عوض شده، پس حذفشان می‌کنیم
        // tracking_numbers: ... (حذف شد)
        // no_notification: ... (حذف شد)
    };

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type");
    let responseData;

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      console.error("❌ [PROXY-SHIPMENT] Backend returned non-JSON:", text);
      responseData = { message: "Backend Error (Non-JSON response)", detail: text };
    }

    if (!response.ok) {
      console.error("❌ [PROXY-SHIPMENT] Backend Error:", response.status, responseData);
      return NextResponse.json(responseData, { status: response.status });
    }

    console.log("✅ [PROXY-SHIPMENT] Success!");
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error("💥 [PROXY-SHIPMENT CRASH]", error);
    return NextResponse.json(
      { message: "Internal Proxy Error", error: error.message },
      { status: 500 }
    );
  }
}