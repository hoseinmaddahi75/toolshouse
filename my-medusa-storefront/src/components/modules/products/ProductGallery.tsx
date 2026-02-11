"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils"; // اگر ندارید، کلاس‌های معمولی بنویسید

type ProductGalleryProps = {
  images: { id: string; url: string }[] | null;
  thumbnail: string | null;
};

export default function ProductGallery({ images, thumbnail }: ProductGalleryProps) {
  // اگر تصویری نبود، فقط تامنیل را نشان بده
  const allImages = images && images.length > 0 
    ? images 
    : (thumbnail ? [{ id: "thumb", url: thumbnail }] : []);

  const [mainImage, setMainImage] = useState(allImages[0]?.url || "");

  if (allImages.length === 0) {
    return <div className="aspect-[4/4] bg-gray-100 flex items-center justify-center text-gray-400 rounded-xl">تصویر ندارد</div>;
  }

  return (
    <div className="flex flex-col gap-4 sticky top-24">
      {/* تصویر اصلی */}
      <div className="relative aspect-[4/4] w-full overflow-hidden rounded-2xl bg-gray-100 border border-gray-100">
        <Image
          src={mainImage}
          alt="Product Image"
          fill
          className="object-cover"
          priority
          unoptimized={true}
        />
      </div>

      {/* لیست تصاویر کوچک */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {allImages.map((img) => (
          <button
            key={img.id}
            onClick={() => setMainImage(img.url)}
            className={cn(
              "relative w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
              mainImage === img.url ? "border-black" : "border-transparent opacity-70 hover:opacity-100"
            )}
          >
            <Image src={img.url} alt="Gallery" fill className="object-cover" unoptimized={true} />
          </button>
        ))}
      </div>
    </div>
  );
}