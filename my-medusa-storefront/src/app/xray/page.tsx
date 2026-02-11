import { cookies } from "next/headers";

// این یک Server Component است و مستقیماً روی سرور اجرا می‌شود
// بنابراین هیچ مشکل CORS یا دسترسی نخواهیم داشت.
export default async function XrayPage({ searchParams }: { searchParams: Promise<{ id: string }> }) {
  const { id } = await searchParams; // دریافت آیدی سفارش از آدرس
  
  if (!id) return <div className="p-10">Please add ?id=order_... to the URL</div>;

  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const cookieStore = await cookies();
  const headers = { 
    Cookie: cookieStore.toString(),
    "Content-Type": "application/json" 
  };

  const reports: any = {};

  // 1. تست استاندارد (سفارش معمولی)
  try {
    const res = await fetch(`${backendUrl}/admin/orders/${id}?fields=+fulfillments`, { headers });
    const json = await res.json();
    reports["1_ORDER_BASIC"] = json.order?.fulfillments?.[0] || "No Data";
  } catch (e: any) { reports["1_ERROR"] = e.message; }

  // 2. تست لیبل‌ها (با کوئری V2)
  try {
    const res = await fetch(`${backendUrl}/admin/orders/${id}?fields=+fulfillments.labels`, { headers });
    const json = await res.json();
    reports["2_ORDER_WITH_LABELS"] = json.order?.fulfillments?.[0]?.labels || "No Labels Found";
  } catch (e: any) { reports["2_ERROR"] = e.message; }

  // 3. تست ترکینگ نامبر (روش قدیمی)
  try {
    const res = await fetch(`${backendUrl}/admin/orders/${id}?fields=+fulfillments.tracking_numbers`, { headers });
    const json = await res.json();
    reports["3_ORDER_WITH_TRACKING_NUMBERS"] = json.order?.fulfillments?.[0]?.tracking_numbers || "No Tracking Nums";
  } catch (e: any) { reports["3_ERROR"] = e.message; }

  // 4. تست شیپمنت (روش جدید) - اگر ارور داد یعنی این فیلد وجود ندارد
  try {
    const res = await fetch(`${backendUrl}/admin/orders/${id}?fields=+fulfillments.shipment`, { headers });
    const json = await res.json();
    reports["4_ORDER_WITH_SHIPMENT"] = json.order?.fulfillments?.[0]?.shipment || "No Shipment Data";
  } catch (e: any) { reports["4_ERROR"] = e.message; }

  return (
    <div className="p-8 font-mono text-xs bg-gray-50 min-h-screen" dir="ltr">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">Medusa Order X-Ray 🩻</h1>
      <p className="mb-6 bg-yellow-100 p-2 border border-yellow-300 rounded">
        Searching for Tracking Code in Order ID: <strong>{id}</strong>
      </p>

      <div className="grid gap-6">
        {Object.entries(reports).map(([key, val]) => (
          <div key={key} className="border rounded bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-200 px-4 py-2 font-bold border-b text-gray-700">{key}</div>
            <pre className="p-4 overflow-auto max-h-60 text-blue-600">
              {JSON.stringify(val, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}