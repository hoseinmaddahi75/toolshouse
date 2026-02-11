import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/data"; // تابعی که محصول را از مدوسا می‌گیرد
import ProductGallery from "@/components/modules/products/ProductGallery";
import ProductTabs from "@/components/modules/products/ProductTabs";
import ProductInfo from "@/components/modules/products/ProductInfo"; // 👈 کامپوننت جدید
import { TruckIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

type Props = {
  params: Promise<{ handle: string }>;
};

export default async function ProductPage(props: Props) {
  const params = await props.params;
  
  // دریافت محصول از بک‌‌اند (SSR)
  // مطمئن شوید که relations شامل 'variants' و 'options' باشد
  const product: any = await getProductByHandle(params.handle);

  if (!product) {
    notFound();
  }

  // متادیتا برای تب توضیحات کامل
  const fullDescription = (product.metadata?.full_description as string) || product.description;

  return (
    <div className="bg-white">
      <div className="container px-4 py-10 md:px-8 md:py-16 xl:px-[120px]">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ستون گالری تصاویر (چپ چین یا راست چین بسته به طراحی) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 order-1">
             <ProductGallery 
                images={product.images || []} 
                thumbnail={product.thumbnail || null} 
             />
          </div>

          {/* ستون اطلاعات محصول (کامپوننت تعاملی) */}
          <div className="lg:col-span-7 flex flex-col space-y-8 order-2">
            
            {/* 👈 استفاده از کامپوننت کلاینت ساید برای هندل کردن رنگ و سایز */}
            <ProductInfo product={product} />

            {/* باکس‌های اطمینان (استاتیک) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <div className="flex items-center gap-4 bg-[#F9F9F9] p-4 rounded-xl border border-gray-100">
                <TruckIcon className="w-8 h-8 text-[#B19276]" />
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-gray-900">ارسال رایگان</span>
                    <span className="text-xs text-gray-500">برای خریدهای بالای ۲ میلیون</span>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[#F9F9F9] p-4 rounded-xl border border-gray-100">
                <ShieldCheckIcon className="w-8 h-8 text-[#B19276]" />
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-gray-900">ضمانت اصالت</span>
                    <span className="text-xs text-gray-500">تضمین بازگشت وجه تا ۷ روز</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* بخش پایین: تب‌ها */}
        <ProductTabs product={product} />

      </div>
    </div>
  );
}