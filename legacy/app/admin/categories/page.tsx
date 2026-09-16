import { CategoryForm } from "@/components/admin/CategoryForm";
import { CategoryGrid } from "@/components/admin/CategoryGrid";
import { listCategoriesWithProductCount } from "@/services/category.service";

export default async function CategoriesPage() {
  const categories = await listCategoriesWithProductCount();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
      <CategoryForm />

      <CategoryGrid
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          image: c.image,
          productCount: c._count.products,
        }))}
      />
    </div>
  );
}