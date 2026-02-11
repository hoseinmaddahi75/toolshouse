import { medusaClient } from "@/lib/medusa-client";
import ProductCard from "@/components/modules/products/ProductCard";
import StoreBreadcrumb from "@/components/store/store-breadcrumb";
import Pagination from "@/components/store/pagination";
import FilterSidebar from "@/components/store/filter-sidebar";
import MobileFilter from "@/components/store/mobile-filter";

export const dynamic = "force-dynamic";

// 👇👇👇 ۱. این همان "مترجم" است که در صفحه اصلی داشتید ولی اینجا گم شده بود!
const mapMedusaProductToType = (medusaProduct: any) => {
  return {
    ...medusaProduct, // کپی همه فیلدها
    variants: medusaProduct.variants?.map((v: any) => ({
      ...v,
      // ✅ اینجاست که جادو اتفاق می‌افتد:
      // اگر قیمت محاسبه شده وجود دارد، آن را تبدیل به یک فرمت استاندارد داخل آرایه prices می‌کنیم
      // تا ProductCard بتواند آن را بخواند.
      prices: v.calculated_price 
        ? [
            { 
              amount: v.calculated_price.calculated_amount, 
              currency_code: v.calculated_price.currency_code 
            },
            ...(v.prices || []) // قیمت‌های خام را هم نگه دار
          ]
        : (v.prices || []) // اگر محاسبه نشد، همان خام‌ها را بفرست
    })) || [],
  };
};

type Props = {
  searchParams: Promise<{
    page?: string;
    category_id?: string | string[];
  }>;
};

async function getRegion() {
  try {
    const { regions } = await medusaClient.store.region.list({ limit: 1 });
    return regions[0];
  } catch (e) {
    return null;
  }
}

async function getCategories() {
  const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
  try {
    const res = await fetch(`${baseUrl}/store/product-categories?parent_category_id=null&include_descendants_tree=true&limit=100`, {
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": apiKey || "",
      },
      next: { revalidate: 3600 } 
    });
    if (!res.ok) return { product_categories: [] };
    return await res.json();
  } catch (error) {
    return { product_categories: [] }; 
  }
}

export default async function StorePage({ searchParams }: Props) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const limit = 12; 
  const offset = (page - 1) * limit;
  const categoryIds = Array.isArray(params.category_id) 
    ? params.category_id : params.category_id ? [params.category_id] : undefined;

  const region = await getRegion();

  const [productsRes, categoriesRes] = await Promise.all([
    medusaClient.store.product.list({
      limit,
      offset,
      category_id: categoryIds,
      region_id: region?.id,
      // درخواست همه فیلدهای لازم
      fields: "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.prices,+title,+thumbnail,+handle,+description,+images,+options",
    }),
    getCategories()
  ]);

  const { products: rawProducts, count } = productsRes; // اسمش را گذاشتیم rawProducts
  const categories = categoriesRes.product_categories || [];

  // 👇👇👇 ۲. اینجا داده‌های خام را "ترجمه" می‌کنیم
  const products = rawProducts.map(mapMedusaProductToType);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <StoreBreadcrumb title="فروشگاه" />
      <div className="container mx-auto px-4 py-8 max-w-[1440px]">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">فروشگاه</h1>
                <MobileFilter categories={categories} />
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <FilterSidebar categories={categories} />
          <main className="flex-1 w-full">
            {products.length === 0 ? (
              <div className="flex flex-col h-64 items-center justify-center border border-dashed rounded-xl bg-gray-50">
                <p className="text-gray-500 text-lg font-medium">محصولی یافت نشد.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {products.length > 0 && totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                    <Pagination page={page} totalPages={totalPages} />
                </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}