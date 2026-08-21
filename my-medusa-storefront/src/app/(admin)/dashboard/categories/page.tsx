import { Metadata } from "next";
import { medusaClient } from "@/lib/medusa-client";
import ProductCard from "@/components/modules/products/ProductCard";
import StoreBreadcrumb from "@/components/store/store-breadcrumb";
import Pagination from "@/components/store/pagination";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

// مترجم قیمت محصولات
const mapMedusaProductToType = (medusaProduct: any) => {
  return {
    ...medusaProduct,
    variants: medusaProduct.variants?.map((v: any) => ({
      ...v,
      prices: v.calculated_price 
        ? [
            { 
              amount: v.calculated_price.calculated_amount, 
              original_amount: v.calculated_price.original_amount,
              currency_code: v.calculated_price.currency_code 
            },
            ...(v.prices || [])
          ]
        : (v.prices || [])
    })) || [],
  };
};

type Props = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ page?: string }>;
};

async function getRegion() {
  try {
    const { regions } = await medusaClient.store.region.list({ limit: 1 });
    return regions[0];
  } catch (e) {
    return null;
  }
}

// گرفتن اطلاعات دسته‌بندی بر اساس Handle
async function getCategoryByHandle(handle: string) {
  const baseUrl = MEDUSA_BACKEND_URL;
  const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
  try {
    const res = await fetch(`${baseUrl}/store/product-categories?handle=${handle}`, {
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": apiKey || "",
      },
      next: { revalidate: 3600 } 
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product_categories?.[0] || null;
  } catch (error) {
    return null; 
  }
}

// ----------------------------------------------------------------------
// ۱. تولید متادیتا
// ----------------------------------------------------------------------
export async function generateMetadata(props: Props): Promise<Metadata> {
  const resolvedParams = await props.params;
  const category = await getCategoryByHandle(resolvedParams.handle);

  if (!category) {
    return { title: "دسته‌بندی یافت نشد | خانه ابزار" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://khanehabzar.com";
  const categoryUrl = `${baseUrl}/categories/${resolvedParams.handle}`; 

  const seoTitle = `${category.name} | خرید با بهترین قیمت | خانه ابزار`;
  const seoDescription = category.description || `خرید آنلاین انواع محصولات دسته‌بندی ${category.name} با بهترین قیمت، تضمین اصالت کالا و ارسال سریع به سراسر ایران در فروشگاه خانه ابزار.`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: categoryUrl, 
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: categoryUrl,
      siteName: "خانه ابزار", 
      locale: "fa_IR",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: seoTitle,
      description: seoDescription,
    }
  };
}

// ----------------------------------------------------------------------
// ۲. تابع کمکی برای بررسی موجودی
// ----------------------------------------------------------------------
const isProductAvailable = (product: any) => {
  if (!product.variants || product.variants.length === 0) return false;
  // کالا موجود است اگر نیازی به انبارداری نداشته باشد، یا پیش‌خرید آزاد باشد، یا موجودی بزرگتر از ۰ باشد
  return product.variants.some(
    (v: any) => !v.manage_inventory || v.allow_backorder || (v.inventory_quantity && v.inventory_quantity > 0)
  );
};

// ----------------------------------------------------------------------
// ۳. صفحه اصلی دسته‌بندی
// ----------------------------------------------------------------------
export default async function CategoryPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  
  const handle = resolvedParams.handle;
  // صفحه‌بندی کاربر (هر صفحه ۱۲ محصول)
  const currentPage = resolvedSearch.page ? parseInt(resolvedSearch.page) : 1;
  const ITEMS_PER_PAGE = 12;

  const [region, category] = await Promise.all([
    getRegion(),
    getCategoryByHandle(handle)
  ]);

  if (!category) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">دسته‌بندی یافت نشد</h1>
        <p className="text-gray-500">دسته‌بندی مورد نظر شما وجود ندارد یا حذف شده است.</p>
      </div>
    );
  }

  // 💡 ترفند طلایی: گرفتن تمام محصولات این دسته‌بندی (تا ۱۰۰ عدد) به صورت یکجا
  const productsRes = await medusaClient.store.product.list({
    limit: 100, // واکشی تعداد بالای محصولات تا سورت سراسری به درستی کار کند
    offset: 0,
    category_id: [category.id],
    region_id: region?.id,
    fields: "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.prices,+title,+thumbnail,+handle,+description,+images,+options",
  });

  const rawProducts = productsRes.products || [];

  // 💡 مرحله اول: مپ کردن و سورت کردن کل محصولات (موجودها بالا، ناموجودها پایین)
  const allSortedProducts = rawProducts
    .map(mapMedusaProductToType)
    .sort((a: any, b: any) => {
      const aAvailable = isProductAvailable(a);
      const bAvailable = isProductAvailable(b);

      if (aAvailable && !bAvailable) return -1; // a بیاد بالاتر
      if (!aAvailable && bAvailable) return 1;  // b بیاد بالاتر
      return 0; // اگر هر دو موجود یا ناموجود بودند، ترتیب پیش‌فرض مدوسا حفظ بشه
    });

  // 💡 مرحله دوم: برش زدن (Slice) محصولات برای صفحه‌ای که کاربر در آن قرار دارد
  const totalProductsCount = allSortedProducts.length;
  const totalPages = Math.ceil(totalProductsCount / ITEMS_PER_PAGE);
  
  // محاسبه ایندکس شروع و پایان برای آرایه
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  
  // محصولاتی که فقط در این صفحه رندر می‌شوند
  const displayedProducts = allSortedProducts.slice(startIndex, endIndex);

  // --- ساخت خودکار اسکیمای کالکشن ---
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://khanehabzar.com";
  const categoryUrl = `${baseUrl}/categories/${handle}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.name,
    "description": category.description || `لیست محصولات دسته‌بندی ${category.name}`,
    "url": categoryUrl,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": displayedProducts.map((product: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${baseUrl}/products/${product.handle}`,
        "name": product.title
      }))
    }
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <StoreBreadcrumb title={category.name} />
      <div className="container mx-auto px-4 py-8 max-w-[1440px]">
        
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{category.name}</h1>
          <p className="text-gray-500 text-sm mt-1">نمایش محصولات مرتبط با {category.name}</p>
        </div>

        <main className="w-full">
          {displayedProducts.length === 0 ? (
            <div className="flex flex-col h-64 items-center justify-center border border-dashed rounded-xl bg-gray-50">
              <p className="text-gray-500 text-lg font-medium">محصولی در این دسته‌بندی یافت نشد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {displayedProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* صفحه‌بندی بر اساس کل محصولات سورت شده */}
          {totalProductsCount > 0 && totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                  <Pagination page={currentPage} totalPages={totalPages} />
              </div>
          )}
        </main>
      </div>
    </div>
  );
}