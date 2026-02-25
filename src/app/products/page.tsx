import { Suspense } from "react";
import { ProductsList } from "./productsList";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    sort?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">상품 목록</h1>
      <Suspense fallback={<p className="text-sm text-slate-600">상품을 불러오는 중입니다...</p>}>
        <ProductsList category={params.category} sort={params.sort} />
      </Suspense>
    </div>
  );
}
