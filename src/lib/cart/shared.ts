import { calculateOrderAmounts } from "@/lib/pricing";
import { CART_SCHEMA_VERSION, type CartItem, type CartMutationResult, type CartState } from "./types";

export function createEmptyCart(): CartState {
  return {
    version: CART_SCHEMA_VERSION,
    items: [],
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeCart(input: unknown): CartState {
  if (!input || typeof input !== "object") return createEmptyCart();

  const maybe = input as Partial<CartState>;
  if (maybe.version !== CART_SCHEMA_VERSION || !Array.isArray(maybe.items)) {
    return createEmptyCart();
  }

  return {
    version: CART_SCHEMA_VERSION,
    updatedAt: typeof maybe.updatedAt === "string" ? maybe.updatedAt : new Date().toISOString(),
    items: maybe.items
      .filter((item): item is CartItem => Boolean(item && typeof item === "object"))
      .map((item) => ({
        ...item,
        qty: clampQty(item.qty, item.stock),
      })),
  };
}

export function buildLineId(productId: number, selectedOptions: Record<string, string>) {
  const optionEntries = Object.entries(selectedOptions).sort(([a], [b]) => a.localeCompare(b));
  const optionKey = optionEntries.map(([k, v]) => `${k}:${v}`).join("|");
  return `${productId}::${optionKey}`;
}

export function addCartItem(
  cart: CartState,
  newItem: Omit<CartItem, "lineId"> & { qty?: number },
): CartMutationResult {
  const qtyToAdd = clampQty(newItem.qty ?? 1, newItem.stock);
  const lineId = buildLineId(newItem.productId, newItem.selectedOptions);
  const existing = cart.items.find((item) => item.lineId === lineId);

  if (!existing) {
    const next: CartItem = {
      ...newItem,
      qty: qtyToAdd,
      lineId,
    };
    return {
      cart: { ...cart, items: [...cart.items, next], updatedAt: new Date().toISOString() },
    };
  }

  const targetQty = existing.qty + qtyToAdd;
  const maxAllowed = Math.max(1, Math.min(99, existing.stock));
  const clampedQty = Math.min(targetQty, maxAllowed);
  const message =
    clampedQty !== targetQty ? `Quantity limited by stock. Maximum available: ${maxAllowed}.` : undefined;

  return {
    cart: {
      ...cart,
      updatedAt: new Date().toISOString(),
      items: cart.items.map((item) => (item.lineId === lineId ? { ...item, qty: clampedQty } : item)),
    },
    message,
  };
}

export function updateCartItemQty(cart: CartState, lineId: string, nextQty: number): CartMutationResult {
  const target = cart.items.find((item) => item.lineId === lineId);
  if (!target) return { cart };

  const clampedQty = clampQty(nextQty, target.stock);
  const message =
    clampedQty !== nextQty
      ? `Quantity limited between 1 and ${Math.max(1, Math.min(99, target.stock))}.`
      : undefined;

  return {
    cart: {
      ...cart,
      updatedAt: new Date().toISOString(),
      items: cart.items.map((item) => (item.lineId === lineId ? { ...item, qty: clampedQty } : item)),
    },
    message,
  };
}

export function removeCartItem(cart: CartState, lineId: string): CartState {
  return {
    ...cart,
    updatedAt: new Date().toISOString(),
    items: cart.items.filter((item) => item.lineId !== lineId),
  };
}

export function getCartAmounts(cart: CartState) {
  return calculateOrderAmounts(cart.items.map((item) => ({ price: item.price, qty: item.qty })));
}

function clampQty(qty: number, stock: number) {
  const safeQty = Number.isFinite(qty) ? Math.floor(qty) : 1;
  const max = Math.max(1, Math.min(99, Math.floor(stock || 1)));
  return Math.max(1, Math.min(max, safeQty));
}
