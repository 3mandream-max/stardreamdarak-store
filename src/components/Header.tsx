import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-base font-extrabold tracking-tight text-brand-900">
          Stardream
        </Link>
        <nav aria-label="Primary navigation" className="flex items-center gap-4 text-sm">
          <Link href="/products" className="hover:underline">
            Products
          </Link>
          <Link href="/admin" className="hover:underline">
            Admin
          </Link>
          <Link href="/cart" className="rounded-full border border-slate-300 px-3 py-1" aria-label="Open cart">
            Cart
          </Link>
        </nav>
      </div>
    </header>
  );
}
