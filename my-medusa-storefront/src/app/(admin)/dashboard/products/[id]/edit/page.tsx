import { cookies } from "next/headers";
import EditProductForm from "@/components/admin/edit-product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_admin_token")?.value || "";

  return <EditProductForm id={id} token={token} />;
}
