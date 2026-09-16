import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { deleteCategory } from "@/services/category.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
  }

  const result = await deleteCategory(id);
  if (result.error) {
    const status = result.error === "Category not found." ? 404 : 409;
    return NextResponse.json({ error: result.error }, { status });
  }

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return NextResponse.json({ success: true });
}