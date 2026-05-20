import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. دریافت کوکی‌ها
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join('; ');

    // 2. دریافت هدر Authorization (اگر فرانت فرستاده باشد)
    const authHeader = req.headers.get("authorization");

    const backendUrl = MEDUSA_BACKEND_URL;
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

    console.log(`📤 [Proxy] Sending to: ${backendUrl}/store/customers/me/addresses`);
    console.log(`🍪 [Proxy] Cookies count: ${allCookies.length}`);

    const medusaRes = await fetch(`${backendUrl}/store/customers/me/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
        "x-publishable-api-key": publishableKey || "",
        // اگر توکن Bearer هم داشته باشیم، می‌فرستیم (محکم‌کاری)
        ...(authHeader && { "Authorization": authHeader }),
      },
      body: JSON.stringify(body),
      cache: "no-store", // جلوگیری از کش شدن پاسخ‌های خطا
    });

    if (!medusaRes.ok) {
        const errorText = await medusaRes.text();
        console.error(`❌ [Proxy] Backend Error (${medusaRes.status}):`, errorText);
        return NextResponse.json({ message: errorText }, { status: medusaRes.status });
    }

    const data = await medusaRes.json();
    return NextResponse.json({ success: true, customer: data.customer });

  } catch (error: any) {
    console.error("💥 Proxy Fatal Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}