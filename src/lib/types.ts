
export type Restaurant = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  currency: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Modifier = {
  id: string;
  name: string;
  price: number;
  available: boolean;
};

export type SpiceLevel = "mild" | "medium" | "hot";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string; // placeholder path
  available: boolean;
  spiceLevels?: SpiceLevel[];
  modifiers?: Modifier[];
};

export type CartItem = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  spiceLevel?: SpiceLevel;
  modifiers?: Modifier[];
  notes?: string;
};

export type Order = {
  id?: string;
  restaurantSlug: string;
  tableNumber: string;
  items: CartItem[];
  total: number;
  notes?: string;
  status: "pending" | "confirmed" | "completed";
  orderNumber?: string;
  rating?: number;
  feedback?: string;
  createdAt: Date;
};
