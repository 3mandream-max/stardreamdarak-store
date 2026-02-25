"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addItemToCart } from "@/lib/cart/client";

type ProductOptionValue = string[];

type AddToCartPanelProps = {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    stock: number;
    image: string;
    options: Record<string, ProductOptionValue>;
  };
};

export function AddToCartPanel({ product }: AddToCartPanelProps) {
  const initialOptions = useMemo(() => {
    const next: Record<string, string> = {};
    Object.entries(product.options).forEach(([name, values]) => {
      next[name] = values[0] ?? "default";
    });
    return next;
  }, [product.options]);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(initialOptions);
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-3">
      {Object.entries(product.options).map(([name, values]) => (
        <div key={name}>
          <label htmlFor={`opt-${name}`} className="block text-sm font-medium">
            {name}
          </label>
          <select
            id={`opt-${name}`}
            value={selectedOptions[name]}
            onChange={(e) =>
              setSelectedOptions((prev) => ({
                ...prev,
                [name]: e.target.value,
              }))
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {values.map((value) => (
              <option key={`${name}-${value}`} value={value}>
                {value === "default" ? "기본" : value}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          const result = addItemToCart({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.image,
            price: product.price,
            stock: product.stock,
            selectedOptions,
            qty: 1,
          });
          setMessage(result.message ?? "장바구니에 담았습니다.");
        }}
        className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        aria-label={`${product.name} 장바구니 담기`}
      >
        장바구니 담기
      </button>

      <p className="text-xs text-slate-600" aria-live="polite">
        {message}
      </p>
      <Link href="/cart" className="inline-flex text-sm text-brand-600 hover:underline">
        장바구니로 이동
      </Link>
    </div>
  );
}
