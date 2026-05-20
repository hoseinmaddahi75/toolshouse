// src/components/admin/edit-product-form.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronRight, Save, ImagePlus, Loader2, X, Trash2, 
  Plus, Layers, RefreshCw, AlertTriangle, TableProperties, Ruler 
} from "lucide-react";
import CategorySelector from "@/components/admin/category-selector";
import RichTextEditor from "@/components/admin/rich-text-editor";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

// --- تایپ‌ها ---
type ProductImage = { id?: string; url: string; isThumbnail: boolean; };
type EditableVariant = {
  id?: string; title: string; sku: string; price: string; inventory: string; inventory_item_id?: string; options: Record<string, string>; 
};
type ProductOption = { id: string; title: string; values: string[]; };
type GlobalAttribute = { id: string; title: string; values: { id: string; value: string }[]; };
type SpecTemplate = { id: string; title: string; fields: string[] };
type SizeGuide = { id: string; title: string; image_url: string };

// 👇 دریافت توکن به عنوان پراپ
export default function EditProductForm({ id, token }: { id: string, token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const BASE_URL = MEDUSA_BACKEND_URL;

  // هدر احراز هویت برای تمام درخواست‌ها
  const authHeaders = {
    "Authorization": `Bearer ${token}`
    // Content-Type بسته به نوع درخواست اضافه می‌شود
  };

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [defaultSalesChannelId, setDefaultSalesChannelId] = useState("");
  const [defaultShippingProfileId, setDefaultShippingProfileId] = useState("");
  const [specTemplates, setSpecTemplates] = useState<SpecTemplate[]>([]);
  const [sizeGuides, setSizeGuides] = useState<SizeGuide[]>([]);
  const [selectedSpecTemplateId, setSelectedSpecTemplateId] = useState("");
  const [specValues, setSpecValues] = useState<Record<string, string>>({});
  const [selectedSizeGuideId, setSelectedSizeGuideId] = useState("");
  const [variants, setVariants] = useState<EditableVariant[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [stockLocationId, setStockLocationId] = useState<string | null>(null);
  const [globalAttributes, setGlobalAttributes] = useState<GlobalAttribute[]>([]);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string[]>>({});
  const [showVariantGenerator, setShowVariantGenerator] = useState(false); 

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 👇 اضافه کردن هدر Authorization به تمام درخواست‌ها
        const [specsRes, sizesRes, locRes, attrsRes, scRes, spRes, productRes] = await Promise.all([
            fetch(`${BASE_URL}/admin/product-resources?type=specs`, { headers: authHeaders }),
            fetch(`${BASE_URL}/admin/product-resources?type=sizes`, { headers: authHeaders }),
            fetch(`${BASE_URL}/admin/stock-locations`, { headers: authHeaders }),
            fetch(`${BASE_URL}/admin/global-attributes`, { headers: authHeaders }),
            fetch(`${BASE_URL}/admin/sales-channels`, { headers: authHeaders }),
            fetch(`${BASE_URL}/admin/shipping-profiles`, { headers: authHeaders }),
            fetch(`${BASE_URL}/admin/products/${id}/details`, { headers: authHeaders }) // استفاده از ID پراپ
        ]);

        if (!productRes.ok) {
            if (productRes.status === 401) throw new Error("لطفا مجدد وارد شوید");
            throw new Error("Product not found");
        }

        const sData = await specsRes.json(); setSpecTemplates(sData.data || []);
        const zData = await sizesRes.json(); setSizeGuides(zData.data || []);
        const lData = await locRes.json(); setStockLocationId(lData.stock_locations?.[0]?.id);
        if (attrsRes.ok) { const aData = await attrsRes.json(); setGlobalAttributes(aData.attributes || []); }

        const scData = await scRes.json();
        if (scData.sales_channels?.length > 0) setDefaultSalesChannelId(scData.sales_channels[0].id);

        const spData = await spRes.json();
        if (spData.shipping_profiles?.length > 0) {
            const defProfile = spData.shipping_profiles.find((p: any) => p.type === "default") || spData.shipping_profiles[0];
            setDefaultShippingProfileId(defProfile.id);
        }

        const { product } = await productRes.json();

        setTitle(product.title || "");
        setSubtitle(product.subtitle || "");
        setHandle(product.handle || "");
        setDescription(product.description || "");
        setFullDescription((product.metadata?.full_description as string) || "");
        
        setSelectedSizeGuideId((product.metadata?.size_guide_id as string) || "");
        setSelectedSpecTemplateId((product.metadata?.spec_template_id as string) || "");
        setSpecValues((product.metadata?.specifications as Record<string, string>) || {});

        setImages((product.images || []).map((img: any) => ({
          id: img.id, url: img.url, isThumbnail: img.url === product.thumbnail
        })));
        
        if (product.categories) setSelectedCategories(product.categories.map((c: any) => c.id));
        setProductOptions(product.options || []);

        if (product.variants) {
           setVariants(product.variants.map((v: any) => ({
                 id: v.id,
                 title: v.title,
                 sku: v.sku || "",
                 price: v.prices?.[0]?.amount ? v.prices[0].amount.toString() : "0",
                 inventory: v.inventory_quantity?.toString() || "0",
                 inventory_item_id: v.inventory_item_id,
                 options: v.options
           })));
        }

      } catch (error: any) { 
          console.error(error);
          toast.error(error.message || "خطا در دریافت اطلاعات"); 
      } finally { setLoading(false); }
    };
    if (id && token) fetchAllData();
  }, [id, token]);

  const handleCheckAttribute = (attrTitle: string, value: string, checked: boolean) => {
    setSelectedAttrs(prev => {
      const current = prev[attrTitle] || [];
      const newVals = checked ? [...current, value] : current.filter(v => v !== value);
      if (newVals.length === 0) { const { [attrTitle]: _, ...rest } = prev; return rest; }
      return { ...prev, [attrTitle]: newVals };
    });
  };

  const generateVariants = () => {
    const attrTitles = Object.keys(selectedAttrs);
    if (attrTitles.length === 0) return toast.warning("ویژگی انتخاب کنید");
    const valuesArray = attrTitles.map(t => selectedAttrs[t]);
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
    const newVariants: EditableVariant[] = combinations.map((combo, idx) => {
        const variantOptions: Record<string, string> = {};
        const titleParts: string[] = [];
        combo.forEach((val: string, index: number) => {
          const t = attrTitles[index]; variantOptions[t] = val; titleParts.push(val);
        });
        return {
          id: `NEW_${Date.now()}_${idx}`, title: titleParts.join(" / "),
          sku: "", price: "0", inventory: "0", options: variantOptions
        };
    });
    setVariants(newVariants);
    setShowVariantGenerator(false);
    toast.success("واریانت‌های جدید آماده ذخیره هستند");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const thumbnailImg = images.find(i => i.isThumbnail) || images[0];
      const updatePayload: any = {
          title, subtitle, handle, description,
          thumbnail: thumbnailImg?.url || null,
          images: images.map(img => ({ url: img.url })),
          categories: selectedCategories.map(id => ({ id })),
          origin_country: "IR",
          metadata: {
              full_description: fullDescription,
              size_guide_id: selectedSizeGuideId,
              size_guide_url: selectedSizeGuideId ? sizeGuides.find(s => s.id === selectedSizeGuideId)?.image_url : null,
              spec_template_id: selectedSpecTemplateId,
              specifications: specValues 
          },
      };

      if (defaultSalesChannelId) updatePayload.sales_channels = [{ id: defaultSalesChannelId }];
      if (defaultShippingProfileId) updatePayload.shipping_profile_id = defaultShippingProfileId;

      await fetch(`${BASE_URL}/admin/products/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders }, // 👈 Auth Header
        body: JSON.stringify(updatePayload),
      });

      const newVariants = variants.filter(v => v.id?.startsWith("NEW_"));
      if (newVariants.length > 0) {
          let prodDetails = await fetch(`${BASE_URL}/admin/products/${id}/details`, { headers: authHeaders }).then(r => r.json());
          let currentOptions = prodDetails.product.options || [];
          const newOptionTitles = Object.keys(selectedAttrs);
          let optionsModified = false;

          for (const title of newOptionTitles) {
              const exists = currentOptions.find((o: any) => o.title === title);
              if (!exists) {
                  let sampleValue = "Default";
                  for(const v of newVariants) { if(v.options[title]) { sampleValue = v.options[title]; break; } }
                  await fetch(`${BASE_URL}/admin/products/${id}/options`, {
                      method: "POST", headers: { "Content-Type": "application/json", ...authHeaders },
                      body: JSON.stringify({ title: title, values: [sampleValue] }),
                  });
                  optionsModified = true;
              }
          }

          if (optionsModified) await new Promise(r => setTimeout(r, 2000));

          prodDetails = await fetch(`${BASE_URL}/admin/products/${id}/details`, { headers: authHeaders }).then(r => r.json());
          currentOptions = prodDetails.product.options || [];

          for (const v of newVariants) {
              const medusaOptionsPayload: Record<string, string> = {};
              currentOptions.forEach((opt: any) => {
                  if (v.options[opt.title]) medusaOptionsPayload[opt.title] = v.options[opt.title];
                  else if (opt.title === "Default Option") medusaOptionsPayload[opt.title] = "Default Value";
                  else medusaOptionsPayload[opt.title] = opt.values?.[0]?.value || "Default";
              });

              const createRes = await fetch(`${BASE_URL}/admin/products/${id}/variants`, {
                  method: "POST", headers: { "Content-Type": "application/json", ...authHeaders },
                  body: JSON.stringify({
                      title: v.title, sku: v.sku || null, prices: [{ amount: Number(v.price), currency_code: "irr" }],
                      options: medusaOptionsPayload, manage_inventory: true, allow_backorder: false, origin_country: "IR", material: null,
                  }),
              });

              if (createRes.ok) {
                  const createdData = await createRes.json();
                  const createdVariant = createdData.product_variant || createdData.variant;
                  if (createdVariant && stockLocationId) {
                      await updateInventoryWithRetry(createdVariant.inventory_item_id, Number(v.inventory), stockLocationId);
                  }
              }
          }

          const variantsToDelete = prodDetails.product.variants.filter((v: any) => 
              v.options?.some((o: any) => o.option?.title === "Default Option" || o.value === "Default Value")
          );
          for (const v of variantsToDelete) {
              await fetch(`${BASE_URL}/admin/products/${id}/variants/${v.id}`, { method: "DELETE", headers: authHeaders });
          }
      }

      const existingVariants = variants.filter(v => !v.id?.startsWith("NEW_"));
      await Promise.all(existingVariants.map(async (v) => {
         await fetch(`${BASE_URL}/admin/products/${id}/variants/${v.id}`, {
            method: "POST", headers: { "Content-Type": "application/json", ...authHeaders },
            body: JSON.stringify({ prices: [{ amount: Number(v.price), currency_code: "irr" }], origin_country: "IR" }),
         });
         if (v.inventory_item_id && stockLocationId) {
             await updateInventoryWithRetry(v.inventory_item_id, Number(v.inventory), stockLocationId);
         }
      }));
      
      toast.success("تغییرات ذخیره شد");
      setTimeout(() => { window.location.reload(); }, 1500);
    } catch (error: any) {
      console.error(error); toast.error("خطایی رخ داد.");
    } finally { setSaving(false); }
  };

  const updateInventoryWithRetry = async (inventoryItemId: string, quantity: number, locationId: string, attempts = 3) => {
      for (let i = 0; i < attempts; i++) {
          try {
              const res = await fetch(`${BASE_URL}/admin/inventory-items/${inventoryItemId}/location-levels/${locationId}`, {
                  method: "POST", headers: { "Content-Type": "application/json", ...authHeaders },
                  body: JSON.stringify({ stocked_quantity: quantity }),
              });
              if (res.status === 404) {
                  await fetch(`${BASE_URL}/admin/inventory-items/${inventoryItemId}/location-levels`, {
                      method: "POST", headers: { "Content-Type": "application/json", ...authHeaders },
                      body: JSON.stringify({ location_id: locationId, stocked_quantity: quantity }),
                  });
              } 
              if (res.ok || res.status === 404) return;
              await new Promise(r => setTimeout(r, 1000));
          } catch (e) { console.error(e); }
      }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const formData = new FormData(); formData.append("files", e.target.files[0]);
      const tId = toast.loading("در حال آپلود...");
      try {
        // 👇 برای آپلود فایل نباید Content-Type ست کنیم (مرورگر خودش می‌گذارد)
        const res = await fetch(`${BASE_URL}/admin/uploads`, { 
            method: "POST", 
            body: formData, 
            headers: { "Authorization": `Bearer ${token}` } 
        });
        const data = await res.json();
        setImages(prev => [...prev, { url: data.files[0].url, isThumbnail: prev.length === 0 }]);
        toast.dismiss(tId);
      } catch (err) { toast.dismiss(tId); }
    }
  };
  const removeImage = (url: string) => setImages(prev => prev.filter(img => img.url !== url));
  const setAsThumbnail = (url: string) => setImages(prev => prev.map(img => ({ ...img, isThumbnail: img.url === url })));

  const handleDeleteVariant = async (variantId: string) => {
      if (!confirm("حذف شود؟")) return;
      if (variantId.startsWith("NEW_")) { setVariants(prev => prev.filter(v => v.id !== variantId)); return; }
      try {
          const res = await fetch(`${BASE_URL}/admin/products/${id}/variants/${variantId}`, { method: "DELETE", headers: authHeaders });
          if (res.ok) setVariants(prev => prev.filter(v => v.id !== variantId));
      } catch (e) { toast.error("حذف ناموفق"); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  const isSimpleProduct = productOptions.length === 1 && productOptions[0].title === "Default Option";

  return (
      <form onSubmit={handleUpdate} className="max-w-7xl mx-auto pb-20 px-4 md:px-8 relative">
        {/* ... (کدهای JSX فرم دقیقاً مثل قبل است - کپی کنید) ... */}
        {/* فقط برای کوتاه شدن پاسخ، JSX طولانی را اینجا تکرار نکردم چون تغییری نکرده است. 
            شما کل return (...) فایل قبلی خود را اینجا کپی کنید. 
            تمام عملکردها حالا از `authHeaders` استفاده می‌کنند. 
        */}
        <div className="flex items-center justify-between mb-6 sticky top-4 z-20 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products"><Button variant="ghost" size="icon"><ChevronRight className="h-5 w-5 text-gray-500" /></Button></Link>
          <h1 className="text-xl font-bold text-gray-900">ویرایش محصول <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded ml-2 text-gray-500">{handle}</span></h1>
        </div>
        <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-sm">
            {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} ذخیره
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <h2 className="font-bold text-lg text-gray-800 border-b pb-3">اطلاعات اصلی</h2>
            <div className="space-y-4">
               <div><label className="text-sm font-medium block mb-1">نام محصول</label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
               <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium block mb-1">زیرعنوان</label><Input value={subtitle} onChange={e => setSubtitle(e.target.value)} /></div>
                  <div><label className="text-sm font-medium block mb-1">اسلاگ (URL)</label><Input value={handle} onChange={e => setHandle(e.target.value)} className="font-mono text-xs bg-gray-50" dir="ltr" /></div>
               </div>
               <div><label className="text-sm font-medium block mb-1">توضیحات کوتاه</label><RichTextEditor content={description} onChange={setDescription} /></div>
               <div><label className="text-sm font-medium block mb-1">توضیحات کامل</label><RichTextEditor content={fullDescription} onChange={setFullDescription} /></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b pb-4 mb-2">
               <div className="flex items-center gap-2"><div className="w-1 h-6 bg-orange-500 rounded-full"></div><h2 className="font-bold text-lg text-gray-800">متغیرها</h2></div>
               
               {isSimpleProduct && !showVariantGenerator && (
                   <Button type="button" size="sm" onClick={() => setShowVariantGenerator(true)} className="bg-black hover:bg-gray-800 text-white gap-2">
                       <RefreshCw className="w-4 h-4" /> تبدیل به محصول متغیر
                   </Button>
               )}
               
               {!isSimpleProduct && !showVariantGenerator && (
                   <Button type="button" size="sm" onClick={() => setShowVariantGenerator(true)} variant="outline" className="gap-2">
                       <Plus className="w-4 h-4" /> تولید مجدد / افزودن
                   </Button>
               )}
            </div>

            {showVariantGenerator && (
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 mb-6 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-blue-900 flex items-center gap-2"><Layers className="w-4 h-4" /> تولید خودکار واریانت‌ها</h3>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-400 hover:text-blue-700" onClick={() => setShowVariantGenerator(false)}><X className="w-4 h-4" /></Button>
                    </div>
                    
                    {isSimpleProduct && (
                        <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-100 p-2 rounded mb-4 border border-orange-200">
                            <AlertTriangle className="w-4 h-4" />
                            توجه: با ذخیره واریانت‌های جدید، حالت "محصول ساده" و قیمت قبلی جایگزین می‌شود.
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {globalAttributes.map(attr => (
                            <div key={attr.id}>
                                <p className="text-xs font-bold text-gray-700 mb-1">{attr.title}</p>
                                <div className="flex flex-wrap gap-2">
                                    {attr.values.map(val => {
                                        const isChecked = selectedAttrs[attr.title]?.includes(val.value);
                                        return (
                                            <label key={val.id} className={`cursor-pointer px-2 py-1 rounded border text-[10px] transition-all select-none ${isChecked ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300'}`}>
                                                <input type="checkbox" className="hidden" checked={!!isChecked} onChange={(e) => handleCheckAttribute(attr.title, val.value, e.target.checked)} />
                                                {val.value}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button type="button" onClick={generateVariants} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs">تولید لیست واریانت‌ها</Button>
                </div>
            )}

            {variants.length === 0 ? (
               <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed">هیچ متغیری ندارد.</div>
            ) : (
               <div className="space-y-3">
                  {variants.map((v, idx) => (
                     <div key={v.id || idx} className={`flex gap-3 items-end p-4 rounded-xl border hover:border-gray-300 transition-colors ${v.id?.startsWith("NEW_") ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100"}`}>
                        <div className="flex-1">
                            <label className="text-xs font-medium text-gray-500 mb-1 block">عنوان</label>
                            <div className="h-9 flex items-center px-3 font-medium text-sm text-gray-700 bg-white rounded border border-gray-200">{v.title}</div>
                        </div>
                        <div className="w-32"><label className="text-xs font-medium text-gray-500 mb-1 block">قیمت</label><Input type="number" value={v.price} onChange={(e) => { const newV = [...variants]; newV[idx].price = e.target.value; setVariants(newV); }} className="bg-white" /></div>
                        <div className="w-24"><label className="text-xs font-medium text-gray-500 mb-1 block">موجودی</label><Input type="number" value={v.inventory} onChange={(e) => { const newV = [...variants]; newV[idx].inventory = e.target.value; setVariants(newV); }} className="bg-white" /></div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteVariant(v.id || `NEW_${idx}`)} className="text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                     </div>
                  ))}
               </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
             <div className="flex items-center justify-between border-b pb-4 mb-2">
                <div className="flex items-center gap-2"><div className="w-1 h-6 bg-purple-500 rounded-full"></div><h2 className="font-bold text-lg text-gray-800">تصاویر</h2></div>
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors"><ImagePlus className="w-4 h-4" /> افزودن <input type="file" className="hidden" accept="image/*" onChange={handleUploadImage} /></label>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className={`relative group aspect-square rounded-xl overflow-hidden border-2 ${img.isThumbnail ? 'border-blue-500' : 'border-gray-200'}`}>
                     <Image src={img.url} alt="product" fill className="object-cover" unoptimized />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                         {!img.isThumbnail && <button type="button" onClick={() => setAsThumbnail(img.url)} className="bg-white/90 text-xs px-2 py-1 rounded">اصلی</button>}
                         <button type="button" onClick={() => removeImage(img.url)} className="bg-red-500/90 p-2 rounded-full text-white"><X className="w-3 h-3" /></button>
                     </div>
                     {img.isThumbnail && <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">اصلی</div>}
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-bold text-lg text-gray-800 border-b pb-3">دسته‌بندی</h2>
             <CategorySelector 
    selectedIds={selectedCategories} 
    onChange={setSelectedCategories} 
    token={token} 
/>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-bold text-lg text-gray-800 border-b pb-3">منابع محصول</h2>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><TableProperties className="w-4 h-4" /> الگوی مشخصات فنی</label>
                <Select onValueChange={(val) => {
                    setSelectedSpecTemplateId(val);
                    if (!specValues || Object.keys(specValues).length === 0) setSpecValues({});
                }} value={selectedSpecTemplateId}>
                    <SelectTrigger className="w-full text-right bg-gray-50"><SelectValue placeholder="انتخاب الگو..." /></SelectTrigger>
                    <SelectContent>{specTemplates.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}</SelectContent>
                </Select>
                {selectedSpecTemplateId && (
                    <div className="space-y-3 mt-4 border-t pt-4 animate-in fade-in">
                        {specTemplates.find(t => t.id === selectedSpecTemplateId)?.fields.map((field: string) => (
                            <div key={field} className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-500">{field}</label>
                                <Input value={specValues[field] || ""} onChange={e => setSpecValues({...specValues, [field]: e.target.value})} className="bg-white h-9" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-2 pt-2 border-t">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Ruler className="w-4 h-4" /> راهنمای سایز</label>
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