import Link from "next/link";
import { redirect } from "next/navigation";
import { clearAdminAuthCookie, isAdminAuthenticated, setAdminAuthCookie } from "@/lib/adminAuth";
import { deleteProduct, listProducts } from "@/lib/repositories/products";
import { DeleteProductButton } from "./products/_components/DeleteProductButton";
import { ProductImageUploader } from "./products/_components/ProductImageUploader";

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    redirect("/admin?error=login");
  }

  await setAdminAuthCookie();
  redirect("/admin");
}

async function logout() {
  "use server";
  await clearAdminAuthCookie();
  redirect("/admin");
}

async function removeProduct(formData: FormData) {
  "use server";

  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) {
    redirect("/admin?error=invalid");
  }

  try {
    await deleteProduct(id);
    redirect("/admin?message=deleted");
  } catch {
    redirect("/admin?error=delete");
  }
}

type AdminPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <section className="mx-auto max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h1 className="text-xl font-bold">관리자 로그인</h1>
        <p className="text-sm text-slate-600">환경변수에 설정된 관리자 비밀번호를 입력하세요.</p>
        {params.error === "login" ? <p className="text-sm text-red-600">비밀번호가 올바르지 않습니다.</p> : null}
        <form action={login} className="space-y-3">
          <label htmlFor="password" className="text-sm font-medium">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            name="password"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            autoComplete="current-password"
          />
          <button type="submit" className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
            로그인
          </button>
        </form>
      </section>
    );
  }

  const products = await listProducts({ sort: "new" });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">관리자 상품 목록</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/products/new" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
            추가
          </Link>
          <Link href="/admin/orders" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            주문 관리
          </Link>
          <form action={logout}>
            <button type="submit" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              로그아웃
            </button>
          </form>
        </div>
      </div>

      {params.error === "delete" ? <p className="text-sm text-red-600">상품 삭제에 실패했습니다.</p> : null}
      {params.message === "deleted" ? <p className="text-sm text-green-700">상품을 삭제했습니다.</p> : null}

      <ul className="space-y-2">
        {products.map((product) => (
          <li key={product.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-slate-600">슬러그: {product.slug}</p>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={`${product.name} 썸네일`} className="mt-2 h-16 w-16 rounded border border-slate-300 object-cover" />
                ) : (
                  <div className="mt-2 h-16 w-16 rounded border border-dashed border-slate-300 bg-slate-50" aria-hidden="true" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/products/${product.id}/edit`} className="rounded border border-slate-300 px-2 py-1 text-xs">
                  수정
                </Link>
                <form>
                  <input type="hidden" name="id" value={product.id} />
                  <DeleteProductButton productName={product.name} formAction={removeProduct} />
                </form>
              </div>
            </div>
            <p className="text-slate-600">가격: KRW {product.price.toLocaleString("en-US")} / 재고: {product.stock}</p>
            <div className="mt-2">
              <ProductImageUploader productId={product.id} currentImageUrl={product.imageUrl} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
