import { ProductForm } from "@/components/admin/ProductForm";
import { getAllCategories } from "@/services/catalog.service";

export default async function NewProductPage() {
  const categories = await getAllCategories();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-5 text-2xl font-bold text-gray-900">Add Product</h1>
      <ProductForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}