// src/components/admin/create-product-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronRight, Plus, Loader2, ImagePlus, Trash2, 
  DollarSign, Box, Layers, RefreshCw, TableProperties, Ruler, AlertTriangle 
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import CategorySelector from "@/components/admin/category-selector";
import RichTextEditor from "@/components/admin/rich-text-editor";
import { toast } from "sonner";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

// --- تایپ‌ها ---
type GlobalAttribute = { id: string; title: string; values: { id: string; value: string }[]; };
type GeneratedVariant = { id: string; title: string; sku: string; price: string; inventory: string; options: Record<string, string>; };
type SpecTemplate = { id: string; title: string; fields: string[] };
type SizeGuide = { id: string; title: string; image_url: string };

const sanitizeHandle = (text: string) => {
  if (!text) return "";
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
};

export default function CreateProductForm({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingDefaults, setFetchingDefaults] = useState(true);
  const BASE_URL = MEDUSA_BACKEND_URL;

  const authHeaders = {
    "Authorization": `Bearer ${token}`
  };

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [images, setImages] = useState<{url: string, isThumbnail: boolean}[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [defaultSalesChannelId, setDefaultSalesChannelId] = useState("");
  const [defaultShippingProfileId, setDefaultShippingProfileId] = useState("");
  const [stockLocationId, setStockLocationId] = useState<string | null>(null);

  const [specTemplates, setSpecTemplates] = useState<SpecTemplate[]>([]);
  const [sizeGuides, setSizeGuides] = useState<SizeGuide[]>([]);
  const [selectedSpecId, setSelectedSpecId] = useState<string>("");
  const [specValues, setSpecValues] = useState<Record<string, string>>({});
  const [selectedSizeGuideId, setSelectedSizeGuideId] = useState<string>("");

  const [productType, setProductType] = useState<"simple" | "variable">("simple");
  const [globalAttributes, setGlobalAttributes] = useState<GlobalAttribute[]>([]);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string[]>>({});
  const [variants, setVariants] = useState<GeneratedVariant[]>([]);

  const [simplePrice, setSimplePrice] = useState("");
  const [simpleInventory, setSimpleInventory] = useState("");
  const [simpleSku, setSimpleSku] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingDefaults(true);
        const safeFetch = async (url: string) => {
          try {
            const res = await fetch(url, { headers: authHeaders, credentials: "include" });
            return res.ok ? res : null;
          } catch { return null; }
        };

        const [attrsRes, specsRes, sizesRes, scRes, spRes, locRes] = await Promise.all([
            safeFetch(`${BASE_URL}/admin/global-attributes`),
            safeFetch(`${BASE_URL}/admin/product-resources?type=specs`),
            safeFetch(`${BASE_URL}/admin/product-resources?type=sizes`),
            safeFetch(`${BASE_URL}/admin/sales-channels`),
            safeFetch(`${BASE_URL}/admin/shipping-profiles`),
            safeFetch(`${BASE_URL}/admin/stock-locations`),
        ]);

        if (attrsRes) { const data = await attrsRes.json(); setGlobalAttributes(data.attributes || data || []); }
        if (specsRes) { const data = await specsRes.json(); setSpecTemplates(data.data || []); }
        if (sizesRes) { const data = await sizesRes.json(); setSizeGuides(data.data || []); }

        if (scRes) { const scData = await scRes.json(); if (scData.sales_channels?.length > 0) setDefaultSalesChannelId(scData.sales_channels[0].id); }
        if (spRes) { const spData = await spRes.json(); const def = spData.shipping_profiles?.find((p: any) => p.type === "default") || spData.shipping_profiles?.[0]; if (def) setDefaultShippingProfileId(def.id); }
        if (locRes) { const locData = await locRes.json(); if (locData.stock_locations?.length > 0) setStockLocationId(locData.stock_locations[0].id); }

      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(error.message || "خطا در دریافت اطلاعات اولیه");
      } finally {
        setFetchingDefaults(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleSpecTemplateChange = (val: string) => { setSelectedSpecId(val); setSpecValues({}); };

  const handleCheckAttribute = (attrTitle: string, value: string, checked: boolean) => {
    setSelectedAttrs(prev => {
      const currentValues = prev[attrTitle] || [];
      let newValues;
      if (checked) newValues = [...currentValues, value];
      else newValues = currentValues.filter(v => v !== value);
      if (newValues.length === 0) { const { [attrTitle]: _, ...rest } = prev; return rest; }
      return { ...prev, [attrTitle]: newValues };
    });
  };

  const generateVariants = () => {
    const attrTitles = Object.keys(selectedAttrs);
    if (attrTitles.length === 0) return toast.warning("لطفا حداقل یک ویژگی را انتخاب کنید");

    const valuesArray = attrTitles.map(title => selectedAttrs[title]);
    const cartesian = (args: any[]) => {
      const r: any[] = [], max = args.length - 1;
      function helper(arr: any[], i: number) {
        for (let j = 0, l = args[i].length; j < l; j++) {
          const a = arr.slice(0); a.push(args[i][j]);
          if (i == max) r.push(a); else helper(a, i + 1);
        }
      }
      helper([], 0); return r;
    };

    const combinations = cartesian(valuesArray);
    const newVariants: GeneratedVariant[] = combinations.map((combo, idx) => {
        const variantOptions: Record<string, string> = {};
        const titleParts: string[] = [];
        combo.forEach((val: string, index: number) => {
          const optionTitle = attrTitles[index]; variantOptions[optionTitle] = val; titleParts.push(val);
        });
        return {
          id: `gen_${Date.now()}_${idx}`, title: titleParts.join(" / "), sku: "", price: "0", inventory: "0", options: variantOptions
        };
    });
    setVariants(newVariants);
    toast.success(`${newVariants.length} متغیر تولید شد`);
  };

  const updateVariantField = (id: string, field: keyof GeneratedVariant, value: string) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };
  const removeVariant = (id: string) => { setVariants(prev => prev.filter(v => v.id !== id)); };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("files", file);
      const toastId = toast.loading("در حال آپلود...");
      try {
        const res = await fetch(`${BASE_URL}/admin/uploads`, {
          method: "POST", body: formData, headers: { "Authorization": `Bearer ${token}` },
          credentials: "include"
        });
        if (!res.ok) throw new Error("خطا در آپلود");
        const data = await res.json();
        if (!data.files?.[0]?.url) throw new Error("پاسخ سرور نامعتبر");
        const isFirst = images.length === 0;
        setImages(prev => [...prev, { url: data.files[0].url, isThumbnail: isFirst }]);
        toast.dismiss(toastId); toast.success("تصویر آپلود شد");
      } catch (err) { toast.dismiss(toastId); toast.error("خطا در آپلود"); }
    }
  };
  const setAsThumbnail = (url: string) => setImages(prev => prev.map(img => ({ ...img, isThumbnail: img.url === url })));
  const removeImage = (url: string) => setImages(prev => prev.filter(img => img.url !== url));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("نام محصول الزامی است");
    if (productType === "simple" && !simplePrice) return toast.error("قیمت محصول ساده الزامی است");
    if (productType === "variable" && variants.length === 0) return toast.error("برای محصول متغیر حداقل یک واریانت لازم است");
    if (productType === "variable" && variants.some(v => !v.price || Number(v.price) <= 0)) return toast.error("تمام واریانت‌ها باید قیمت داشته باشند");
    
    setLoading(true);
    try {
      const thumbnailImg = images.find(i => i.isThumbnail) || images[0];
      let finalHandle = handle ? sanitizeHandle(handle) : sanitizeHandle(title);
      if (!finalHandle || finalHandle.length < 1) finalHandle = `product-${Date.now()}`;

      const metadata: any = { full_description: fullDescription };
      if (selectedSizeGuideId) {
          const selectedGuide = sizeGuides.find(g => g.id === selectedSizeGuideId);
          if (selectedGuide) { metadata.size_guide_id = selectedSizeGuideId; metadata.size_guide_url = selectedGuide.image_url; }
      }
      if (selectedSpecId) { metadata.spec_template_id = selectedSpecId; metadata.specifications = specValues; }

      let payload: any = {
        title, subtitle, handle: finalHandle, description,
        thumbnail: thumbnailImg?.url || null,
        images: images.map(img => ({ url: img.url })),
        categories: selectedCategories.map(id => ({ id })),
        status: "published", discountable: true, origin_country: "IR",
        sales_channels: defaultSalesChannelId ? [{ id: defaultSalesChannelId }] : undefined,
        shipping_profile_id: defaultShippingProfileId || undefined,
        metadata: metadata 
      };

      if (productType === "simple") {
        payload.options = [{ title: "Default Option", values: ["Default Value"] }];
        payload.variants = [{
          title: "Default Variant", sku: simpleSku || null, manage_inventory: true, allow_backorder: false,
          prices: [{ amount: Number(simplePrice), currency_code: "irr" }],
          options: { "Default Option": "Default Value" }, origin_country: "IR"
        }];
      } else {
        const usedOptionTitles = Object.keys(selectedAttrs);
        payload.options = usedOptionTitles.map(t => ({ title: t, values: selectedAttrs[t] }));
        payload.variants = variants.map(v => ({
            title: v.title, sku: v.sku || null, manage_inventory: true, allow_backorder: false,
            prices: [{ amount: Number(v.price), currency_code: "irr" }],
            options: v.options, origin_country: "IR"
        }));
      }

      const createRes = await fetch(`${BASE_URL}/admin/products`, {
        method: "POST", headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!createRes.ok) {
          const errData = await createRes.json();
          throw new Error(errData.message || "خطا در ساخت محصول");
      }

      const createdProductData = await createRes.json();
      const productId = createdProductData.product.id;

      await new Promise(r => setTimeout(r, 1000));
      
      const freshDetails = await fetch(`${BASE_URL}/admin/products/${productId}/details`, { headers: authHeaders, credentials: "include" });
      if (!freshDetails.ok) {
          toast.success("محصول ساخته شد ولی به‌روزرسانی موجودی انجام نشد.");
          router.push(`/dashboard/products/${productId}/edit`);
          return;
      }
      const { product: freshProduct } = await freshDetails.json();

      if (freshProduct?.variants?.length > 0) {
          const updatePromises = freshProduct.variants.map(async (rv: any) => {
              const invItemId = rv.inventory_item_id;
              if (!invItemId || !stockLocationId) return;

              let targetStock = 0;
              if (productType === "simple") {
                  targetStock = Number(simpleInventory);
              } else {
                  const localV = variants.find(v => v.title === rv.title);
                  targetStock = localV ? Number(localV.inventory) : 0;
              }

              if (targetStock >= 0) {
                  await fetch(`${BASE_URL}/admin/inventory-items/${invItemId}/location-levels`, {
                        method: "POST", headers: { "Content-Type": "application/json", ...authHeaders },
                        body: JSON.stringify({ location_id: stockLocationId, stocked_quantity: targetStock }),
                        credentials: "include"
                    });
              }
          });
          await Promise.all(updatePromises);
      }
      
      toast.success("محصول با موفقیت ساخته شد!");
      router.push(`/dashboard/products/${productId}/edit`);

    } catch (error: any) {
      console.error(error); toast.error(error.message);
    } finally { setLoading(false); }
  };

  if (fetchingDefaults) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <form onSubmit={handleCreate} className="max-w-7xl mx-auto pb-20 px-4 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-4 z-20 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200">
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">افزودن محصول جدید</h1>
            <p className="text-sm text-gray-500 mt-0.5">وارد کردن اطلاعات پایه، توضیحات کامل و ویژگی‌ها</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/products">
            <Button variant="outline" type="button" className="border-gray-300">انصراف</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-sm">
            {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {loading ? "در حال ساخت..." : "ساخت محصول"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* 1. Basic Info */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <h2 className="font-bold text-lg text-gray-800 border-b pb-3">اطلاعات پایه</h2>
            <div className="space-y-4">
               <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">نام محصول <span className="text-red-500">*</span></label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="مثلا: پیراهن نخی" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">زیرعنوان</label>
                    <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Handle</label>
                    <Input value={handle} onChange={e => setHandle(e.target.value)} className="font-mono text-xs bg-gray-50" dir="ltr" placeholder="auto-generated" />
                  </div>
               </div>
               <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">توضیحات کوتاه (SEO)</label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="توضیح مختصر..." className="h-24 resize-none" />
               </div>
            </div>
          </div>

          {/* 2. Full Description */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
             <h2 className="font-bold text-lg text-gray-800 border-b pb-3">نقد و بررسی (توضیحات کامل)</h2>
             <div className="min-h-[250px]">
                <RichTextEditor content={fullDescription} onChange={setFullDescription} />
             </div>
          </div>

          {/* 3. Variants Logic */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <h2 className="font-bold text-lg text-gray-800">قیمت و متغیرها</h2>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button type="button" onClick={() => setProductType("simple")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${productType === "simple" ? "bg-white shadow text-black" : "text-gray-500 hover:text-gray-700"}`}>ساده</button>
                    <button type="button" onClick={() => setProductType("variable")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${productType === "variable" ? "bg-white shadow text-black" : "text-gray-500 hover:text-gray-700"}`}>متغیر (رنگ/سایز)</button>
                </div>
            </div>

            {productType === "simple" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="relative">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">قیمت (ریال)</label>
                        <Input type="number" value={simplePrice} onChange={e => setSimplePrice(e.target.value)} className="pl-8" placeholder="0" />
                        <DollarSign className="absolute left-2 top-8 w-4 h-4 text-gray-400" />
                    </div>
                    <div className="relative">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">موجودی انبار</label>
                        <Input type="number" value={simpleInventory} onChange={e => setSimpleInventory(e.target.value)} className="pl-8" placeholder="0" />
                        <Box className="absolute left-2 top-8 w-4 h-4 text-gray-400" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">SKU</label>
                        <Input value={simpleSku} onChange={e => setSimpleSku(e.target.value)} className="font-mono text-xs" />
                    </div>
                </div>
            )}

            {productType === "variable" && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Layers className="w-4 h-4" /> انتخاب ویژگی‌های سراسری</h3>
                        {!fetchingDefaults && globalAttributes.length === 0 && (
                            <div className="text-center py-4 text-sm text-red-500 bg-red-50 rounded">ویژگی سراسری یافت نشد!</div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {globalAttributes.map(attr => (
                                <div key={attr.id} className="space-y-2">
                                    <p className="text-sm font-semibold text-gray-800">{attr.title}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {attr.values.map(val => {
                                            const isChecked = selectedAttrs[attr.title]?.includes(val.value);
                                            return (
                                                <label key={val.id} className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 select-none ${isChecked ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                                                    <input type="checkbox" className="hidden" checked={!!isChecked} onChange={(e) => handleCheckAttribute(attr.title, val.value, e.target.checked)} />
                                                    {val.value}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button type="button" onClick={generateVariants} className="w-full mt-6 bg-black hover:bg-gray-800 text-white gap-2" disabled={Object.keys(selectedAttrs).length === 0}>
                            <RefreshCw className="w-4 h-4" /> تولید ترکیب‌ها (Generate Variants)
                        </Button>
                    </div>

                    {variants.length > 0 && (
                        <div className="border rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-600">لیست متغیرها ({variants.length})</span>
                                <Button variant="ghost" size="sm" className="text-red-500 h-6 text-xs hover:bg-red-50" onClick={() => setVariants([])}>پاک کردن همه</Button>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                <table className="w-full text-sm text-right">
                                    <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10 text-xs uppercase">
                                        <tr>
                                            <th className="px-4 py-3">ترکیب</th>
                                            <th className="px-4 py-3 w-32">قیمت</th>
                                            <th className="px-4 py-3 w-24">موجودی</th>
                                            <th className="px-4 py-3 w-32">SKU</th>
                                            <th className="px-4 py-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {variants.map((v) => (
                                            <tr key={v.id} className="bg-white hover:bg-gray-50 group">
                                                <td className="px-4 py-2 font-medium">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {Object.entries(v.options).map(([k, val]) => (
                                                            <span key={k} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[10px] flex items-center gap-1"><span className="opacity-50">{k}:</span> {val}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2"><Input type="number" className="h-8 text-xs" placeholder="0" value={v.price} onChange={(e) => updateVariantField(v.id, "price", e.target.value)} /></td>
                                                <td className="px-4 py-2"><Input type="number" className="h-8 text-xs" placeholder="0" value={v.inventory} onChange={(e) => updateVariantField(v.id, "inventory", e.target.value)} /></td>
                                                <td className="px-4 py-2"><Input className="h-8 text-xs font-mono" placeholder="Auto" value={v.sku} onChange={(e) => updateVariantField(v.id, "sku", e.target.value)} /></td>
                                                <td className="px-4 py-2 text-center">
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-300 hover:text-red-500" onClick={() => removeVariant(v.id)}><Trash2 className="w-4 h-4" /></Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
          </div>

          {/* 4. Images */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
             <h2 className="font-bold text-lg text-gray-800 border-b pb-3">تصاویر محصول</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${img.isThumbnail ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}`}>
                     <Image src={img.url} alt="product" fill className="object-cover" unoptimized />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                         {!img.isThumbnail && <button type="button" onClick={() => setAsThumbnail(img.url)} className="bg-white/90 text-xs px-2 py-1 rounded text-black font-medium hover:bg-white">اصلی</button>}
                         <button type="button" onClick={() => removeImage(img.url)} className="bg-red-500/90 p-2 rounded-full text-white hover:bg-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                     </div>
                     {img.isThumbnail && <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">اصلی</div>}
                  </div>
                ))}
                <label className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all rounded-xl aspect-square flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-600">
                   <ImagePlus className="w-8 h-8" />
                   <span className="text-sm">افزودن عکس</span>
                   <input type="file" className="hidden" accept="image/*" onChange={handleUploadImage} />
                </label>
             </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-bold text-lg text-gray-800 border-b pb-3">دسته‌بندی‌ها</h2>
             <CategorySelector 
    selectedIds={selectedCategories} 
    onChange={setSelectedCategories} 
    token={token} 
/>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-bold text-lg text-gray-800 border-b pb-3">منابع محصول</h2>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <TableProperties className="w-4 h-4" /> الگوی مشخصات فنی
                </label>
                <Select onValueChange={handleSpecTemplateChange} value={selectedSpecId}>
                    <SelectTrigger className="w-full text-right bg-gray-50"><SelectValue placeholder="انتخاب الگو..." /></SelectTrigger>
                    <SelectContent>{specTemplates.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}</SelectContent>
                </Select>
                {selectedSpecId && (
                    <div className="space-y-3 mt-4 border-t pt-4 animate-in fade-in slide-in-from-top-2">
                        {specTemplates.find(t => t.id === selectedSpecId)?.fields.map((field: string) => (
                                <div key={field} className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-500">{field}</label>
                                    <Input value={specValues[field] || ""} onChange={e => setSpecValues({...specValues, [field]: e.target.value})} className="bg-white h-9" />
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>

            <div className="space-y-2 pt-2 border-t">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Ruler className="w-4 h-4" /> راهنمای سایز
                </label>
                <Select onValueChange={setSelectedSizeGuideId} value={selectedSizeGuideId}>
                    <SelectTrigger className="w-full text-right bg-gray-50"><SelectValue placeholder="انتخاب راهنما..." /></SelectTrigger>
                    <SelectContent>{sizeGuides.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}</SelectContent>
                </Select>
                {selectedSizeGuideId && (
                    <div className="relative w-full h-24 border rounded-lg overflow-hidden mt-2 bg-gray-50 flex items-center justify-center">
                        {(() => {
                            const guide = sizeGuides.find(s => s.id === selectedSizeGuideId);
                            return guide ? <Image src={guide.image_url} alt="preview" fill className="object-contain" unoptimized /> : <span className="text-xs text-gray-400">تصویر یافت نشد</span>;
                        })()}
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}