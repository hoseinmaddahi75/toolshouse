"use client";

import { useState, useEffect, useRef } from "react";
import { medusaClient, formatPrice } from "@/lib/medusa-client";
import { X, Search, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  // بستن مودال وقتی صفحه تغییر کرد (کاربر روی یک محصول کلیک کرد)
  useEffect(() => {
    onClose();
  }, [pathname]);

  // فوکوس خودکار روی اینپوت وقتی مودال باز شد
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // جلوگیری از اسکرول صفحه وقتی مودال باز است
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // منطق جستجو (Debounce)
  useEffect(() => {
    const timer = setTimeout(async () => {
  if (query.length > 1) {
    setLoading(true);
    try {
      // 👇 اصلاح شده: حذف currency_code
      const { products } = await medusaClient.store.product.list({ 
        q: query, 
        limit: 5,
        // currency_code: "irr" ❌ این خط را پاک کنید
      });
      setResults(products);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  } else {
    setResults([]);
  }
}, 500);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white/95 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* هدر مودال (اینپوت) */}
      <div className="container mx-auto max-w-3xl pt-6 px-4">
        <div className="relative flex items-center gap-4 border-b border-gray-200 pb-4">
          <Search className="w-6 h-6 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="جستجو در محصولات..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xl md:text-2xl font-medium outline-none placeholder:text-gray-300 text-gray-900"
          />
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      </div>

      {/* نتایج */}
      <div className="container mx-auto max-w-3xl px-4 py-6 overflow-y-auto flex-1">
        
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : query.length > 0 && results.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            محصولی یافت نشد.
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((product) => (
              <Link 
                key={product.id} 
                href={`/products/${product.handle}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100"
              >
                {/* تصویر */}
                <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.thumbnail ? (
                    <Image src={product.thumbnail} alt={product.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Search className="w-4 h-4"/></div>
                  )}
                </div>

                {/* متن */}
                <div className="flex-1">
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {product.title}
                    </h4>
                    {/* قیمت */}
                    {product.variants?.[0]?.prices?.[0] && (
                        <p className="text-sm text-gray-500 mt-1">
                            {formatPrice(product.variants[0].prices[0].amount, product.variants[0].prices[0].currency_code)}
                        </p>
                    )}
                </div>

                <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:-translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}