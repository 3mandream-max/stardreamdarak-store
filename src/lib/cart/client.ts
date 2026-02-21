"use client";

import {
  addCartItem,
  createEmptyCart,
  getCartAmounts,
  normalizeCart,
  removeCartItem,
  updateCartItemQty,
} from "@/lib/cart/shared";
import { CART_STORAGE_KEY, type CartItem, type CartMutationResult, type CartState } from "@/lib/cart/types";

function saveCart(cart: CartState) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function loadCart(): CartState {
  if (typeof window === "undefined") return createEmptyCart();
  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return createEmptyCart();

  try {
    return normalizeCart(JSON.parse(raw));
  } catch {
    return createEmptyCart();
  }
}

export function clearCart() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(createEmptyCart()));
}

export function addItemToCart(item: Omit<CartItem, "lineId"> & { qty?: number }): CartMutationResult {
  const current = loadCart();
  const result = addCartItem(current, item);
  saveCart(result.cart);
  return result;
}

export function setItemQty(lineId: string, qty: number): CartMutationResult {
  const current = loadCart();
  const result = updateCartItemQty(current, lineId, qty);
  saveCart(result.cart);
  return result;
}

export function deleteItem(lineId: string): CartState {
  const next = removeCartItem(loadCart(), lineId);
  saveCart(next);
  return next;
}

export function getCartSummary() {
  return getCartAmounts(loadCart());
}
