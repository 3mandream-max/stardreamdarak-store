"use client";

export default function AdminOrdersError({ reset }: { reset: () => void }) {
  return (
    <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-700">Unable to load admin orders.</p>
      <button onClick={reset} className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white">
        Retry
      </button>
    </div>
  );
}
