import { cookies } from "next/headers";
import CreateProductForm from "@/components/admin/create-product-form";

export default async function CreateProductPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_admin_token")?.value || "";

  return <CreateProductForm token={token} />;
}
