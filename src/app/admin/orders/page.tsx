import Link from "next/link";
import { requireAdminAuth } from "@/lib/adminAuth";
import { listOrders } from "@/lib/repositories/orders";

export default async function AdminOrdersPage() {
  await requireAdminAuth();
  const orders = await listOrders();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Admin Orders</h1>
        <Link href="/admin" className="text-sm text-slate-600 hover:underline">
          Back to Products
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
          No orders yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {orders.map((order) => (
            <li key={order.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <p className="font-semibold">{order.orderNumber}</p>
              <p className="text-slate-600">Status: {order.status}</p>
              <p className="text-slate-600">Total: KRW {order.totalPrice.toLocaleString("en-US")}</p>
              <Link href={`/admin/orders/${order.id}`} className="text-brand-600 hover:underline">
                View Detail
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
