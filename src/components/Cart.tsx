"use client";

import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils"; // We'll need this helper
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingCart, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { apiService } from "@/lib/api";
import Link from "next/link";

export function Cart() {
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems());
  const totalPrice = useCartStore((state) => state.totalPrice());
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const tableNumber = useCartStore((state) => state.tableNumber);
  const customerName = useCartStore((state) => state.customerName);
  const customerPhone = useCartStore((state) => state.customerPhone);
  const restaurantSlug = useCartStore((state) => state.restaurantSlug);

  const addOrderId = useCartStore((state) => state.addOrderId);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    setIsPlacingOrder(true);
    try {
        const orderData = {
          restaurantSlug,
          tableNumber,
          customerName,
          customerPhone,
          items,
          total: totalPrice,
          status: 'pending' as const,
          createdAt: new Date(),
        };

        const result = await apiService.createOrder(orderData);
        
        if (result.id) {
            addOrderId(result.id);
        }

        toast.success("Order received!", {
            description: `We're preparing your food. Order #${result.orderNumber}`,
            duration: 5000,
        });

        setPlacedOrder(result);
        clearCart();
    } catch (error: any) {
        toast.error("Failed to place order", {
            description: error.message || "Please try again later."
        });
    } finally {
        setIsPlacingOrder(false);
    }
  };

  if (totalItems === 0 && !placedOrder) return null;

  return (
    <>
      {!placedOrder && (
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

          <div className="fixed bottom-8 right-8 z-50 hidden md:block">
              <Button 
                  onClick={() => setIsOpen(true)} 
                  className="h-16 w-16 rounded-full bg-orange-600 hover:bg-orange-700 shadow-xl flex flex-col items-center justify-center p-0"
              >
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-xs font-bold">{totalItems}</span>
              </Button>
          </div>
        </>
      )}

      <Sheet open={isOpen || !!placedOrder} onOpenChange={(open) => {
          if (!open) {
              setIsOpen(false);
              setPlacedOrder(null);
          } else {
              setIsOpen(true);
          }
      }}>
        <SheetContent className="flex flex-col w-full sm:max-w-md p-0 overflow-hidden">
          {placedOrder ? (
              <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-white">
                  <div className="mb-6 bg-green-100 p-4 rounded-full text-green-600">
                      <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h2>
                  <p className="text-gray-500 mb-8 font-medium">Your food is being prepared. Save your order number below.</p>
                  
                  <div className="bg-orange-50 border-2 border-dashed border-orange-200 rounded-2xl p-8 w-full mb-8 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                          <ShoppingCart className="h-20 w-20 rotate-12" />
                      </div>
                      <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2 relative z-10">Your Order Number</p>
                      <h3 className="text-5xl font-black text-orange-700 tracking-tighter relative z-10">#{placedOrder.orderNumber}</h3>
                  </div>

                  <div className="w-full space-y-3">
                      <Link href={`/${restaurantSlug}/track`} className="block w-full" onClick={() => {
                          setIsOpen(false);
                          setPlacedOrder(null);
                      }}>
                          <Button className="w-full bg-orange-600 hover:bg-orange-700 h-14 text-lg rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-orange-200">
                              Track My Order <ArrowRight className="h-5 w-5" />
                          </Button>
                      </Link>
                      <Button 
                          variant="ghost" 
                          className="w-full h-12 rounded-xl text-gray-400 hover:text-gray-600"
                          onClick={() => {
                              setIsOpen(false);
                              setPlacedOrder(null);
                          }}
                      >
                          Back to Menu
                      </Button>
                  </div>
              </div>
          ) : (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 pt-4 pb-2 border-b">
                <SheetTitle className="text-xl font-bold">Your Order</SheetTitle>
              </SheetHeader>
              
              <ScrollArea className="flex-1 px-6 py-4">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                        <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
                        <p>Your cart is empty</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div 
                                key={`${item.itemId}-${index}`} 
                                className="rounded-xl border border-gray-100 bg-white shadow-sm p-4 flex flex-col gap-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 leading-tight">{item.name}</h4>
                                        <p className="text-sm font-semibold text-orange-600 mt-1">
                                          PKR {item.price * item.quantity}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          {item.spiceLevel && (
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-gray-500">
                                              {item.spiceLevel}
                                            </Badge>
                                          )}
                                        </div>
                                        {item.notes && (
                                          <p className="text-xs text-gray-500 italic mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                            "{item.notes}"
                                          </p>
                                        )}
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        onClick={() => removeFromCart(item.itemId, item.spiceLevel, item.modifiers)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Quantity
                                  </span>
                                  <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 rounded-lg bg-white shadow-sm hover:bg-white"
                                          onClick={() => updateQuantity(item.itemId, item.quantity - 1, item.spiceLevel, item.modifiers)}
                                      >
                                          <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 rounded-lg bg-white shadow-sm hover:bg-white"
                                          onClick={() => updateQuantity(item.itemId, item.quantity + 1, item.spiceLevel, item.modifiers)}
                                      >
                                          <Plus className="h-3 w-3" />
                                      </Button>
                                  </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
              </ScrollArea>

              <SheetFooter className="mt-auto border-t px-6 pb-8 pt-6 bg-white shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Total Amount</span>
                      <span className="text-2xl font-black text-gray-900">PKR {totalPrice}</span>
                  </div>
                  <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700 h-14 text-lg rounded-2xl font-bold shadow-lg shadow-orange-100 transition-all active:scale-[0.98]"
                      onClick={handlePlaceOrder}
                      disabled={items.length === 0 || isPlacingOrder}
                  >
                      {isPlacingOrder ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Placing Order...
                          </>
                      ) : "Place Order"}
                  </Button>
                </div>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
