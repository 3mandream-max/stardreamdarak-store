import { Prisma } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { requireAdminAuth } from "@/lib/adminAuth";
import { getProductById, getProductBySlug, updateProduct } from "@/lib/repositories/products";
import { ImageUploadField } from "../../_components/ImageUploadField";

async function updateProductAction(formData: FormData) {
  "use server";

  await requireAdminAuth();

  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const optionsRaw = String(formData.get("optionsJson") ?? "").trim();

  if (!Number.isInteger(id)) {
    redirect("/admin?error=invalid");
  }

  if (!name) {
    redirect(`/admin/products/${id}/edit?error=상품명은+필수입니다.`);
  }

  if (!slug) {
    redirect(`/admin/products/${id}/edit?error=슬러그는+필수입니다.`);
  }

  if (!Number.isFinite(price)) {
    redirect(`/admin/products/${id}/edit?error=가격은+필수입니다.`);
  }

  if (price < 0 || stock < 0) {
    redirect(`/admin/products/${id}/edit?error=가격과+재고는+0+이상이어야+합니다.`);
  }

  const existing = await getProductBySlug(slug);
  if (existing && existing.id !== id) {
    redirect(`/admin/products/${id}/edit?error=이미+사용+중인+슬러그입니다.`);
  }

  let options: Record<string, unknown> = {};
  if (optionsRaw) {
    try {
      options = JSON.parse(optionsRaw) as Record<string, unknown>;
    } catch {
      redirect(`/admin/products/${id}/edit?error=옵션+JSON+형식이+올바르지+않습니다.`);
    }
  }

  try {
    await updateProduct(id, {
      name,
      slug,
      description,
      category,
      imageUrl: imageUrl || undefined,
      price: Math.floor(price),
      stock: Math.floor(stock),
      options,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect(`/admin/products/${id}/edit?error=이미+사용+중인+슬러그입니다.`);
    }
    redirect(`/admin/products/${id}/edit?error=상품+수정에+실패했습니다.`);
  }

  redirect("/admin");
}

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditProductPage({ params, searchParams }: EditProductPageProps) {
  await requireAdminAuth();
  const { id } = await params;
  const productId = Number(id);
  const query = await searchParams;

  if (!Number.isInteger(productId)) {
    notFound();
  }

  const product = await getProductById(productId);
  if (!product) {
    notFound();
  }

  const productOptions = product.options && typeof product.options === "object" ? product.options : {};
  const initialImageUrl = product.imageUrl || (Array.isArray(product.images) && product.images[0] ? String(product.images[0]) : "");

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">상품 수정</h1>
      {query.error ? <p className="rounded border border-red-300 bg-red-50 p-2 text-sm text-red-700">{query.error}</p> : null}

      <form action={updateProductAction} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <input type="hidden" name="id" value={product.id} />
        <Input name="name" label="상품명" required defaultValue={product.name} />
        <Input name="slug" label="슬러그" required defaultValue={product.slug} />
        <Input name="category" label="카테고리" required defaultValue={product.category} />
        <Input name="price" type="number" min={0} step={1} label="가격" required defaultValue={product.price} />
        <Input name="stock" type="number" min={0} step={1} label="재고" required defaultValue={product.stock} />

        <div className="space-y-1">
          <label htmlFor="description" className="font-medium">
            설명
          </label>
          <textarea
            id="description"
            name="description"
            required
            defaultValue={product.description}
            className="min-h-24 w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <ImageUploadField initialImageUrl={initialImageUrl} />

        <div className="space-y-1">
          <label htmlFor="optionsJson" className="font-medium">
            옵션 JSON (선택)
          </label>
          <textarea
            id="optionsJson"
            name="optionsJson"
            defaultValue={JSON.stringify(productOptions)}
            className="min-h-20 w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <button type="submit" className="rounded bg-slate-900 px-3 py-2 font-semibold text-white">
          수정하기
        </button>
      </form>
    </section>
  );
}

type InputProps = {
  name: string;
  label: string;
  required?: boolean;
  type?: "text" | "number";
  min?: number;
  step?: number;
  defaultValue?: string | number;
};

function Input({ name, label, required, type = "text", min, step, defaultValue }: InputProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        min={min}
        step={step}
        defaultValue={defaultValue}
        className="w-full rounded border border-slate-300 px-3 py-2"
      />
    </div>
  );
}
