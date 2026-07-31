import EditAddressForm from "./edit-form";
import { notFound } from "next/navigation";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";
import { getCustomerIdFromCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditAddressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const BASE_URL = MEDUSA_BACKEND_URL;
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
  
  const customerId = await getCustomerIdFromCookie();

  let address = null;

  if (customerId) {
    try {
      // دریافت لیست آدرس‌ها از API اختصاصی
      const res = await fetch(`${BASE_URL}/store/custom-addresses?t=${Date.now()}`, {
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY,
          "x-customer-id": customerId,
        },
        cache: "no-store",
      });
      
      if (res.ok) {
        const data = await res.json();
        const addresses = data.addresses || [];
        // پیدا کردن آدرس خاص
        address = addresses.find((addr: any) => addr.id === id);
      }
    } catch (e) {
      console.error("Fetch Edit Address Error:", e);
    }
  }

  if (!address) {
      return notFound();
  }

  return <EditAddressForm address={address} />;
}