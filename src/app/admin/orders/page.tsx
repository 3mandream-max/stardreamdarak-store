import Link from "next/link";
import { requireAdminAuth } from "@/lib/adminAuth";
import { listOrders } from "@/lib/repositories/orders";

const statusLabelMap: Record<string, string> = {
  created: "생성됨",
  paid: "결제완료",
  shipped: "배송중",
  cancelled: "취소됨",
};

function formatStatus(status: string) {
  return statusLabelMap[status] ?? status;
}

export default async function AdminOrdersPage() {
  await requireAdminAuth();
  const orders = await listOrders();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">관리자 주문 목록</h1>
        <Link href="/admin" className="text-sm text-slate-600 hover:underline">
          상품 목록으로
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">아직 주문이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {orders.map((order) => (
            <li key={order.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <p className="font-semibold">{order.orderNumber}</p>
              <p className="text-slate-600">상태: {formatStatus(order.status)}</p>
              <p className="text-slate-600">총액: KRW {order.totalPrice.toLocaleString("en-US")}</p>
              <Link href={`/admin/orders/${order.id}`} className="text-brand-600 hover:underline">
                상세 보기
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
