import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/repositories/products";
import { AddToCartPanel } from "./ui";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const images = Array.isArray(product.images) ? product.images : [];
  const mergedImages = product.imageUrl ? [product.imageUrl, ...images] : images;
  const normalizedOptions = normalizeProductOptions(product.options);

  return (
    <article className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid grid-cols-2 gap-2" aria-label="상품 이미지 갤러리">
          {mergedImages.length > 0 ? (
            mergedImages.map((img, idx) => (
              <div
                key={`${String(img)}-${idx}`}
                className="aspect-square rounded-xl border border-slate-200 bg-slate-100 p-2 text-xs text-slate-600"
              >
                <p className="truncate">{String(img)}</p>
              </div>
            ))
          ) : (
            <div className="col-span-2 aspect-square rounded-xl bg-slate-100" />
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-600">{product.category}</p>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-xl font-semibold">KRW {product.price.toLocaleString("en-US")}</p>
          <p className="text-sm leading-relaxed text-slate-700">{product.description}</p>
          <p className="text-sm text-slate-600">재고: {product.stock}</p>
          <AddToCartPanel
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              stock: product.stock,
              image: mergedImages[0] ? String(mergedImages[0]) : "/placeholder/default.png",
              options: normalizedOptions,
            }}
          />
        </div>
      </div>
    </article>
  );
}

function normalizeProductOptions(raw: unknown): Record<string, string[]> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { option: ["default"] };
  }

  const result: Record<string, string[]> = {};
  Object.entries(raw as Record<string, unknown>).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      result[key] = value.map((v) => String(v));
      return;
    }

    if (typeof value === "string" && value.length > 0) {
      result[key] = [value];
      return;
    }
  });

  if (Object.keys(result).length === 0) {
    return { option: ["default"] };
  }

  return result;
}
