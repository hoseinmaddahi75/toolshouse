"use client";

import { Tab } from "@headlessui/react";
import clsx from "clsx";
import Image from "next/image";
import { PricedProduct } from "@medusajs/medusa/dist/types/pricing"; // اطمینان از ایمپورت تایپ
import ProductReviews from "./ProductReviews";

type Props = {
  product: PricedProduct; // ورودی اصلی فقط محصول است
};

export default function ProductTabs({ product }: Props) {
  // استخراج اطلاعات مورد نیاز از آبجکت محصول
  const { description, metadata, id } = product;
  
  const content = (metadata?.full_description as string) || description || "";
  const specs = metadata?.specifications || {};
  const hasSpecs = Object.keys(specs).length > 0;
  const sizeGuideUrl = metadata?.size_guide_url as string;

  // تعریف تب‌ها بر اساس موجود بودن اطلاعات
  const tabs = [
    { name: "توضیحات محصول", show: true },
    { name: "مشخصات فنی", show: hasSpecs },
    { name: "راهنمای سایز", show: !!sizeGuideUrl },
    { name: "نظرات کاربران", show: true },
  ].filter(t => t.show);

  return (
    <div className="w-full mt-16 border-t pt-10">
      <Tab.Group>
        {/* هدر تب‌ها */}
        <Tab.List className="flex gap-8 border-b border-gray-200 pb-1 overflow-x-auto">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }: { selected: boolean }) =>
                clsx(
                  "pb-3 text-sm font-medium outline-none border-b-2 transition-all whitespace-nowrap",
                  selected
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>

        {/* محتوای تب‌ها */}
        <Tab.Panels className="mt-8">
          
          {/* 1. تب توضیحات */}
          <Tab.Panel className="prose max-w-none text-gray-600 leading-8 text-justify">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </Tab.Panel>

          {/* 2. تب مشخصات فنی */}
          {hasSpecs && (
            <Tab.Panel>
              <div className="border rounded-xl overflow-hidden max-w-2xl">
                <table className="w-full text-sm text-right">
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(specs).map(([key, value]: any, idx) => (
                      <tr key={key} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="py-3 px-4 font-medium text-gray-900 w-1/3">{key}</td>
                        <td className="py-3 px-4 text-gray-600">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tab.Panel>
          )}

          {/* 3. تب راهنمای سایز */}
          {sizeGuideUrl && (
            <Tab.Panel>
              <div className="relative w-full max-w-3xl aspect-[16/9] border rounded-xl overflow-hidden bg-gray-50">
                <Image 
                  src={sizeGuideUrl} 
                  alt="راهنمای سایز" 
                  fill 
                  className="object-contain"
                  unoptimized // جلوگیری از خطای امنیتی لوکال‌هاست
                />
              </div>
            </Tab.Panel>
          )}

          {/* 4. تب نظرات کاربران */}
          <Tab.Panel>
              {id && <ProductReviews productId={id} />}
          </Tab.Panel>

        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}