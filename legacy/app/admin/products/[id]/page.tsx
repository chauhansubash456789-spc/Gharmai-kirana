import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductForAdmin } from "@/services/product.service";
import { getAllCategories } from "@/services/catalog.service";
import type { DynamicPageProps } from "@/lib/types";

export default async function EditProductPage(props: DynamicPageProps<{ id: string }>) {
  const { id } = await props.params;
  const categories = await getAllCategories();
  const product = await getProductForAdmin(Number(id));
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-5 text-2xl font-bold text-gray-900">Edit Product — {product.name}</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        product={{
          ...product,
          brand: product.brand ?? "",
          image: product.image ?? "",
          description: product.description ?? "",
          supplier: product.supplier ?? "",
          batch: product.batch ?? "",
          expiryDate: product.expiryDate ? product.expiryDate.toISOString() : undefined,
        }}
      />
    </div>
  );
}