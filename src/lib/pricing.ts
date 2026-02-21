type PricedItem = {
  price: number;
  qty: number;
};

export type OrderAmounts = {
  subtotal: number;
  shippingFee: number;
  total: number;
};

export function calculateOrderAmounts(items: PricedItem[]): OrderAmounts {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingFee = subtotal >= 50000 || subtotal === 0 ? 0 : 3000;
  const total = subtotal + shippingFee;

  return { subtotal, shippingFee, total };
}
