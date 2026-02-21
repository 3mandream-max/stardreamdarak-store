import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/repositories/orders";

type OrderSuccessPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const params = await searchParams;
  const orderId = Number(params.orderId);

  if (!Number.isInteger(orderId)) {
    notFound();
  }

  const order = await getOrderById(orderId);
  if (!order) {
    notFound();
  }

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Order Completed</h1>
      <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        Payment is currently mock flow. Please treat this order as pending.
      </p>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <p className="font-semibold">Order Number: {order.orderNumber}</p>
        <p>Subtotal: KRW {order.subtotal.toLocaleString("en-US")}</p>
        <p>Shipping: KRW {order.shippingFee.toLocaleString("en-US")}</p>
        <p className="font-semibold">Total: KRW {order.totalPrice.toLocaleString("en-US")}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold">Items</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {items.map((item, idx) => {
            const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
            return (
              <li key={idx} className="rounded border border-slate-200 p-2">
                <p className="font-medium">{String(row.name ?? "-")}</p>
                <p className="text-slate-600">Qty: {String(row.qty ?? "-")}</p>
                <p className="text-slate-600">Price: KRW {String(row.price ?? "-")}</p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex gap-2">
        <Link href="/" className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
          Home
        </Link>
        <Link href="/products" className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold">
          Products
        </Link>
      </div>
    </section>
  );
}
