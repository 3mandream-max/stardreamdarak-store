import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAdminAuth } from "@/lib/adminAuth";
import { createProduct, getProductBySlug } from "@/lib/repositories/products";
import { ImageUploadField } from "../_components/ImageUploadField";

async function createProductAction(formData: FormData) {
  "use server";

  await requireAdminAuth();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const optionsRaw = String(formData.get("optionsJson") ?? "").trim();

  if (!name) {
    redirect("/admin/products/new?error=상품명은+필수입니다.");
  }

  if (!slug) {
    redirect("/admin/products/new?error=슬러그는+필수입니다.");
  }

  if (!Number.isFinite(price)) {
    redirect("/admin/products/new?error=가격은+필수입니다.");
  }

  if (price < 0 || stock < 0) {
    redirect("/admin/products/new?error=가격과+재고는+0+이상이어야+합니다.");
  }

  const existing = await getProductBySlug(slug);
  if (existing) {
    redirect("/admin/products/new?error=이미+사용+중인+슬러그입니다.");
  }

  let options: Record<string, unknown> = {};
  if (optionsRaw) {
    try {
      options = JSON.parse(optionsRaw) as Record<string, unknown>;
    } catch {
      redirect("/admin/products/new?error=옵션+JSON+형식이+올바르지+않습니다.");
    }
  }

  try {
    await createProduct({
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
      redirect("/admin/products/new?error=이미+사용+중인+슬러그입니다.");
    }
    redirect("/admin/products/new?error=상품+생성에+실패했습니다.");
  }

  redirect("/admin");
}

type NewProductPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  await requireAdminAuth();
  const params = await searchParams;

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">상품 등록</h1>
      {params.error ? <p className="rounded border border-red-300 bg-red-50 p-2 text-sm text-red-700">{params.error}</p> : null}

      <form action={createProductAction} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <Input name="name" label="상품명" required />
        <Input name="slug" label="슬러그" required />
        <Input name="category" label="카테고리" required />
        <Input name="price" type="number" min={0} step={1} label="가격" required />
        <Input name="stock" type="number" min={0} step={1} label="재고" required />

        <div className="space-y-1">
          <label htmlFor="description" className="font-medium">
            설명
          </label>
          <textarea id="description" name="description" required className="min-h-24 w-full rounded border border-slate-300 px-3 py-2" />
        </div>

        <ImageUploadField />

        <div className="space-y-1">
          <label htmlFor="optionsJson" className="font-medium">
            옵션 JSON (선택)
          </label>
          <textarea
            id="optionsJson"
            name="optionsJson"
            placeholder='{"color":["white","black"]}'
            className="min-h-20 w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <button type="submit" className="rounded bg-slate-900 px-3 py-2 font-semibold text-white">
          등록하기
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
