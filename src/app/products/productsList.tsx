import Link from "next/link";
import { listCategories, listProducts } from "@/lib/repositories/products";

const sortOptions = [
  { value: "new", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

type ProductsListProps = {
  category?: string;
  sort?: string;
};

export async function ProductsList({ category, sort = "new" }: ProductsListProps) {
  const [categories, products] = await Promise.all([
    listCategories(),
    listProducts({ category, sort }),
  ]);

  return (
    <section className="space-y-4" aria-labelledby="products-list-heading">
      <h2 id="products-list-heading" className="sr-only">
        Product Results
      </h2>

      <form
        className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-2"
        role="search"
        aria-label="Product filters"
      >
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        <select
          id="category"
          name="category"
          defaultValue={category ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label htmlFor="sort" className="text-sm font-medium">
          Sort
        </label>
        <select
          id="sort"
          name="sort"
          defaultValue={sort}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white sm:col-span-2"
        >
          Apply
        </button>
      </form>

      {products.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
          No products match your filters.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {products.map((product) => (
            <li key={product.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="aspect-square rounded-lg bg-slate-100" aria-hidden="true" />
              <h3 className="mt-3 text-sm font-semibold">{product.name}</h3>
              <p className="mt-1 text-sm text-slate-600">KRW {product.price.toLocaleString("en-US")}</p>
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
  );
}
