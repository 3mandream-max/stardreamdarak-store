import { db } from "@/lib/db";

export const ORDER_STATUSES = ["created", "paid", "shipped", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

type CreateOrderInput = {
  orderNumber: string;
  items: Array<{
    productId: number;
    name: string;
    slug: string;
    image: string;
    price: number;
    qty: number;
    selectedOptions: Record<string, string>;
  }>;
  customer: {
    buyerName: string;
    buyerPhone: string;
    recipientName: string;
    recipientPhone: string;
    zipCode: string;
    address1: string;
    address2?: string;
    requestNote?: string;
  };
  subtotal: number;
  shippingFee: number;
  totalPrice: number;
  status?: OrderStatus;
};

export async function listOrders() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: number) {
  return db.order.findUnique({ where: { id } });
}

export async function createOrder(input: CreateOrderInput) {
  return db.order.create({
    data: {
      orderNumber: input.orderNumber,
      items: input.items as never,
      customer: input.customer as never,
      subtotal: input.subtotal,
      shippingFee: input.shippingFee,
      totalPrice: input.totalPrice,
      status: input.status ?? "created",
    },
  });
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  return db.order.update({
    where: { id },
    data: { status },
  });
}
