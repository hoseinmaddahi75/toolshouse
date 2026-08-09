import { medusaClient } from "@/lib/medusa-client";
import ProductCard from "@/components/modules/products/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

/**
 * Maps a raw Medusa product response to the internal product format.
 */
const mapMedusaProductToType = (medusaProduct: any) => {
  return {
    ...medusaProduct,
    variants:
      medusaProduct.variants?.map((v: any) => ({
        ...v,
        prices: v.calculated_price
          ? [
              {
                amount: v.calculated_price.calculated_amount,
                original_amount: v.calculated_price.original_amount,
                currency_code: v.calculated_price.currency_code,
              },
              ...(v.prices || []),
            ]
          : v.prices || [],
      })) || [],
  };
};

interface RelatedProductsProps {
  product: any;
  regionId: string;
}

/**
 * Fetches and displays related products in a carousel.
 * Limits to 12 products.
 */
export default async function RelatedProducts({ product, regionId }: RelatedProductsProps) {
  let relatedProducts: any[] = [];
  const manualIds = product?.metadata?.related_product_ids as string[] | undefined;

  try {
    if (manualIds && Array.isArray(manualIds) && manualIds.length > 0) {
      const { products } = await medusaClient.store.product.list({
        id: manualIds,
        region_id: regionId,
        limit: 12,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.prices,+title,+thumbnail,+handle,+options",
      });
      relatedProducts = products || [];
    } else if (product?.categories && product.categories.length > 0) {
      const categoryId = product.categories[0].id;

      const { products } = await medusaClient.store.product.list({
        category_id: [categoryId],
        region_id: regionId,
        limit: 13,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.prices,+title,+thumbnail,+handle,+options",
      });

      relatedProducts = (products || [])
        .filter((p: any) => p.id !== product.id)
        .slice(0, 12);
    }
  } catch (error) {
    console.error("Error fetching related products:", error);
  }

  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  const formattedProducts = relatedProducts.map((p: any) => mapMedusaProductToType(p));

  return (
    <section className="mt-16 pt-10 border-t border-gray-100" dir="rtl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">محصولات مرتبط</h2>
      </div>

      {/* 🟢 پدینگ را به جای px-10 به px-4 md:px-14 تغییر دادیم تا فلش‌ها فضای کافی داشته باشند */}
      <div className="px-4 md:px-14">
        <Carousel
          opts={{
            align: "start",
            direction: "rtl",
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {formattedProducts.map((p: any) => (
              <CarouselItem
                key={p.id}
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              >
                <div className="p-1">
                  <ProductCard product={p} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* 💡 اصلاح حیاتی فلش‌ها برای راست‌چین (RTL):
            - CarouselPrevious: دکمه "قبلی" سمت راست تنظیم می‌شود (left-auto -right-12) و فلش آن با (rotate-180) برعکس می‌شود.
            - CarouselNext: دکمه "بعدی" سمت چپ تنظیم می‌شود (right-auto -left-12) و فلش آن با (rotate-180) برعکس می‌شود.
          */}
          <CarouselPrevious className="hidden md:flex left-auto -right-12 rotate-180 bg-white hover:bg-gray-100 border-gray-200" />
          <CarouselNext className="hidden md:flex right-auto -left-12 rotate-180 bg-white hover:bg-gray-100 border-gray-200" />
        </Carousel>
      </div>
    </section>
  );
}