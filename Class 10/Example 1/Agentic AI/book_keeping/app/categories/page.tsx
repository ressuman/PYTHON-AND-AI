import { prisma } from "@/lib/db";
import { CategoryList } from "@/components/category-list";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { expenses: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
      <CategoryList
        categories={categories.map((c) => ({
          ...c,
          color: c.color ?? "#6b7280",
        }))}
      />
    </div>
  );
}
