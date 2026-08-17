import { Metadata } from "next";
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

// ----------------------------------------------------------------------
// ۱. تولید متادیتا، اُپن‌گراف (Open Graph) و توییتر کارد (منتقل شده برای سئو)
// ----------------------------------------------------------------------
export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const params = await props.params;
  const product: any = await getProductByHandle(params.handle);

  if (!product) {
    return { title: "محصول یافت نشد | خانه ابزار" };
  }

  // 🟢 نام برند به "خانه ابزار" تغییر یافت
  const seoTitle = product.metadata?.seo_title || `${product.title} | خانه ابزار`;
  const seoDescription = product.metadata?.seo_description || product.subtitle || "خرید اینترنتی انواع ابزارآلات از خانه ابزار";
  
  // آدرس دقیق این صفحه (برای تگ Canonical و OG Url)
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://khanehabzar.com";
  const productUrl = `${baseUrl}/products/${product.handle}`;
  
  // تصویر اصلی محصول برای شبکه‌های اجتماعی
  const ogImage = product.thumbnail || `${baseUrl}/images/default-og.jpg`;

  return {
    title: seoTitle,
    description: seoDescription,
    // تگ Canonical برای جلوگیری از مشکل صفحات تکراری
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: productUrl,
      siteName: "خانه ابزار",
      images: [
        {
          url: ogImage,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      locale: "fa_IR",
      type: "website", 
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [ogImage],
    },
  };
}

// ----------------------------------------------------------------------
// ۲. کامپوننت اصلی صفحه محصول (دیزاین خانه ابزار + تزریق اسکیما)
// ----------------------------------------------------------------------
export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  const region = await getRegion();
  const product: any = await getProductByHandle(params.handle);
  
  if (!product) {
    notFound();
  }

  // --- ساخت خودکار دیتای ساخت‌یافته (Schema Markup - Product) ---
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://khanehabzar.com";
  
  const priceAmount = product.variants?.[0]?.prices?.[0]?.amount || 0; 
  const isInStock = product.variants?.some((v: any) => v.inventory_quantity > 0);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.title,
      "image": product.thumbnail ? [product.thumbnail] : [],
      "description": product.metadata?.seo_description || product.subtitle || product.description,
      "sku": product.variants?.[0]?.sku || "",
      "offers": {
        "@type": "Offer",
        "url": `${baseUrl}/products/${product.handle}`,
        "priceCurrency": "IRR",
        "price": priceAmount,
        "availability": isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": { "@type": "Organization", "name": "خانه ابزار" }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "صفحه اصلی", "item": baseUrl },
        { "@type": "ListItem", "position": 2, "name": "فروشگاه", "item": `${baseUrl}/store` },
        { "@type": "ListItem", "position": 3, "name": product.title, "item": `${baseUrl}/products/${product.handle}` }
      ]
    }
  ];

  return (
    <div className="bg-white">
      {/* 🟢 تزریق اسکیما پنهان برای موتورهای جستجو */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto max-w-[1440px] px-4 py-10 md:px-8 md:py-16 xl:px-[120px]">
         
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          <div className="lg:col-span-5 lg:sticky lg:top-24 order-1">
             {/* 🟢 بدون پاس دادن title به ProductGallery تا دیزاین شما به هم نریزد */}
             <ProductGallery 
                images={product.images || []} 
                thumbnail={product.thumbnail || null} 
             />
          </div>

          <div className="lg:col-span-7 flex flex-col space-y-8 order-2">
             
            <ProductInfo product={product} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <div className="flex items-center gap-4 bg-[#F9F9F9] p-4 rounded-xl border border-gray-100">
                {/* 🟢 رنگ‌بندی خانه ابزار حفظ شد */}
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
                    {/* 🟢 متن خانه ابزار حفظ شد */}
                    <span className="text-xs text-gray-500">تضمین اصالت کالا برای کالاهای برند</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <ProductTabs product={product} />

        {/* 🟢 کدهای RelatedProducts در همان جای قبلی خودشان و بدون تغییر ظاهر ماندند */}
        {region && <RelatedProducts product={product} regionId={region.id} />}

      </div>
    </div>
  );
}