"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // 🟢 اضافه شده برای فیلد توضیحات سئو
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
import RelatedProductSelector from "@/components/admin/RelatedProductSelector";

type ProductImage = { id?: string; url: string; isThumbnail: boolean; };
type EditableVariant = {
  id?: string; title: string; sku: string; price: string;
  price_id?: string;
  sale_price?: string;
  sale_price_id?: string; 
  inventory: string; weight: string; inventory_item_id?: string; options: Record<string, string>;
};
type ProductOption = { id: string; title: string; values: string[]; };
type GlobalAttribute = { id: string; title: string; values: { id: string; value: string }[]; };
type SpecTemplate = { id: string; title: string; fields: string[] };
type SizeGuide = { id: string; title: string; image_url: string };

export default function EditProductForm({ id, token }: { id: string, token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const BASE_URL = MEDUSA_BACKEND_URL;
  const authHeaders = { "Authorization": `Bearer ${token}` };

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState(""); // 🟢 حالا به عنوان توضیحات کوتاه استفاده می‌شود
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState(""); // 🟢 حالا به عنوان توضیحات کامل استفاده می‌شود
  
  // 🟢 استیت‌های جدید سئو
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

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
  const [relatedIds, setRelatedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const safeFetchAdmin = async (url: string) => {
          try {
            const res = await fetch(url, { headers: authHeaders, credentials: "include" });
            return res.ok ? res : null;
          } catch { return null; }
        };

        const PRICE_LIST_ID = process.env.NEXT_PUBLIC_GLOBAL_SALE_PRICE_LIST_ID;
        
        const [specsRes, sizesRes, locRes, attrsRes, scRes, spRes, productRes] = await Promise.all([
            safeFetchAdmin(`${BASE_URL}/admin/product-resources?type=specs`),
            safeFetchAdmin(`${BASE_URL}/admin/product-resources?type=sizes`),
            safeFetchAdmin(`${BASE_URL}/admin/stock-locations`),
            safeFetchAdmin(`${BASE_URL}/admin/global-attributes`),
            safeFetchAdmin(`${BASE_URL}/admin/sales-channels`),
            safeFetchAdmin(`${BASE_URL}/admin/shipping-profiles`),
            safeFetchAdmin(`${BASE_URL}/admin/products/${id}/details`)
        ]);

        if (!productRes) throw new Error("محصول یافت نشد");
        const { product } = await productRes.json();

        // استخراج قیمت حراج از Store API (دور زدن محدودیت ادمین)
        let storeSalePricesMap: Record<string, { amount: number, id: string }> = {};
        const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_82b953b964ad71f051bb02d1382200901c260d0e8628f845fd00856125b14336";
        const storeHeaders = { "x-publishable-api-key": pubKey, "accept": "application/json" };

        try {
            const regionRes = await fetch(`${BASE_URL}/store/regions?limit=1`, { headers: storeHeaders });
            if (regionRes.ok) {
                const regionData = await regionRes.json();
                const regionId = regionData.regions?.[0]?.id;

                if (regionId && product.handle) {
                    const storeProductRes = await fetch(
                        `${BASE_URL}/store/products?handle=${product.handle}&region_id=${regionId}`,
                        { headers: storeHeaders }
                    );

                    if (storeProductRes.ok) {
                        const storeData = await storeProductRes.json();
                        const storeProduct = storeData.products?.[0];
                        if (storeProduct && storeProduct.variants) {
                            storeProduct.variants.forEach((v: any) => {
                                const cp = v.calculated_price;
                                if (cp && cp.is_calculated_price_price_list && cp.calculated_price?.price_list_id === PRICE_LIST_ID) {
                                    storeSalePricesMap[v.id] = {
                                        amount: cp.calculated_amount,
                                        id: cp.calculated_price.id
                                    };
                                }
                            });
                        }
                    }
                }
            }
        } catch (e) {
            console.error("خطا در دریافت قیمت از Store API", e);
        }

        if (specsRes) { const sData = await specsRes.json(); setSpecTemplates(sData.data || []); }
        if (sizesRes) { const zData = await sizesRes.json(); setSizeGuides(zData.data || []); }
        if (locRes) { const lData = await locRes.json(); setStockLocationId(lData.stock_locations?.[0]?.id || null); }
        if (attrsRes) { const aData = await attrsRes.json(); setGlobalAttributes(aData.attributes || []); }
        if (scRes) {
            const scData = await scRes.json();
            if (scData.sales_channels?.length > 0) setDefaultSalesChannelId(scData.sales_channels[0].id);
        }
        if (spRes) {
            const spData = await spRes.json();
            if (spData.shipping_profiles?.length > 0) {
                const defProfile = spData.shipping_profiles.find((p: any) => p.type === "default") || spData.shipping_profiles[0];
                setDefaultShippingProfileId(defProfile.id);
            }
        }

        // 🟢 تطبیق فیلدها با استاندارد جدید
        setTitle(product.title || "");
        setSubtitle(product.subtitle || ""); 
        setHandle(product.handle || "");
        setDescription(product.description || ""); 
        
        // 🟢 دریافت دیتای سئو از متادیتا
        setSeoTitle(product.metadata?.seo_title as string || "");
        setSeoDescription(product.metadata?.seo_description as string || "");

        setRelatedIds(product.metadata?.related_product_ids || []);
        setSelectedSizeGuideId((product.metadata?.size_guide_id as string) || "");
        setSelectedSpecTemplateId((product.metadata?.spec_template_id as string) || "");
        setSpecValues((product.metadata?.specifications as Record<string, string>) || {});
        setImages((product.images || []).map((img: any) => ({
          id: img.id, url: img.url, isThumbnail: img.url === product.thumbnail
        })));
        if (product.categories) setSelectedCategories(product.categories.map((c: any) => c.id));
        setProductOptions(product.options || []);

        if (product.variants) {
           setVariants(product.variants.map((v: any) => {
                 const basePriceObj = v.prices?.find((p: any) => p.price_list_id === null) || v.prices?.[0];
                 const saleInfo = storeSalePricesMap[v.id]; 

                 return {
                     id: v.id,
                     title: v.title,
                     sku: v.sku || "",
                     price: basePriceObj?.amount ? basePriceObj.amount.toString() : "0",
                     price_id: basePriceObj?.id,
                     sale_price: saleInfo?.amount ? saleInfo.amount.toString() : "",
                     sale_price_id: saleInfo?.id, 
                     inventory: v.inventory_quantity?.toString() || "0",
                     weight: v.weight?.toString() || "",
                     inventory_item_id: v.inventory_item_id,
                     options: v.options
                 };
           }));
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
          id: `NEW_${Date.now()}_${idx}`, 
          title: titleParts.join(" / "),
          sku: "", 
          price: "0", 
          sale_price: "", 
          inventory: "0", 
          weight: "", 
          options: variantOptions
        };
    });
    setVariants(newVariants);
    setShowVariantGenerator(false);
    toast.success("واریانتهای جدید آماده ذخیره هستند");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const PRICE_LIST_ID = process.env.NEXT_PUBLIC_GLOBAL_SALE_PRICE_LIST_ID;

    // 🟢 پاک‌سازی HTML برای تولید توضیحات سئو در صورتی که کاربر آن را خالی بگذارد
    const stripHtml = (html: string) => html ? html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim() : "";
    const finalSeoTitle = seoTitle.trim() || `${title} | خانه ابزار`;
    const finalSeoDesc = seoDescription.trim() || stripHtml(subtitle).substring(0, 160);

    try {
      const thumbnailImg = images.find(i => i.isThumbnail) || images[0];

      const updatePayload: any = {
          title, subtitle, handle, description,
          thumbnail: thumbnailImg?.url || null,
          images: images.map(img => ({ url: img.url })),
          categories: selectedCategories.map(id => ({ id })),
          origin_country: "IR",
          weight: variants.length > 0 && variants[0].weight ? Number(variants[0].weight) : null,
          metadata: {
              // 🟢 اضافه شدن دیتای سئو به متادیتا
              seo_title: finalSeoTitle,
              seo_description: finalSeoDesc,
              size_guide_id: selectedSizeGuideId,
              size_guide_url: selectedSizeGuideId ? sizeGuides.find(s => s.id === selectedSizeGuideId)?.image_url : null,
              spec_template_id: selectedSpecTemplateId,
              specifications: specValues,
              related_product_ids: relatedIds,
          },
      };

      if (defaultSalesChannelId) updatePayload.sales_channels = [{ id: defaultSalesChannelId }];
      if (defaultShippingProfileId) updatePayload.shipping_profile_id = defaultShippingProfileId;

      const productUpdateRes = await fetch(`${BASE_URL}/admin/products/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(updatePayload),
        credentials: "include"
      });

      if (!productUpdateRes.ok) throw new Error("خطا در ذخیره اطلاعات اصلی محصول");

      const newVariants = variants.filter(v => v.id?.startsWith("NEW_"));
      
      if (newVariants.length > 0) {
          let prodDetails = await fetch(`${BASE_URL}/admin/products/${id}/details`, { headers: authHeaders, credentials: "include" }).then(r => r.json());
          
          const variantsToDelete = prodDetails.product.variants.filter((v: any) =>
              v.title === "Default Variant" || v.options?.some((o: any) => o.value === "Default Variant")
          );
          
          for (const v of variantsToDelete) {
              try { 
                  await fetch(`${BASE_URL}/admin/products/${id}/variants/${v.id}`, { method: "DELETE", headers: authHeaders, credentials: "include" }); 
              } catch(e) {}
          }

          const defaultOption = prodDetails.product.options?.find((o: any) => o.title === "Default Option");
          if (defaultOption) {
              try { 
                  await fetch(`${BASE_URL}/admin/products/${id}/options/${defaultOption.id}`, { method: "DELETE", headers: authHeaders, credentials: "include" }); 
              } catch(e) {}
          }

          await new Promise(r => setTimeout(r, 1000));
          prodDetails = await fetch(`${BASE_URL}/admin/products/${id}/details`, { headers: authHeaders, credentials: "include" }).then(r => r.json());
          let currentOptions = prodDetails.product.options || [];

          const newOptionTitles = Object.keys(selectedAttrs);
          let optionsModified = false;

          for (const title of newOptionTitles) {
              const exists = currentOptions.find((o: any) => o.title === title);
              if (!exists) {
                  const uniqueValues = [...new Set(newVariants.map(v => v.options[title]).filter(Boolean))];
                  if (uniqueValues.length === 0) uniqueValues.push("Default");
                  
                  await fetch(`${BASE_URL}/admin/products/${id}/options`, {
                      method: "POST", headers: { "Content-Type": "application/json", ...authHeaders },
                      body: JSON.stringify({ title: title, values: uniqueValues }),
                      credentials: "include"
                  });
                  optionsModified = true;
              }
          }

          if (optionsModified) {
              await new Promise(r => setTimeout(r, 2000));
              prodDetails = await fetch(`${BASE_URL}/admin/products/${id}/details`, { headers: authHeaders, credentials: "include" }).then(r => r.json());
              currentOptions = prodDetails.product.options || [];
          }

          for (const v of newVariants) {
              const medusaOptionsPayload: Record<string, string> = {};
              
              currentOptions.forEach((opt: any) => {
                  if (opt.title === "Default Option") {
                       let exactVal = opt.values?.[0]?.value;
                       if (!exactVal) {
                           const exVar = prodDetails.product.variants?.find((pv: any) => pv.options?.some((o:any) => o.option_id === opt.id));
                           if (exVar) {
                               const exOpt = exVar.options.find((o:any) => o.option_id === opt.id);
                               if (exOpt) exactVal = exOpt.value;
                           }
                       }
                       medusaOptionsPayload[opt.title] = exactVal || "Default Variant";
                  } else {
                      if (v.options[opt.title]) {
                          medusaOptionsPayload[opt.title] = v.options[opt.title];
                      } else {
                          medusaOptionsPayload[opt.title] = opt.values?.[0]?.value || "Default";
                      }
                  }
              });

              const variantPayloadToCreate = {
                  title: v.title, 
                  sku: v.sku || null, 
                  prices: [{ amount: Number(v.price), currency_code: "irr" }],
                  options: medusaOptionsPayload, 
                  manage_inventory: true, 
                  allow_backorder: false, 
                  origin_country: "IR", 
                  material: null,
                  weight: v.weight ? Number(v.weight) : null
              };

              const createVarRes = await fetch(`${BASE_URL}/admin/products/${id}/variants`, {
                  method: "POST", 
                  headers: { "Content-Type": "application/json", ...authHeaders },
                  body: JSON.stringify(variantPayloadToCreate),
                  credentials: "include"
              });
              
              if (!createVarRes.ok) {
                  const errorText = await createVarRes.text();
                  if (errorText.includes("already exists")) {
                      console.warn(`واریانت ${v.title} از قبل در دیتابیس وجود دارد. ایجاد مجدد نادیده گرفته شد.`);
                  } else {
                      console.error("Payload sent:", variantPayloadToCreate);
                      throw new Error(`خطا در ساخت واریانت: ${v.title} - ${errorText}`);
                  }
              }
          }

          await new Promise(r => setTimeout(r, 1500));
          prodDetails = await fetch(`${BASE_URL}/admin/products/${id}/details`, { headers: authHeaders, credentials: "include" }).then(r => r.json());

          for (const v of newVariants) {
              const dbVariant = prodDetails.product.variants.find((dbV: any) => dbV.title === v.title);
              if (dbVariant) {
                  const updatePayload: any = { sku: v.sku || null, weight: v.weight ? Number(v.weight) : null };
                  const irrPrice = dbVariant.prices?.find((p: any) => p.currency_code?.toLowerCase() === "irr");
                  if (irrPrice) {
                      updatePayload.prices = [{ id: irrPrice.id, amount: Number(v.price), currency_code: "irr" }];
                  } else {
                      updatePayload.prices = [{ amount: Number(v.price), currency_code: "irr" }];
                  }
                  
                  await fetch(`${BASE_URL}/admin/products/${id}/variants/${dbVariant.id}`, {
                      method: "POST", headers: { "Content-Type": "application/json", ...authHeaders },
                      body: JSON.stringify(updatePayload), credentials: "include"
                  });

                  if (dbVariant.inventory_item_id && stockLocationId) {
                      await updateInventoryStandard(dbVariant.inventory_item_id, Number(v.inventory), stockLocationId);
                  }
                  
                  if (PRICE_LIST_ID && v.sale_price && Number(v.sale_price) > 0) {
                      await fetch(`${BASE_URL}/admin/price-lists/${PRICE_LIST_ID}/prices/batch`, {
                          method: "POST", headers: { "Content-Type": "application/json", ...authHeaders },
                          body: JSON.stringify({
                              create: [{ variant_id: dbVariant.id, amount: Number(v.sale_price), currency_code: "irr" }]
                          }),
                          credentials: "include"
                      });
                  }
              }
          }
      }
      
      const existingVariants = variants.filter(v => !v.id?.startsWith("NEW_"));
      
      for (const v of existingVariants) {
          const variantPayload: any = {
              sku: v.sku || null,
              origin_country: "IR",
              weight: v.weight ? Number(v.weight) : null
          };

          if (v.price_id) {
              variantPayload.prices = [{ id: v.price_id, amount: Number(v.price), currency_code: "irr" }];
          } else {
              variantPayload.prices = [{ amount: Number(v.price), currency_code: "irr" }];
          }

          const varRes = await fetch(`${BASE_URL}/admin/products/${id}/variants/${v.id}`, {
              method: "POST", headers: { "Content-Type": "application/json", ...authHeaders },
              body: JSON.stringify(variantPayload),
              credentials: "include"
          });

          if (!varRes.ok) {
              throw new Error(`خطا در آپدیت اطلاعات واریانت: ${v.title}`);
          }

          if (PRICE_LIST_ID) {
              const parsedSale = Number(v.sale_price);

              if (parsedSale && parsedSale > 0) {
                  const batchPayload: any = {
                      create: [{ variant_id: v.id, amount: parsedSale, currency_code: "irr" }]
                  };
                  if (v.sale_price_id) batchPayload.delete = [v.sale_price_id];

                  await fetch(`${BASE_URL}/admin/price-lists/${PRICE_LIST_ID}/prices/batch`, {
                      method: "POST", headers: { "Content-Type": "application/json", ...authHeaders },
                      body: JSON.stringify(batchPayload),
                      credentials: "include"
                  });
              } 
              else if (v.sale_price_id) {
                  await fetch(`${BASE_URL}/admin/price-lists/${PRICE_LIST_ID}/prices/batch`, {
                      method: "POST", headers: { "Content-Type": "application/json", ...authHeaders },
                      body: JSON.stringify({ delete: [v.sale_price_id] }),
                      credentials: "include"
                  });
              }
          }

          if (v.inventory_item_id && stockLocationId) {
             await updateInventoryStandard(v.inventory_item_id, Number(v.inventory), stockLocationId);
          }
      }

      toast.success("تغییرات با موفقیت ذخیره شد");
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      console.error(error); 
      toast.error(error.message || "خطایی رخ داد.");
    } finally { setSaving(false); }
  };

  const updateInventoryStandard = async (inventoryItemId: string, quantity: number, locationId: string) => {
    try {
        const linkRes = await fetch(`${BASE_URL}/admin/inventory-items/${inventoryItemId}/location-levels`, {
            method: "POST", 
            headers: { "Content-Type": "application/json", ...authHeaders },
            body: JSON.stringify({ location_id: locationId }), 
            credentials: "include"
        });
        
        if (!linkRes.ok && linkRes.status !== 400) {
            console.warn("Issue linking location level, might already exist.", await linkRes.text());
        }

        const updateRes = await fetch(`${BASE_URL}/admin/inventory-items/${inventoryItemId}/location-levels/${locationId}`, {
            method: "POST", 
            headers: { "Content-Type": "application/json", ...authHeaders },
            body: JSON.stringify({ stocked_quantity: quantity }), 
            credentials: "include"
        });

        if (!updateRes.ok) {
            console.error("Failed to update inventory quantity:", await updateRes.text());
        }
    } catch (e) {
        console.error("Error in updateInventoryStandard:", e);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const formData = new FormData(); formData.append("files", e.target.files[0]);
      const tId = toast.loading("در حال آپلود...");
      try {
        const res = await fetch(`${BASE_URL}/admin/uploads`, {
            method: "POST", body: formData, headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("خطا در آپلود");
        const data = await res.json();
        if (!data.files?.[0]?.url) throw new Error("پاسخ سرور نامعتبر");
        setImages(prev => [...prev, { url: data.files[0].url, isThumbnail: prev.length === 0 }]);
        toast.dismiss(tId);
      } catch (err: any) { toast.dismiss(tId); toast.error(err.message || "خطا در آپلود تصویر"); }
    }
  };
  
  const removeImage = (url: string) => setImages(prev => prev.filter(img => img.url !== url));
  const setAsThumbnail = (url: string) => setImages(prev => prev.map(img => ({ ...img, isThumbnail: img.url === url })));

  const handleDeleteVariant = async (variantId: string) => {
    if (variantId.startsWith("NEW_")) {
      setVariants(variants.filter((v) => v.id !== variantId));
      return;
    }

    const confirmDelete = window.confirm("آیا از حذف این متغیر اطمینان دارید؟");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${BASE_URL}/admin/products/${id}/variants/${variantId}`, {
        method: "DELETE",
        headers: authHeaders,
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          toast.error(
            "این متغیر در سبد خرید مشتریان است یا سابقه سفارش دارد و قابل حذف نیست! راهکار: نام و قیمت آن را به یکی از متغیرهای جدید تغییر دهید (بازیافت متغیر).",
            { duration: 6000 }
          );
        } else {
          toast.error("خطا در حذف متغیر. لطفاً دوباره تلاش کنید.");
        }
        return;
      }

      toast.success("متغیر با موفقیت حذف شد");
      setVariants(variants.filter((v) => v.id !== variantId));
      
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error("خطای شبکه در ارتباط با سرور.");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  const isSimpleProduct = productOptions.length === 1 && productOptions[0].title === "Default Option";

  return (
    <form onSubmit={handleUpdate} className="max-w-7xl mx-auto pb-20 px-4 md:px-8 relative">
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
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-sm font-medium block mb-1">نام محصول <span className="text-red-500">*</span></label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} required />
                 </div>
                 <div>
                    <label className="text-sm font-medium block mb-1">اسلاگ (URL)</label>
                    <Input value={handle} onChange={e => setHandle(e.target.value)} className="font-mono text-xs bg-gray-50" dir="ltr" />
                 </div>
               </div>
               <div>
                  <label className="text-sm font-medium block mb-1">توضیحات کوتاه محصول (خلاصه)</label>
                  <RichTextEditor content={subtitle} onChange={setSubtitle} />
               </div>
               <div>
                  <label className="text-sm font-medium block mb-1">توضیحات کامل محصول</label>
                  <div className="min-h-[200px]">
                    <RichTextEditor content={description} onChange={setDescription} />
                  </div>
               </div>
            </div>
          </div>

          {/* 🟢 بخش جدید: تنظیمات سئو اضافه شد */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <h2 className="font-bold text-lg text-gray-800 border-b pb-3">تنظیمات سئو (SEO)</h2>
            <div className="space-y-4">
               <div>
                  <label className="text-sm font-medium block mb-1">عنوان سئو (Meta Title)</label>
                  <Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={`${title || "نام محصول"} | خانه ابزار`} />
               </div>
               <div>
                  <label className="text-sm font-medium block mb-1">توضیحات سئو (Meta Description)</label>
                  <Textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} placeholder="اگر خالی باشد، بخشی از توضیحات کوتاه استفاده می‌شود..." className="h-24 resize-none" />
               </div>
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
                        <h3 className="font-bold text-blue-900 flex items-center gap-2"><Layers className="w-4 h-4" /> تولید خودکار واریانتها</h3>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-400 hover:text-blue-700" onClick={() => setShowVariantGenerator(false)}><X className="w-4 h-4" /></Button>
                    </div>
                     
                    {isSimpleProduct && (
                        <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-100 p-2 rounded mb-4 border border-orange-200">
                            <AlertTriangle className="w-4 h-4" />
                            توجه: با ذخیره واریانتهای جدید، حالت "محصول ساده" و قیمت قبلی جایگزین میشود.
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
                    <Button type="button" onClick={generateVariants} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs">تولید لیست واریانتها</Button>
                </div>
            )}

            {/* 🟢 بخش متغیرها دقیقا مثل خانه ابزار باقی ماند (بدون قیمت عمده) */}
            {variants.length === 0 ? (
               <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed">هیچ متغیری ندارد.</div>
            ) : (
               <div className="space-y-3">
                  {variants.map((v, idx) => (
                     <div key={v.id || idx} className={`flex gap-3 items-end p-4 rounded-xl border hover:border-gray-300 transition-colors flex-wrap ${v.id?.startsWith("NEW_") ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100"}`}>
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-xs font-medium text-gray-500 mb-1 block">عنوان</label>
                            <div className="h-9 flex items-center px-3 font-medium text-sm text-gray-700 bg-white rounded border border-gray-200">{v.title}</div>
                        </div>
                        <div className="w-36 flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500 block">قیمت / تخفیف (ریال)</label>
                            <Input type="number" placeholder="اصلی" value={v.price} onChange={(e) => { const newV = [...variants]; newV[idx].price = e.target.value; setVariants(newV); }} className="bg-white h-8 text-xs" />
                            <Input type="number" placeholder="با تخفیف" value={v.sale_price || ""} onChange={(e) => { const newV = [...variants]; newV[idx].sale_price = e.target.value; setVariants(newV); }} className="bg-white h-8 text-xs border-red-200 placeholder:text-red-300" />
                        </div>
                        <div className="w-24"><label className="text-xs font-medium text-gray-500 mb-1 block">موجودی</label><Input type="number" value={v.inventory} onChange={(e) => { const newV = [...variants]; newV[idx].inventory = e.target.value; setVariants(newV); }} className="bg-white h-8 text-xs" /></div>
                         
                        <div className="w-24"><label className="text-xs font-medium text-gray-500 mb-1 block">وزن (گرم)</label><Input type="number" value={v.weight} onChange={(e) => { const newV = [...variants]; newV[idx].weight = e.target.value; setVariants(newV); }} className="bg-white h-8 text-xs" placeholder="مثلا 500" /></div>
                         
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteVariant(v.id || `NEW_${idx}`)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 mb-0.5"><Trash2 className="h-4 w-4" /></Button>
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

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <h2 className="font-bold text-lg text-gray-800 border-b pb-3">محصولات مرتبط</h2>
            <RelatedProductSelector
              selectedIds={relatedIds}
              onChange={setRelatedIds}
              adminToken={token}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-bold text-lg text-gray-800 border-b pb-3">دستهبندی</h2>
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
                <label className="text-sm font-medium text-gray-700 flexش items-center gap-2"><Ruler className="w-4 h-4" /> راهنمای سایز</label>
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