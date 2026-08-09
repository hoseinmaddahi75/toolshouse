import { notFound } from "next/navigation";
import { getProductByHandle, getRegion } from "@/lib/data";
import ProductGallery from "@/components/modules/products/ProductGallery";
import ProductTabs from "@/components/modules/products/ProductTabs";
import ProductInfo from "@/components/modules/products/ProductInfo";
import RelatedProducts from "@/components/admin/products/RelatedProducts";
import { TruckIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

/**
 * Renders the product detail page.
 * Fetches product and region data server-side, and displays the product gallery, info, tabs, and related products.
 */
export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  const region = await getRegion();
  const product: any = await getProductByHandle(params.handle);
  
  if (!product) {
    notFound();
  }
  
  return (
    <div className="bg-white">
      <div className="container mx-auto max-w-[1440px] px-4 py-10 md:px-8 md:py-16 xl:px-[120px]">
         
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          <div className="lg:col-span-5 lg:sticky lg:top-24 order-1">
             <ProductGallery 
                images={product.images || []} 
                thumbnail={product.thumbnail || null} 
             />
          </div>

          <div className="lg:col-span-7 flex flex-col space-y-8 order-2">
             
            <ProductInfo product={product} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <div className="flex items-center gap-4 bg-[#F9F9F9] p-4 rounded-xl border border-gray-100">
                <TruckIcon className="w-8 h-8 text-[#B19276]" />
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-gray-900">ارسال سریع</span>
                    <span className="text-xs text-gray-500">با پست و تیپاکس</span>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[#F9F9F9] p-4 rounded-xl border border-gray-100">
                <ShieldCheckIcon className="w-8 h-8 text-[#B19276]" />
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-gray-900">ضمانت اصالت</span>
                    <span className="text-xs text-gray-500">تضمین اصالت کالا برای کالاهای برند</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <ProductTabs product={product} />

        {region && <RelatedProducts product={product} regionId={region.id} />}

      </div>
    </div>
  );
}