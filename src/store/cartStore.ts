import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from '@/lib/types';

interface CartState {
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  restaurantSlug: string;
  items: CartItem[];
  setTableNumber: (tableNumber: string) => void;
  setCustomerInfo: (name: string, phone: string) => void;
  setRestaurantSlug: (slug: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string, spiceLevel?: string, modifiers?: any[]) => void;
  updateQuantity: (itemId: string, quantity: number, spiceLevel?: string, modifiers?: any[]) => void;
  orderIds: string[];
  addOrderId: (orderId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      tableNumber: '',
      customerName: '',
      customerPhone: '',
      restaurantSlug: '',
      items: [],
      setTableNumber: (tableNumber) => set({ tableNumber }),
      setCustomerInfo: (customerName, customerPhone) => set({ customerName, customerPhone }),
      setRestaurantSlug: (restaurantSlug) => set({ restaurantSlug }),
      addToCart: (newItem) => {
        const items = get().items;
        // Check if item already exists with exact same options
        const existingItemIndex = items.findIndex(
          (item) =>
            item.itemId === newItem.itemId &&
            item.spiceLevel === newItem.spiceLevel &&
            JSON.stringify(item.modifiers) === JSON.stringify(newItem.modifiers)
        );

        if (existingItemIndex > -1) {
          const newItems = [...items];
          newItems[existingItemIndex].quantity += newItem.quantity;
          set({ items: newItems });
        } else {
          set({ items: [...items, newItem] });
        }
      },
      removeFromCart: (itemId, spiceLevel, modifiers) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.itemId === itemId &&
                item.spiceLevel === spiceLevel &&
                JSON.stringify(item.modifiers) === JSON.stringify(modifiers)
              )
          ),
        }));
      },
      updateQuantity: (itemId, quantity, spiceLevel, modifiers) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId, spiceLevel, modifiers);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.itemId === itemId &&
            item.spiceLevel === spiceLevel &&
            JSON.stringify(item.modifiers) === JSON.stringify(modifiers)
              ? { ...item, quantity }
              : item
          ),
        }));
      },
      orderIds: [],
      addOrderId: (orderId) => set((state) => ({ 
        orderIds: [...new Set([...state.orderIds, orderId])] 
      })),
      clearCart: () => set({ items: [] }), // Removed tableNumber clear so user stays signed in to table
      totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
    }),
    {
      name: 'restaurant-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
