import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Organization, TeamMember, Role } from '@/lib/adminTypes';
import { MenuItem, Order } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { apiService } from '@/lib/api';

// No mock data needed here anymore, as we fetch from backend.


interface AdminStore {
  currentUser: User | null;
  currentOrganization: Organization | null;
  teamMembers: TeamMember[];
  categories: any[]; // Replace with Category type
  menuItems: MenuItem[];
  orders: Order[];
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => () => void; // Returns unsubscribe
  inviteMember: (name: string, email: string, role: Role) => void;
  removeMember: (id: string) => void;
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  toggleMenuItemAvailability: (id: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id' | 'available'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  fetchOrders: () => Promise<void>;
  fetchMenu: () => Promise<void>;
  fetchTeam: () => Promise<void>;
  subscribeToOrders: () => () => void; // Returns unsubscribe
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      currentOrganization: null,
      teamMembers: [],
      categories: [],
      menuItems: [],
      orders: [],
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            
            // 1. Fetch User Profile from Firestore
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userSnapshot = await getDoc(userRef);
            
            if (!userSnapshot.exists()) {
                throw new Error("User profile not found in database.");
            }
            
            const userData = userSnapshot.data();
            const user: User = {
                id: firebaseUser.uid,
                name: userData.name || firebaseUser.displayName || email.split('@')[0],
                email: firebaseUser.email!,
                role: userData.role || 'member',
                organizationId: userData.organizationId
            };
            
            set({ currentUser: user });
            
            // 2. Fetch Organization details
            const orgData = await apiService.getOrganization();
            set({ currentOrganization: orgData });

            console.log("Login success. Org context:", orgData.id);
            set({ isLoading: false });

        } catch (error) {
            set({ isLoading: false });
            console.error("Login Error:", error);
            throw error;
        }
      },

      logout: async () => {
        await signOut(auth);
        set({ currentUser: null, currentOrganization: null });
      },

      checkAuth: () => {
         const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                    const existingUser = get().currentUser;
                    const existingOrg = get().currentOrganization;

                    // 1. Set basic info first IF we don't have a user yet
                    if (!existingUser) {
                        set({ currentUser: {
                            id: firebaseUser.uid,
                            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                            email: firebaseUser.email!,
                            role: 'member' as Role,
                            organizationId: '' 
                        }});
                    }

                    try {
                        // 2. Try to fetch full profile from Firestore
                        const userRef = doc(db, 'users', firebaseUser.uid);
                        const userSnapshot = await getDoc(userRef);
                        
                        if (userSnapshot.exists()) {
                            const userData = userSnapshot.data();
                            set((state) => ({ 
                                currentUser: {
                                    id: firebaseUser.uid,
                                    name: userData.name || state.currentUser?.name || 'User',
                                    email: firebaseUser.email!,
                                    role: userData.role as Role,
                                    organizationId: userData.organizationId 
                                }
                            }));
                        }
                    } catch (firestoreErr) {
                        console.warn("Firestore profile read failed:", firestoreErr);
                    }

                    try {
                        // 3. Fetch Org context from API
                        const orgData = await apiService.getOrganization();
                        // Only set if different to prevent re-renders
                        if (JSON.stringify(orgData) !== JSON.stringify(existingOrg)) {
                            set({ currentOrganization: orgData });
                        }
                    } catch (apiErr) {
                        console.error("API Org fetch error:", apiErr);
                    }
            } else {
                // Only clear if we actually had a user (meaning a real logout happened)
                if (get().currentUser) {
                    set({ currentUser: null, currentOrganization: null, teamMembers: [], categories: [], orders: [], menuItems: [] });
                }
            }
         });
         return unsubscribe;
      },

      subscribeToOrders: () => {
          const organizationId = get().currentOrganization?.id;
          
          if (!organizationId) {
              console.warn("Cannot subscribe to orders: Missing organization context");
              return () => {};
          }

          console.log(`Subscribing to realtime orders for org: ${organizationId}`);
          const ordersRef = collection(db, 'organizations', organizationId, 'orders');
          const q = query(ordersRef, orderBy('createdAt', 'desc'));
          
          const unsubscribe = onSnapshot(q, (snapshot) => {
              console.log(`Realtime update: Received ${snapshot.docs.length} orders`);
              const orders = snapshot.docs.map(doc => {
                  const data = doc.data();
                  return {
                      id: doc.id,
                      ...data,
                      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date())
                  } as Order;
              });
              
              set({ orders });
          }, (error) => {
              console.error("CRITICAL: Firestore subscription error:", error);
          });
          
          return unsubscribe;
      },

      // ... keep existing actions for now
      inviteMember: async (name, email, role) => {
          try {
              await apiService.inviteMember({ email, name, role });
              // Refresh team list
              const team = await apiService.getTeam();
              // Schema might differ, need to adapt if necessary
              set({ teamMembers: team }); 
          } catch(e) {
              console.error("Failed to invite member", e);
          }
      },

      removeMember: (id) =>
        set((state) => ({
          teamMembers: state.teamMembers.filter((m) => m.id !== id),
        })),

      fetchCategories: async () => {
          set({ isLoading: true });
          try {
              const categories = await apiService.getCategories();
              set({ categories, isLoading: false });
          } catch (e) {
              console.error("Failed to fetch categories", e);
              set({ isLoading: false });
          }
      },

      addCategory: async (name) => {
          try {
              await apiService.addCategory({ name });
              await get().fetchCategories();
          } catch (e) {
              console.error("Failed to add category", e);
          }
      },

      deleteCategory: async (id) => {
          try {
              await apiService.deleteCategory(id);
              await get().fetchCategories();
          } catch (e) {
              console.error("Failed to delete category", e);
          }
      },

      toggleMenuItemAvailability: async (id) => {
          const item = get().menuItems.find(i => i.id === id);
          if (!item) return;
          
          const newAvailability = !item.available;
          
          // Optimistic update
          set((state) => ({
            menuItems: state.menuItems.map((item) =>
              item.id === id ? { ...item, available: newAvailability } : item
            ),
          }));
          
          try {
              await apiService.updateMenuItem(id, { available: newAvailability });
          } catch (e) {
              console.error("Failed to update menu item availability", e);
              // Revert
               set((state) => ({
                menuItems: state.menuItems.map((item) =>
                  item.id === id ? { ...item, available: !newAvailability } : item
                ),
              }));
          }
      },

      addMenuItem: async (item) => {
         try {
             await apiService.addMenuItem(item);
             // We'd ideally fetch the menu again or add to state
             // Assuming we have a slug to fetch menu for...
             const state = get();
             if (state.currentOrganization?.slug) {
                // Determine if we need to fetch public or protected menu?
                // The protected endpoint to GET menu details wasn't explicitly listed 
                // separately from public GET /restaurants/:slug/menu.
                // We'll use the public one or just add to local state if backend returns the object.
             }
         } catch (e) {
             console.error("Failed to add menu item", e);
         }
      },

      updateOrderStatus: async (id, status) => {
        try {
            // Optimistic update
            set((state) => ({
              orders: state.orders.map((order) =>
                order.id === id ? { ...order, status } : order
              ),
            }));

            // Persistent update to backend
            await apiService.updateOrder(id, { status });
        } catch (e) {
            console.error("Failed to update order status", e);
        }
      },

      fetchOrders: async () => {
          set({ isLoading: true });
          try {
              const rawOrders = await apiService.getOrders();
              
              // Ensure consistent date objects across the app
              const orders = rawOrders.map((o: any) => ({
                  ...o,
                  createdAt: o.createdAt?.toDate ? o.createdAt.toDate() : 
                             (typeof o.createdAt === 'string' ? new Date(o.createdAt) : 
                             (o._seconds ? new Date(o._seconds * 1000) : (o.createdAt || new Date())))
              })) as Order[];

              set({ orders, isLoading: false });
          } catch (e) {
              console.error("Failed to fetch orders", e);
              set({ isLoading: false });
          }
      },

      fetchMenu: async () => {
          set({ isLoading: true });
          try {
              const data = await apiService.getItems();
              // Assuming data is an array of items for /admin/items
              set({ menuItems: data, isLoading: false });
          } catch (e) {
              console.error("Failed to fetch menu items", e);
              set({ isLoading: false });
          }
      },

      fetchTeam: async () => {
          set({ isLoading: true });
          try {
              const team = await apiService.getTeam();
              set({ teamMembers: team, isLoading: false });
          } catch (e) {
              console.error("Failed to fetch team", e);
              set({ isLoading: false });
          }
      },
    }),
    {
      name: 'restaurant-admin-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
          // Persist these fields
          currentUser: state.currentUser, 
          currentOrganization: state.currentOrganization,
          menuItems: state.menuItems, 
          orders: state.orders 
      }), 
    }
  )
);

