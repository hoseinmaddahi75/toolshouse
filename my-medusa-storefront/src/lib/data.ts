import { medusaClient } from "./medusa-client";
import { Product } from "@/types";

/**
 * Maps a raw Medusa product response to the internal Product type format.
 */
const mapMedusaProductToType = (medusaProduct: any): Product => {
  return {
    id: medusaProduct.id,
    title: medusaProduct.title,
    subtitle: medusaProduct.subtitle, // 🟢 اضافه شدن فیلد subtitle
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
      prices: v.calculated_price
        ? [
            {
              amount: v.calculated_price.calculated_amount,
              original_amount: v.calculated_price.original_amount,
              currency_code: v.calculated_price.currency_code,
            },
            ...(v.prices || []),
          ]
        : v.prices || [],
    })) || [],
  };
};

/**
 * Fetches the default region for pricing and availability operations.
 */
export async function getRegion() {
  try {
    const { regions } = await medusaClient.store.region.list({ limit: 1 });
    return regions[0] || null;
  } catch (error) {
    console.error("Error fetching region:", error);
    return null;
  }
}

/**
 * Retrieves a paginated list of all products.
 */
export async function getProductsList(): Promise<Product[]> {
  const region = await getRegion();

  if (!region) {
    console.warn("No regions found. Cannot fetch products list.");
    return [];
  }

  try {
    const { products } = await medusaClient.store.product.list({
      limit: 20,
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.prices,+subtitle",
      region_id: region.id,
    });

    return products.map(mapMedusaProductToType);
  } catch (error) {
    console.error("Error fetching products list:", error);
    return [];
  }
}

/**
 * Retrieves products belonging to a specific collection handle.
 */
export async function getCollectionProducts(handle: string): Promise<Product[]> {
  if (handle === "all") {
    return getProductsList();
  }

  const region = await getRegion();
  if (!region) return [];

  try {
    const { collections } = await medusaClient.store.collection.list({
      handle,
    });

    if (!collections.length) {
      return [];
    }

    const { products } = await medusaClient.store.product.list({
      collection_id: [collections[0].id],
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.prices,+subtitle",
      region_id: region.id,
    });

    return products.map(mapMedusaProductToType);
  } catch (error) {
    console.error(`Error fetching products for collection ${handle}:`, error);
    return [];
  }
}

/**
 * Retrieves a single product's detailed information by its handle.
 */
export async function getProductByHandle(handle: string): Promise<Product | null> {
  const region = await getRegion();
  if (!region) return null;

  try {
    const customHeaders = {
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
    };

    const { products } = await medusaClient.store.product.list(
      {
        handle,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.prices,+options,+images,+metadata,*categories,+subtitle",
        region_id: region.id,
      },
      customHeaders
    );

    if (!products.length) return null;

    const mappedProduct = mapMedusaProductToType(products[0]);

    // Re-inject calculated_price object directly to mapped variants
    if (mappedProduct && mappedProduct.variants) {
      mappedProduct.variants = mappedProduct.variants.map((variant: any, index: number) => ({
        ...variant,
        calculated_price: products[0].variants[index]?.calculated_price
      }));
    }

    return mappedProduct;
  } catch (error) {
    console.error(`Error fetching product with handle ${handle}:`, error);
    return null;
  }
}