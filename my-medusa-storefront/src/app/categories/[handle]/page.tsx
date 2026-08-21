import { Metadata } from "next";
import { medusaClient } from "@/lib/medusa-client";
import ProductCard from "@/components/modules/products/ProductCard";
import StoreBreadcrumb from "@/components/store/store-breadcrumb";
import Pagination from "@/components/store/pagination";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

// مترجم قیمت محصولات (مشابه صفحه فروشگاه)
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
// ۱. تولید متادیتا و اُپن‌گراف برای صفحه دسته‌بندی (اضافه شده برای خانه ابزار)
// ----------------------------------------------------------------------
export async function generateMetadata(props: Props): Promise<Metadata> {
  const resolvedParams = await props.params;
  const category = await getCategoryByHandle(resolvedParams.handle);

  if (!category) {
    return { title: "دسته‌بندی یافت نشد | خانه ابزار" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://toolshouse.ir";
  // 🟢 مسیر دسته‌بندی هماهنگ با سایت
  const categoryUrl = `${baseUrl}/categories/${resolvedParams.handle}`; 

  // 🟢 برندینگ خانه ابزار
  const seoTitle = `${category.name} | خرید با بهترین قیمت | خانه ابزار`;
  const seoDescription = category.description || `خرید آنلاین انواع محصولات دسته‌بندی ${category.name} با بهترین قیمت، تضمین اصالت کالا و ارسال سریع به سراسر ایران در فروشگاه خانه ابزار.`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: categoryUrl, // جلوگیری از صفحات تکراری ناشی از پارامترهای Pagination مثل ?page=2
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: categoryUrl,
      siteName: "خانه ابزار", // 🟢 تغییر به نام برند
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
// ۲. صفحه اصلی دسته‌بندی و تولید خودکار اسکیما
// ----------------------------------------------------------------------
export default async function CategoryPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  
  const handle = resolvedParams.handle;
  const page = resolvedSearch.page ? parseInt(resolvedSearch.page) : 1;
  const limit = 12; 
  const offset = (page - 1) * limit;

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

  // گرفتن محصولاتِ مربوط به این دسته‌بندی خاص
  const productsRes = await medusaClient.store.product.list({
    limit,
    offset,
    category_id: [category.id],
    region_id: region?.id,
    fields: "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.prices,+title,+thumbnail,+handle,+description,+images,+options",
  });

  const rawProducts = productsRes.products || [];
  const count = productsRes.count || 0;
  const products = rawProducts.map(mapMedusaProductToType);
  const totalPages = Math.ceil(count / limit);

  // --- ساخت خودکار اسکیمای کالکشن و لیست محصولات (ItemList & CollectionPage) ---
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://toolshouse.ir";
  const categoryUrl = `${baseUrl}/categories/${handle}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.name,
    "description": category.description || `لیست محصولات دسته‌بندی ${category.name}`,
    "url": categoryUrl,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": products.map((product: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1, // جایگاه محصول در این صفحه (برای سئو عالی است)
        "url": `${baseUrl}/products/${product.handle}`,
        "name": product.title
      }))
    }
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      
      {/* 🟢 تزریق اسکیما پنهان برای خزنده‌های گوگل */}
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
          {products.length === 0 ? (
            <div className="flex flex-col h-64 items-center justify-center border border-dashed rounded-xl bg-gray-50">
              <p className="text-gray-500 text-lg font-medium">محصولی در این دسته‌بندی یافت نشد.</p>
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
  );
}