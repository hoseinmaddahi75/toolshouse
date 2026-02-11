// src/lib/data/reviews.ts

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
    const res = await fetch("http://localhost:9000/store/reviews", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 👇 کلید اصلاح شده (جدید)
        "x-publishable-api-key": "pk_82b953b964ad71f051bb02d1382200901c260d0e8628f845fd00856125b14336",
      },
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