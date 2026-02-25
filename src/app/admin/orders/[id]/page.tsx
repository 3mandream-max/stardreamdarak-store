import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/lib/adminAuth";
import { ORDER_STATUSES, getOrderById, updateOrderStatus } from "@/lib/repositories/orders";

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

const statusLabelMap: Record<string, string> = {
  created: "생성됨",
  paid: "결제완료",
  shipped: "배송중",
  cancelled: "취소됨",
};

function formatStatus(status: string) {
  return statusLabelMap[status] ?? status;
}

async function changeStatus(formData: FormData) {
  "use server";

  await requireAdminAuth();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!Number.isInteger(id) || !ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    redirect("/admin/orders");
  }

  await updateOrderStatus(id, status as (typeof ORDER_STATUSES)[number]);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  await requireAdminAuth();
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) {
    notFound();
  }

  const order = await getOrderById(orderId);
  if (!order) {
    notFound();
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const customer = order.customer && typeof order.customer === "object" ? (order.customer as Record<string, unknown>) : {};

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">주문 상세</h1>
        <Link href="/admin/orders" className="text-sm text-slate-600 hover:underline">
          주문 목록으로
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <p className="font-semibold">{order.orderNumber}</p>
        <p className="text-slate-600">생성 시각: {order.createdAt.toISOString()}</p>
        <p className="text-slate-600">상태: {formatStatus(order.status)}</p>
        <p className="text-slate-600">상품 금액: KRW {order.subtotal.toLocaleString("en-US")}</p>
        <p className="text-slate-600">배송비: KRW {order.shippingFee.toLocaleString("en-US")}</p>
        <p className="text-slate-600">총 결제금액: KRW {order.totalPrice.toLocaleString("en-US")}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <h2 className="font-semibold">주문자 정보</h2>
        <p className="text-slate-700">주문자: {String(customer.buyerName ?? "-")}</p>
        <p className="text-slate-700">수령인: {String(customer.recipientName ?? "-")}</p>
        <p className="text-slate-700">
          주소: {String(customer.zipCode ?? "")} {String(customer.address1 ?? "")} {String(customer.address2 ?? "")}
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <h2 className="font-semibold">주문 상품</h2>
        <ul className="mt-2 space-y-2">
          {items.map((item, idx) => {
            const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
            return (
              <li key={idx} className="rounded border border-slate-200 p-2">
                <p className="font-medium">{String(row.name ?? "-")}</p>
                <p className="text-slate-600">수량: {String(row.qty ?? "-")}</p>
                <p className="text-slate-600">가격: KRW {String(row.price ?? "-")}</p>
              </li>
            );
          })}
        </ul>
      </div>

      <form action={changeStatus} className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <input type="hidden" name="id" value={order.id} />
        <label htmlFor="status" className="font-medium">
          주문 상태
        </label>
        <select id="status" name="status" defaultValue={order.status} className="w-full rounded border border-slate-300 px-3 py-2">
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatStatus(status)}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded bg-slate-900 px-3 py-2 font-semibold text-white">
          상태 업데이트
        </button>
      </form>
    </section>
  );
}
