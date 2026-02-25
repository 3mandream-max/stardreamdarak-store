import { db } from "@/lib/db";
import { maybeInitDatabaseAtRuntime } from "@/lib/runtimeDbInit";

type ListProductsInput = {
  category?: string;
  sort?: string;
};

const orderByMap = {
  new: { createdAt: "desc" as const },
  price_asc: { price: "asc" as const },
  price_desc: { price: "desc" as const },
};

export async function getFeaturedProducts(limit = 6) {
  await maybeInitDatabaseAtRuntime();
  return db.product.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function listProducts({ category, sort = "new" }: ListProductsInput) {
  await maybeInitDatabaseAtRuntime();
  return db.product.findMany({
    where: category ? { category } : undefined,
    orderBy: orderByMap[sort as keyof typeof orderByMap] ?? orderByMap.new,
  });
}

export async function getProductBySlug(slug: string) {
  await maybeInitDatabaseAtRuntime();
  return db.product.findUnique({ where: { slug } });
}

export async function getProductsByIds(ids: number[]) {
  await maybeInitDatabaseAtRuntime();
  if (ids.length === 0) return [];
  return db.product.findMany({
    where: { id: { in: ids } },
  });
}

export async function listCategories() {
  await maybeInitDatabaseAtRuntime();
  const rows = await db.product.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return rows.map((row) => row.category);
}
