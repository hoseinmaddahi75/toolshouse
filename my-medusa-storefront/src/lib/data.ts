import { medusaClient } from "./medusa-client";
import { Product } from "@/types";

const mapMedusaProductToType = (medusaProduct: any): Product => {
  return {
    id: medusaProduct.id,
    title: medusaProduct.title,
    handle: medusaProduct.handle,
    description: medusaProduct.description,
    categories: medusaProduct.categories || [], 
    thumbnail: medusaProduct.thumbnail,
    images: medusaProduct.images || [],
    options: medusaProduct.options || [],
    metadata: medusaProduct.metadata || {},
    
    variants: medusaProduct.variants?.map((v: any) => ({
      id: v.id,
      title: v.title,
      inventory_quantity: v.inventory_quantity,
      manage_inventory: v.manage_inventory,
      allow_backorder: v.allow_backorder, 
      options: v.options,
      
      // 👇👇👇 اصلاح حیاتی: استفاده از قیمت خام اگر محاسبه شده نبود
      prices: v.calculated_price 
        ? [{ 
            amount: v.calculated_price.calculated_amount, 
            currency_code: v.calculated_price.currency_code 
          }]
        : (v.prices || []) // ✅ اگر محاسبه نشده بود، قیمت‌های اصلی را بفرست
    })) || [],
  };
};

async function getRegion() {
  const { regions } = await medusaClient.store.region.list({ limit: 1 });
  return regions[0];
}

// ۱. دریافت لیست همه محصولات
export async function getProductsList(): Promise<Product[]> {
  const region = await getRegion();
  
  if (!region) {
    console.error("No regions found in Medusa!");
    return [];
  }

  const { products } = await medusaClient.store.product.list({
    limit: 20,
    // ✅ اضافه کردن variants.prices به درخواست
    fields: "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.prices",
    region_id: region.id,
  });
  
  return products.map(mapMedusaProductToType);
}

// ۲. دریافت محصولات یک کالکشن خاص
export async function getCollectionProducts(handle: string): Promise<Product[]> {
  if (handle === "all") {
    return getProductsList();
  }

  const region = await getRegion();
  if (!region) return [];

  const { collections } = await medusaClient.store.collection.list({ 
    handle: handle 
  });

  if (!collections.length) {
    return [];
  }

  const { products } = await medusaClient.store.product.list({
    collection_id: [collections[0].id],
    // ✅ اضافه کردن variants.prices به درخواست
    fields: "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.prices",
    region_id: region.id,
  });

  return products.map(mapMedusaProductToType);
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  const region = await getRegion();
  if (!region) return null;

  const { products } = await medusaClient.store.product.list({ 
    handle,
    // ✅ اضافه کردن variants.prices به درخواست
    fields: "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.prices,+options,+images,+metadata,*categories",
    region_id: region.id, 
  });
  
  if (!products.length) return null;

  return mapMedusaProductToType(products[0]);
}