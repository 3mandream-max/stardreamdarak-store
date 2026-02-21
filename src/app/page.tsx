import Link from "next/link";
import { getFeaturedProducts } from "@/lib/repositories/products";

export default async function HomePage() {
  const products = await getFeaturedProducts(6);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 p-6">
        <p className="text-sm font-semibold text-brand-900">Stardream Goods</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-4xl">
          Build your favorite universe with goods.
        </h1>
        <p className="mt-3 text-sm text-slate-700 sm:text-base">
          Fast discovery, simple checkout, and clear product information for MVP launch.
        </p>
        <div className="mt-5">
          <Link
            href="/products"
            className="inline-flex rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Browse Products
          </Link>
        </div>
      </section>

      <section aria-labelledby="featured-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="featured-heading" className="text-lg font-semibold">
            Featured Products
          </h2>
          <Link href="/products" className="text-sm text-slate-600 underline-offset-2 hover:underline">
            View All
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
            No products yet.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.map((product) => (
              <li key={product.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="aspect-square rounded-lg bg-slate-100" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-semibold">{product.name}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  KRW {product.price.toLocaleString("en-US")}
                </p>
                <Link
                  href={`/products/${product.slug}`}
                  className="mt-2 inline-flex text-sm font-medium text-brand-600 hover:underline"
                >
                  Product Detail
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
