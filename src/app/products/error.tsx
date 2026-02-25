"use client";

export default function ProductsError({ reset }: { reset: () => void }) {
  return (
    <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-700">상품 목록을 불러오지 못했습니다.</p>
      <button onClick={reset} className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white">
        다시 시도
      </button>
    </div>
  );
}
