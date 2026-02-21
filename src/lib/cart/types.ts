export const CART_STORAGE_KEY = "stardream_cart_v1";
export const CART_SCHEMA_VERSION = 1 as const;

export type CartItem = {
  lineId: string;
  productId: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  selectedOptions: Record<string, string>;
  qty: number;
};

export type CartState = {
  version: typeof CART_SCHEMA_VERSION;
  items: CartItem[];
  updatedAt: string;
};

export type CartMutationResult = {
  cart: CartState;
  message?: string;
};
