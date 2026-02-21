"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { clearCart, loadCart } from "@/lib/cart/client";
import { getCartAmounts } from "@/lib/cart/shared";
import type { CartState } from "@/lib/cart/types";
import { checkoutCustomerSchema, type CheckoutCustomerInput } from "@/lib/validation/checkout";

type FieldErrors = Partial<Record<keyof CheckoutCustomerInput, string>>;

const initialForm: CheckoutCustomerInput = {
  buyerName: "",
  buyerPhone: "",
  recipientName: "",
  recipientPhone: "",
  zipCode: "",
  address1: "",
  address2: "",
  requestNote: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartState | null>(null);
  const [form, setForm] = useState<CheckoutCustomerInput>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCart(loadCart());
  }, []);

  const amounts = useMemo(() => (cart ? getCartAmounts(cart) : { subtotal: 0, shippingFee: 0, total: 0 }), [cart]);

  if (!cart) {
    return <p className="text-sm text-slate-600">Loading checkout...</p>;
  }

  if (cart.items.length === 0) {
    return (
      <section className="space-y-3">
        <h1 className="text-xl font-bold">Checkout</h1>
        <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
          Your cart is empty. Add products first.
        </p>
        <Link href="/products" className="inline-flex rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
          Browse Products
        </Link>
      </section>
    );
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGlobalError("");

    const validated = checkoutCustomerSchema.safeParse(form);
    if (!validated.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of validated.error.issues) {
        const path = issue.path[0] as keyof CheckoutCustomerInput;
        nextErrors[path] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: validated.data,
          cartItems: cart.items.map((item) => ({
            productId: item.productId,
            qty: item.qty,
            selectedOptions: item.selectedOptions,
          })),
        }),
      });

      const payload = (await response.json()) as { error?: string; orderId?: number };
      if (!response.ok || !payload.orderId) {
        setGlobalError(payload.error ?? "Unable to create order.");
        return;
      }

      clearCart();
      router.push(`/order/success?orderId=${payload.orderId}`);
    } catch {
      setGlobalError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Checkout</h1>
      {globalError ? (
        <p className="rounded border border-red-300 bg-red-50 p-2 text-sm text-red-700" role="alert">
          {globalError}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Buyer</legend>
          <TextInput
            id="buyerName"
            label="Name"
            value={form.buyerName}
            error={errors.buyerName}
            onChange={(value) => setForm((prev) => ({ ...prev, buyerName: value }))}
          />
          <TextInput
            id="buyerPhone"
            label="Phone"
            value={form.buyerPhone}
            error={errors.buyerPhone}
            onChange={(value) => setForm((prev) => ({ ...prev, buyerPhone: value }))}
          />
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Recipient</legend>
          <TextInput
            id="recipientName"
            label="Name"
            value={form.recipientName}
            error={errors.recipientName}
            onChange={(value) => setForm((prev) => ({ ...prev, recipientName: value }))}
          />
          <TextInput
            id="recipientPhone"
            label="Phone"
            value={form.recipientPhone}
            error={errors.recipientPhone}
            onChange={(value) => setForm((prev) => ({ ...prev, recipientPhone: value }))}
          />
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Address</legend>
          <TextInput
            id="zipCode"
            label="Zip Code"
            value={form.zipCode}
            error={errors.zipCode}
            onChange={(value) => setForm((prev) => ({ ...prev, zipCode: value }))}
          />
          <TextInput
            id="address1"
            label="Address 1"
            value={form.address1}
            error={errors.address1}
            onChange={(value) => setForm((prev) => ({ ...prev, address1: value }))}
          />
          <TextInput
            id="address2"
            label="Address 2"
            value={form.address2 ?? ""}
            error={errors.address2}
            onChange={(value) => setForm((prev) => ({ ...prev, address2: value }))}
          />
          <TextInput
            id="requestNote"
            label="Request Note"
            value={form.requestNote ?? ""}
            error={errors.requestNote}
            onChange={(value) => setForm((prev) => ({ ...prev, requestNote: value }))}
          />
        </fieldset>

        <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm">
          <p>Subtotal: KRW {amounts.subtotal.toLocaleString("en-US")}</p>
          <p>Shipping: KRW {amounts.shippingFee.toLocaleString("en-US")}</p>
          <p className="mt-1 font-semibold">Total: KRW {amounts.total.toLocaleString("en-US")}</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Creating Order..." : "Place Order"}
        </button>
      </form>
    </section>
  );
}

type TextInputProps = {
  id: keyof CheckoutCustomerInput;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function TextInput({ id, label, value, error, onChange }: TextInputProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
      />
      {error ? (
        <p id={errorId} className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
