"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deleteItem, loadCart, setItemQty } from "@/lib/cart/client";
import { getCartAmounts } from "@/lib/cart/shared";
import type { CartState } from "@/lib/cart/types";

export default function CartPage() {
  const [cart, setCart] = useState<CartState | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCart(loadCart());
  }, []);

  const amounts = useMemo(() => (cart ? getCartAmounts(cart) : { subtotal: 0, shippingFee: 0, total: 0 }), [cart]);

  if (!cart) {
    return <p className="text-sm text-slate-600">Loading cart...</p>;
  }

  if (cart.items.length === 0) {
    return (
      <section className="space-y-3">
        <h1 className="text-xl font-bold">Cart</h1>
        <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">Your cart is empty.</p>
        <Link href="/products" className="inline-flex rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Cart</h1>
      {message ? (
        <p className="rounded border border-amber-300 bg-amber-50 p-2 text-sm text-amber-900" role="status">
          {message}
        </p>
      ) : null}

      <ul className="space-y-3">
        {cart.items.map((item) => (
          <li key={item.lineId} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex gap-3">
              <div className="h-16 w-16 shrink-0 rounded bg-slate-100 p-1 text-[10px] text-slate-500">{item.image}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.name}</p>
                <p className="text-xs text-slate-600">
                  Options:{" "}
                  {Object.keys(item.selectedOptions).length > 0
                    ? Object.entries(item.selectedOptions)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")
                    : "default"}
                </p>
                <p className="text-sm text-slate-700">KRW {item.price.toLocaleString("en-US")}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const result = setItemQty(item.lineId, item.qty - 1);
                      setCart(result.cart);
                      setMessage(result.message ?? "");
                    }}
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    -
                  </button>
                  <span className="text-sm">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const result = setItemQty(item.lineId, item.qty + 1);
                      setCart(result.cart);
                      setMessage(result.message ?? "");
                    }}
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCart(deleteItem(item.lineId));
                      setMessage("");
                    }}
                    className="ml-auto rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <p>Subtotal: KRW {amounts.subtotal.toLocaleString("en-US")}</p>
        <p>Shipping: KRW {amounts.shippingFee.toLocaleString("en-US")}</p>
        <p className="mt-1 font-semibold">Total: KRW {amounts.total.toLocaleString("en-US")}</p>
      </div>

      <Link href="/checkout" className="inline-flex rounded bg-brand-500 px-4 py-2 text-sm font-semibold text-white">
        Proceed to Checkout
      </Link>
    </section>
  );
}
