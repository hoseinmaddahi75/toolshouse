import { getCollectionProducts } from "@/lib/data";
import ProductCard from "@/components/modules/products/ProductCard";
import { notFound } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// تعریف دیکشنری برای ترجمه نام دسته‌ها (چون هندل انگلیسی است)
const COLLECTION_TITLES: Record<string, string> = {
  all: "همه محصولات",
  new: "جدیدترین‌ها",
  summer: "کالکشن تابستانه",
};

type Props = {
  params: Promise<{ handle: string }>;
};

export default async function CollectionPage(props: Props) {
  const params = await props.params;
  const { handle } = params;

  // دریافت محصولات
  const products = await getCollectionProducts(handle);

  // پیدا کردن عنوان فارسی، اگر نبود خود هندل را نشان بده
  const title = COLLECTION_TITLES[handle] || handle;

  return (
    <div className="container px-4 py-8 md:px-8 md:py-12">
      
      {/* هدر دسته‌بندی */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            نمایش {products.length} محصول
          </p>
        </div>

        {/* بخش مرتب‌سازی (UI فعلاً نمایشی است) */}
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">مرتب‌سازی:</span>
            <Select>
                <SelectTrigger className="w-[180px] bg-white text-right" dir="rtl">
                    <SelectValue placeholder="پیش‌فرض" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                    <SelectItem value="created_at">جدیدترین</SelectItem>
                    <SelectItem value="price_asc">ارزان‌ترین</SelectItem>
                    <SelectItem value="price_desc">گران‌ترین</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* گرید محصولات */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
            <p className="text-lg text-gray-500">هیچ محصولی در این دسته پیدا نشد.</p>
        </div>
      )}
    </div>
  );
}