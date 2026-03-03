"use client";

import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils"; // We'll need this helper
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { apiService } from "@/lib/api";

export function Cart() {
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems());
  const totalPrice = useCartStore((state) => state.totalPrice());
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const tableNumber = useCartStore((state) => state.tableNumber);
  const restaurantSlug = useCartStore((state) => state.restaurantSlug);

  const addOrderId = useCartStore((state) => state.addOrderId);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    setIsPlacingOrder(true);
    try {
        const orderData = {
          restaurantSlug,
          tableNumber,
          items,
          total: totalPrice,
          status: 'pending' as const,
          createdAt: new Date(),
        };

        const result = await apiService.createOrder(orderData);
        
        // Save order ID for tracking
        if (result.id) {
            addOrderId(result.id);
        }

        toast.success("Order placed successfully!", {
          description: "Kitchen has started preparing your food.",
        });
        
        clearCart();
        setIsOpen(false);
    } catch (error: any) {
        toast.error("Failed to place order", {
            description: error.message || "Please try again later."
        });
    } finally {
        setIsPlacingOrder(false);
    }
  };

  if (totalItems === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
        <div className="flex items-center justify-between">
           <div className="flex flex-col">
             <span className="font-bold text-lg">{totalItems} Items</span>
             <span className="text-sm text-gray-500">PKR {totalPrice}</span>
           </div>
           <Button onClick={() => setIsOpen(true)} className="bg-orange-600 hover:bg-orange-700">View Cart</Button>
        </div>
      </div>
      {/* Desktop Floating Button */}
        <div className="fixed bottom-8 right-8 z-50 hidden md:block">
            <Button 
                onClick={() => setIsOpen(true)} 
                className="h-16 w-16 rounded-full bg-orange-600 hover:bg-orange-700 shadow-xl flex flex-col items-center justify-center p-0"
            >
                <ShoppingCart className="h-6 w-6" />
                <span className="text-xs font-bold">{totalItems}</span>
            </Button>
        </div>


      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Your Order</SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="flex-1 -mx-6 px-6 my-4">
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
                    <p>Your cart is empty</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {items.map((item, index) => (
                        <div key={`${item.itemId}-${index}`} className="flex flex-col gap-2">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-base">{item.name}</h4>
                                    <p className="text-sm text-gray-500">PKR {item.price * item.quantity}</p>
                                    {item.spiceLevel && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full mr-2 capitalize">{item.spiceLevel}</span>}
                                    {item.notes && <p className="text-xs text-gray-500 italic mt-1">"{item.notes}"</p>}
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => removeFromCart(item.itemId, item.spiceLevel, item.modifiers)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-1 rounded-lg w-fit">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-md"
                                    onClick={() => updateQuantity(item.itemId, item.quantity - 1, item.spiceLevel, item.modifiers)}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-md"
                                    onClick={() => updateQuantity(item.itemId, item.quantity + 1, item.spiceLevel, item.modifiers)}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                            <Separator className="mt-2" />
                        </div>
                    ))}
                </div>
            )}
          </ScrollArea>

          <SheetFooter className="mt-auto border-t pt-4">
             <div className="w-full space-y-4">
                <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>PKR {totalPrice}</span>
                </div>
                <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700 py-6 text-lg"
                    onClick={handlePlaceOrder}
                    disabled={items.length === 0 || isPlacingOrder}
                >
                    {isPlacingOrder ? "Placing Order..." : "Place Order"}
                </Button>
             </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
