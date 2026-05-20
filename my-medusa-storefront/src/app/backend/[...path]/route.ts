import { NextRequest, NextResponse } from "next/server";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

const BACKEND_URL = MEDUSA_BACKEND_URL;

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  // ۱. استخراج مسیر (مثلاً store/carts/...)
  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");
  const query = req.nextUrl.search; // کوئری‌ها را هم نگه می‌داریم
  const targetUrl = `${BACKEND_URL}/${path}${query}`;

  // ۲. آماده‌سازی هدرها
  const headers = new Headers(req.headers);
  headers.delete("host"); // هاست باید عوض شود
  headers.delete("connection");

  // ۳. خواندن بادی (اگر POST/PUT بود)
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();

  try {
    // ۴. ارسال درخواست به مدوسا
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
      cache: "no-store", // کش نکن
    });

    // ۵. دریافت پاسخ و برگرداندن به فرانت
    const data = await response.arrayBuffer();
    const responseHeaders = new Headers(response.headers);
    
    // حذف هدرهای CORS مزاحم (چون الان روی یک دامنه هستیم)
    responseHeaders.delete("access-control-allow-origin");

    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: "Backend Connection Failed" }, { status: 502 });
  }
}

// تمام متدها را به این هندلر وصل می‌کنیم
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const OPTIONS = handler;