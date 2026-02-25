import { db } from "@/lib/db";
import { maybeInitDatabaseAtRuntime } from "@/lib/runtimeDbInit";

type ListProductsInput = {
  category?: string;
  sort?: string;
};

export type UpsertProductInput = {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
  options?: Record<string, unknown>;
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

export async function getProductById(id: number) {
  await maybeInitDatabaseAtRuntime();
  return db.product.findUnique({ where: { id } });
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

export async function createProduct(input: UpsertProductInput) {
  await maybeInitDatabaseAtRuntime();
  const imageUrl = input.imageUrl?.trim() || null;

  return db.product.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      price: input.price,
      category: input.category,
      stock: input.stock,
      imageUrl,
      images: (imageUrl ? [imageUrl] : []) as never,
      options: (input.options ?? {}) as never,
    },
  });
}

export async function updateProduct(id: number, input: UpsertProductInput) {
  await maybeInitDatabaseAtRuntime();
  const imageUrl = input.imageUrl?.trim() || null;

  return db.product.update({
    where: { id },
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      price: input.price,
      category: input.category,
      stock: input.stock,
      imageUrl,
      images: (imageUrl ? [imageUrl] : []) as never,
      options: (input.options ?? {}) as never,
    },
  });
}

export async function deleteProduct(id: number) {
  await maybeInitDatabaseAtRuntime();
  return db.product.delete({ where: { id } });
}

export async function updateProductImage(id: number, imageUrl: string) {
  await maybeInitDatabaseAtRuntime();
  const nextUrl = imageUrl.trim();

  return db.product.update({
    where: { id },
    data: {
      imageUrl: nextUrl || null,
      images: (nextUrl ? [nextUrl] : []) as never,
    },
  });
}
