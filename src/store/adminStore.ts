import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Organization, TeamMember, Role } from '@/lib/adminTypes';
import { MOCK_RESTAURANT, MOCK_MENU_ITEMS } from '@/lib/mockData';
import { MenuItem, Order } from '@/lib/types';

// Mock Data for Admin
const MOCK_ORG: Organization = {
  id: MOCK_RESTAURANT.id,
  name: MOCK_RESTAURANT.name,
  slug: MOCK_RESTAURANT.slug,
};

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Admin', email: 'admin@demo.com', role: 'admin', organizationId: MOCK_ORG.id },
  { id: 'u2', name: 'Bob Staff', email: 'member@demo.com', role: 'member', organizationId: MOCK_ORG.id },
];

const MOCK_TEAM: TeamMember[] = [
  { id: 'u1', name: 'Alice Admin', email: 'admin@demo.com', role: 'admin', status: 'active', organizationId: MOCK_ORG.id },
  { id: 'u2', name: 'Bob Staff', email: 'member@demo.com', role: 'member', status: 'active', organizationId: MOCK_ORG.id },
];

const MOCK_ORDERS: Order[] = [
  {
    restaurantSlug: MOCK_ORG.slug,
    tableNumber: "5",
    items: [
        { itemId: "m1", name: "Chicken Tikka Boti", price: 450, quantity: 2, spiceLevel: "medium" },
        { itemId: "m4", name: "Butter Naan", price: 80, quantity: 4 }
    ],
    total: 1220,
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
  },
  {
    restaurantSlug: MOCK_ORG.slug,
    tableNumber: "3",
    items: [
        { itemId: "m3", name: "Chicken Biryani", price: 600, quantity: 1 },
        { itemId: "m5", name: "Mango Lassi", price: 250, quantity: 1 }
    ],
    total: 850,
    status: "completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
  },
  {
    restaurantSlug: MOCK_ORG.slug,
    tableNumber: "8",
    items: [
        { itemId: "m2", name: "Seekh Kebab", price: 350, quantity: 2, spiceLevel: "hot" },
    ],
    total: 700,
    status: "confirmed",
    createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 mins ago
  }
];

interface AdminStore {
  currentUser: User | null;
  currentOrganization: Organization | null;
  teamMembers: TeamMember[];
  menuItems: MenuItem[];
  orders: Order[];
  
  login: (email: string) => boolean;
  logout: () => void;
  inviteMember: (name: string, email: string, role: Role) => void;
  removeMember: (id: string) => void;
  toggleMenuItemAvailability: (id: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id' | 'available'>) => void;
  updateOrderStatus: (index: number, status: Order['status']) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      currentOrganization: null,
      teamMembers: MOCK_TEAM,
      menuItems: MOCK_MENU_ITEMS,
      orders: MOCK_ORDERS,

      login: (email) => {
        const user = MOCK_USERS.find((u) => u.email === email);
        if (user) {
          set({ currentUser: user, currentOrganization: MOCK_ORG });
          return true;
        }
        return false;
      },

      logout: () => set({ currentUser: null, currentOrganization: null }),

      inviteMember: (name, email, role) => {
        const newMember: TeamMember = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          role,
          status: 'invited',
          organizationId: MOCK_ORG.id,
        };
        set((state) => ({ teamMembers: [...state.teamMembers, newMember] }));
      },

      removeMember: (id) =>
        set((state) => ({
          teamMembers: state.teamMembers.filter((m) => m.id !== id),
        })),

      toggleMenuItemAvailability: (id) =>
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id ? { ...item, available: !item.available } : item
          ),
        })),

      addMenuItem: (item) =>
        set((state) => ({
          menuItems: [...state.menuItems, { ...item, id: Math.random().toString(36).substr(2, 9), available: true }],
        })),

      updateOrderStatus: (index, status) => 
        set((state) => {
           const newOrders = [...state.orders];
           newOrders[index] = { ...newOrders[index], status };
           return { orders: newOrders };
        }),
    }),
    {
      name: 'restaurant-admin-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
