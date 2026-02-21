import { NextResponse } from "next/server";
import { calculateOrderAmounts } from "@/lib/pricing";
import { generateOrderNumber } from "@/lib/orders/orderNumber";
import { createOrder } from "@/lib/repositories/orders";
import { getProductsByIds } from "@/lib/repositories/products";
import { checkoutRequestSchema } from "@/lib/validation/checkout";

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const parsed = checkoutRequestSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const productIds = [...new Set(parsed.data.cartItems.map((item) => item.productId))];
    const products = await getProductsByIds(productIds);
    const productMap = new Map(products.map((product) => [product.id, product]));

    const snapshotItems: Array<{
      productId: number;
      name: string;
      slug: string;
      image: string;
      price: number;
      qty: number;
      selectedOptions: Record<string, string>;
    }> = [];

    for (const cartItem of parsed.data.cartItems) {
      const product = productMap.get(cartItem.productId);
      if (!product) {
        return NextResponse.json({ error: "Some products are no longer available." }, { status: 400 });
      }

      if (cartItem.qty > product.stock) {
        return NextResponse.json(
          { error: `Stock exceeded for product: ${product.name}. Available: ${product.stock}` },
          { status: 400 },
        );
      }

      const firstImage = Array.isArray(product.images) && product.images[0] ? String(product.images[0]) : "";
      snapshotItems.push({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: firstImage,
        price: product.price,
        qty: cartItem.qty,
        selectedOptions: cartItem.selectedOptions,
      });
    }

    const amounts = calculateOrderAmounts(snapshotItems.map((item) => ({ price: item.price, qty: item.qty })));
    const order = await createOrder({
      orderNumber: generateOrderNumber(),
      customer: parsed.data.customer,
      items: snapshotItems,
      subtotal: amounts.subtotal,
      shippingFee: amounts.shippingFee,
      totalPrice: amounts.total,
      status: "created",
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error while creating order." }, { status: 500 });
  }
}
