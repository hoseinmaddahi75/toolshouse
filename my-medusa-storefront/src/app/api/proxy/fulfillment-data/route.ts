import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, orderId } = body; // id = Fulfillment ID, orderId = Order ID

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
    
    const envBackend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
    const backendUrl = MEDUSA_BACKEND_URL;

    // 🎯 آدرس طلایی (کپی شده از پنل ادمین شما)
    // درخواست کل سفارش با فیلد مخصوص لیبل‌ها
    const url = `${backendUrl}/admin/orders/${orderId}?fields=*fulfillments.labels`;

    console.log(`🔌 [Proxy] Fetching Order from: ${url}`);

    const res = await fetch(url, {
      headers: { 
        "Content-Type": "application/json", 
        "Cookie": cookieHeader,
      },
    });

    if (!res.ok) {
        console.error(`❌ [Proxy] Backend Error: ${res.status}`);
        return NextResponse.json({ labels: [] });
    }

    const data = await res.json();
    const fetchedOrder = data.order;

    // پیدا کردن بسته مورد نظر از داخل لیست بسته‌های سفارش
    const targetFulfillment = fetchedOrder.fulfillments.find((f: any) => f.id === id);
    
    // استخراج لیبل‌ها
    const labels = targetFulfillment?.labels || [];

    console.log(`✅ [Proxy] Found ${labels.length} labels for fulfillment ${id}`);

    return NextResponse.json({ labels: labels });

  } catch (error: any) {
    console.error("💥 [Proxy] Internal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}