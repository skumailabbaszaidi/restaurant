"use client";

import { useEffect, use } from "react";
import { notFound } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { MOCK_RESTAURANT, MOCK_CATEGORIES, MOCK_MENU_ITEMS } from "@/lib/mockData";
import { TableNumberInput } from "@/components/TableNumberInput";
import { MenuCategory } from "@/components/MenuCategory";
import { Cart } from "@/components/Cart";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface PageProps {
  params: Promise<{ restaurantSlug: string }>;
}

export default function OrderPage({ params }: PageProps) {
  // Unwrap params using React.use()
  const { restaurantSlug } = use(params);
  
  const tableNumber = useCartStore((state) => state.tableNumber);
  const setRestaurantSlug = useCartStore((state) => state.setRestaurantSlug);
  const currentSlug = useCartStore((state) => state.restaurantSlug);
  const clearCart = useCartStore((state) => state.clearCart);

  // In a real app, we would fetch restaurant data based on slug here.
  // For now, we check if the slug matches our mock data.
  const restaurant = MOCK_RESTAURANT.slug === restaurantSlug ? MOCK_RESTAURANT : null;

  useEffect(() => {
    if (restaurant) {
      // If switching restaurants, clear the cart
      if (currentSlug && currentSlug !== restaurant.slug) {
        clearCart();
      }
      setRestaurantSlug(restaurant.slug);
    }
  }, [restaurant, currentSlug, setRestaurantSlug, clearCart]);

  if (!restaurant) {
    return notFound();
  }

  // If no table number, show the welcome/input screen
  if (!tableNumber) {
    return <TableNumberInput restaurantName={restaurant.name} logoUrl={restaurant.logoUrl} />;
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-700">
                    {restaurant.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-tight">{restaurant.name}</h1>
                    <p className="text-xs text-gray-500 font-medium">Table {tableNumber}</p>
                </div>
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-red-500"
                onClick={() => {
                    if (confirm("Are you sure you want to exit? Your cart will be cleared.")) {
                        clearCart();
                    }
                }}
            >
                <LogOut className="h-5 w-5" />
            </Button>
        </div>
      </header>
      
      {/* Hero / Banner (Optional) */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white mb-6">
            <div className="text-center p-4">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">Authentic Flavors</h2>
                <p className="text-orange-100 text-lg md:text-xl font-light">Experience the best BBQ in town</p>
            </div>
        </div>

      {/* Menu Categories & Items */}
      <main>
        <MenuCategory categories={MOCK_CATEGORIES} items={MOCK_MENU_ITEMS} />
      </main>

      {/* Cart Floating Action | Modal */}
      <Cart />
    </div>
  );
}
