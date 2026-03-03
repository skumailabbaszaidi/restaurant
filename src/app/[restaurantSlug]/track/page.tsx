"use client";

import { use, useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { apiService } from "@/lib/api";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, ChefHat, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Order } from "@/lib/types";

interface PageProps {
  params: Promise<{ restaurantSlug: string }>;
}

export default function TrackOrdersPage({ params }: PageProps) {
  const { restaurantSlug } = use(params);
  const orderIds = useCartStore((state) => state.orderIds);
  const [orders, setOrders] = useState<Record<string, Order>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initTracking() {
      if (orderIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // 1. Resolve Org ID from slug
        const restaurant = await apiService.getRestaurant(restaurantSlug);
        const orgId = restaurant.id;

        if (!orgId) throw new Error("Organization ID not found");

        // 2. Subscribe to each order in the sub-collection
        const unsubscribes = orderIds.map((id) => {
          const orderRef = doc(db, "organizations", orgId, "orders", id);
          return onSnapshot(orderRef, (snapshot) => {
            if (snapshot.exists()) {
              setOrders((prev) => ({
                ...prev,
                [id]: {
                  id: snapshot.id,
                  ...snapshot.data(),
                  createdAt: snapshot.data().createdAt?.toDate ? snapshot.data().createdAt.toDate() : (snapshot.data().createdAt || new Date()),
                } as Order,
              }));
            }
          }, (err) => {
              console.error(`Error tracking order ${id}:`, err);
          });
        });

        return () => {
          unsubscribes.forEach((unsub) => unsub());
        };
      } catch (err) {
        console.error("Failed to initialize order tracking:", err);
      } finally {
        setLoading(false);
      }
    }

    const cleanupPromise = initTracking();
    return () => {
        cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, [orderIds, restaurantSlug]);

  const sortedOrders = Object.values(orders).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusStep = (status: Order["status"]) => {
    switch (status) {
      case "pending": return 1;
      case "confirmed": return 2;
      case "completed": return 3;
      default: return 1;
    }
  };

  const getStatusMeta = (status: Order["status"]) => {
    switch (status) {
      case "pending": return { label: "Order Received", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" };
      case "confirmed": return { label: "Preparing", icon: ChefHat, color: "text-blue-600", bg: "bg-blue-50" };
      case "completed": return { label: "Ready", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" };
      default: return { label: "Unknown", icon: Clock, color: "text-gray-600", bg: "bg-gray-50" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/${restaurantSlug}/order`}>
            <Button variant="ghost" size="sm" className="-ml-2 text-gray-500">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Menu
            </Button>
          </Link>
          <h1 className="font-bold text-lg">My Orders</h1>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {loading ? (
             <div className="py-20 text-center text-gray-400">Loading your orders...</div>
        ) : sortedOrders.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white rounded-xl border border-dashed">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <Clock className="h-8 w-8" />
            </div>
            <div>
                <p className="font-medium text-gray-900">No active orders</p>
                <p className="text-sm text-gray-500">Your recent orders will appear here</p>
            </div>
            <Link href={`/${restaurantSlug}/order`}>
                <Button className="bg-orange-600 hover:bg-orange-700">Order Something</Button>
            </Link>
          </div>
        ) : (
          sortedOrders.map((order) => {
            const meta = getStatusMeta(order.status);
            const step = getStatusStep(order.status);
            
            return (
              <Card key={order.id} className="overflow-hidden border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className={cn("pb-4", meta.bg)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <meta.icon className={cn("h-5 w-5", meta.color)} />
                        {meta.label}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Ordered at {new Date(order.createdAt).toLocaleTimeString()}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
                        Table {order.tableNumber}
                    </Badge>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4 flex items-center gap-1">
                      <div className={cn("h-1.5 flex-1 rounded-full", step >= 1 ? "bg-orange-500" : "bg-gray-200")} />
                      <div className={cn("h-1.5 flex-1 rounded-full", step >= 2 ? "bg-orange-500" : "bg-gray-200")} />
                      <div className={cn("h-1.5 flex-1 rounded-full", step >= 3 ? "bg-orange-500" : "bg-gray-200")} />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                        {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-600">{item.quantity}x {item.name}</span>
                                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="pt-3 border-t flex justify-between font-bold text-gray-900">
                        <span>Total Paid</span>
                        <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </main>
    </div>
  );
}
