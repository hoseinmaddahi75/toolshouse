import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export interface Review {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string | null;
  created_at: string;
}

export async function getReviews(): Promise<Review[]> {
  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/reviews`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",      },
      next: { revalidate: 0 }, 
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Medusa API Error:", errorText);
      // به جای پرتاب خطا، آرایه خالی برمی‌گردانیم تا صفحه اصلی بالا بیاید
      return []; 
    }

    const data = await res.json();
    return data.reviews || [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return []; // در صورت قطعی سرور هم سایت بالا می‌ماند
  }
}