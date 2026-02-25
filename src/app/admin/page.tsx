import Link from "next/link";
import { redirect } from "next/navigation";
import { clearAdminAuthCookie, isAdminAuthenticated, setAdminAuthCookie } from "@/lib/adminAuth";
import { listProducts } from "@/lib/repositories/products";

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    redirect("/admin?error=1");
  }

  await setAdminAuthCookie();

  redirect("/admin");
}

async function logout() {
  "use server";
  await clearAdminAuthCookie();
  redirect("/admin");
}

type AdminPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <section className="mx-auto max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h1 className="text-xl font-bold">관리자 로그인</h1>
        <p className="text-sm text-slate-600">환경변수에 설정된 관리자 비밀번호를 입력하세요.</p>
        {params.error ? <p className="text-sm text-red-600">비밀번호가 올바르지 않습니다.</p> : null}
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
      <ul className="space-y-2">
        {products.map((product) => (
          <li key={product.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
            <p className="font-semibold">{product.name}</p>
            <p className="text-slate-600">슬러그: {product.slug}</p>
            <p className="text-slate-600">
              가격: KRW {product.price.toLocaleString("en-US")} / 재고: {product.stock}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
