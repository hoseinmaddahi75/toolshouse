import { medusaClient, formatPrice } from "@/lib/medusa-client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";


export default async function HomePage() {
  // دریافت لیست محصولات
  const { products } = await medusaClient.store.product.list({
    limit: 20,
    fields: "id,title,thumbnail,handle,variants.prices,variants.calculated_price"
  });
  
  // دریافت کد ارز پیش‌فرض
  const { regions } = await medusaClient.store.region.list();
  const currencyCode = regions[0]?.currency_code || "IRR";

  return (
    <div className="container mx-auto px-4 py-12">
      {/* بنر خوش‌آمدگویی */}
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          جدیدترین محصولات فصل
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          بهترین کیفیت را با ما تجربه کنید. ارسال سریع به سراسر کشور.
        </p>
      </div>

      {/* گرید محصولات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* 👇 تغییر اینجاست: اضافه کردن : any به ورودی مپ */}
        {products.map((product: any) => {
          // محاسبه قیمت (اولین واریانت)
          const price = product.variants?.[0]?.calculated_price?.calculated_amount || 0;

          return (
            <Link 
              href={`/products/${product.handle}`} 
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* عکس محصول */}
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                {product.thumbnail ? (
                  <Image 
                    src={product.thumbnail} 
                    alt={product.title || "Product Image"} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">بدون تصویر</div>
                )}
              </div>

              {/* اطلاعات محصول */}
              <div className="p-5">
                <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">
                  {product.title}
                </h3>
                <div className="flex items-center justify-between mt-4">
                   <span className="text-blue-600 font-bold text-lg">
                     {formatPrice(price, currencyCode)}
                   </span>
                   <Button size="sm" variant="outline" className="rounded-full px-4">
                     مشاهده
                   </Button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {products.length === 0 && (
         <div className="text-center py-20 text-gray-500">
             هیچ محصولی یافت نشد. لطفاً از پنل ادمین محصول اضافه کنید.
         </div>
      )}
    </div>
  );
}