import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-base font-extrabold tracking-tight text-brand-900">
          별꿈다락
        </Link>
        <nav aria-label="주요 내비게이션" className="flex items-center gap-4 text-sm">
          <Link href="/products" className="hover:underline">
            상품
          </Link>
          <Link href="/admin" className="hover:underline">
            관리자
          </Link>
          <Link href="/cart" className="rounded-full border border-slate-300 px-3 py-1" aria-label="장바구니 열기">
            장바구니
          </Link>
        </nav>
      </div>
    </header>
  );
}
