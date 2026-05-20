import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { fulfillmentId } = await req.json();
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
    const backendUrl = MEDUSA_BACKEND_URL;

    // لیست تمام آدرس‌های مشکوک که ممکن است دیتا آنجا باشد
    const endpoints = [
      { name: "STANDARD", url: `${backendUrl}/admin/fulfillments/${fulfillmentId}` },
      { name: "WITH_LABELS_PLUS", url: `${backendUrl}/admin/fulfillments/${fulfillmentId}?fields=+labels` },
      { name: "WITH_DATA", url: `${backendUrl}/admin/fulfillments/${fulfillmentId}?fields=+data` },
      { name: "WITH_METADATA", url: `${backendUrl}/admin/fulfillments/${fulfillmentId}?fields=+metadata` },
      // تست مسیر شیپمنت که قبلاً ارور می‌داد
      { name: "SHIPMENT_DIRECT", url: `${backendUrl}/admin/fulfillments/${fulfillmentId}/shipment` }, 
    ];

    const results: any = {};

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep.url, {
          headers: { "Content-Type": "application/json", "Cookie": cookieHeader },
        });
        
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            results[ep.name] = await res.json();
        } else {
            results[ep.name] = `STATUS: ${res.status} (Non-JSON response)`;
        }
      } catch (e: any) {
        results[ep.name] = `ERROR: ${e.message}`;
      }
    }

    return NextResponse.json(results);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}