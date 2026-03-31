"use client";

import { use, useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { apiService } from "@/lib/api";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  Search, 
  Star, 
  Send,
  Loader2 
} from "lucide-react";
import Link from "next/link";
import { Order } from "@/lib/types";

interface PageProps {
  params: Promise<{ restaurantSlug: string }>;
}

export default function TrackOrdersPage({ params }: PageProps) {
  const { restaurantSlug } = use(params);
  const orderIds = useCartStore((state) => state.orderIds);
  const addOrderId = useCartStore((state) => state.addOrderId);
  
  const [orders, setOrders] = useState<Record<string, Order>>({});
  const [loading, setLoading] = useState(true);
  const [searchNumber, setSearchNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Feedback states
  const [submittingFeedback, setSubmittingFeedback] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<Record<string, { rating: number, text: string }>>({});

  useEffect(() => {
    async function initTracking() {
      if (orderIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const restaurant = await apiService.getRestaurant(restaurantSlug);
        const orgId = restaurant.id;

        if (!orgId) throw new Error("Organization ID not found");

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

  const handleSearchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNumber.trim()) return;

    setIsSearching(true);
    try {
      const order = await apiService.getOrderByNumber(searchNumber, restaurantSlug);
      if (order && order.id) {
        addOrderId(order.id);
        toast.success("Order found and added to your list");
        setSearchNumber("");
      }
    } catch (err: any) {
      toast.error(err.response?.status === 404 ? "Order not found" : "Failed to find order");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmitFeedback = async (orderId: string) => {
    const data = feedbackData[orderId];
    if (!data || !data.rating) {
        toast.error("Please select a rating");
        return;
    }

    setSubmittingFeedback(orderId);
    try {
        await apiService.submitFeedback(orderId, {
            rating: data.rating,
            feedback: data.text,
            restaurantSlug
        });
        toast.success("Feedback received!", {
            description: "We value your input. Thank you for helping us improve!",
            duration: 5000,
        });
        // Local update
        setOrders(prev => ({
            ...prev,
            [orderId]: { ...prev[orderId], rating: data.rating, feedback: data.text }
        }));
    } catch (err) {
        toast.error("Failed to submit feedback");
    } finally {
        setSubmittingFeedback(null);
    }
  };

  const updateFeedbackData = (orderId: string, rating?: number, text?: string) => {
    setFeedbackData(prev => ({
        ...prev,
        [orderId]: {
            rating: rating !== undefined ? rating : (prev[orderId]?.rating || 0),
            text: text !== undefined ? text : (prev[orderId]?.text || "")
        }
    }));
  };

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
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/${restaurantSlug}/order`}>
            <Button variant="ghost" size="sm" className="-ml-2 text-gray-500 hover:text-orange-600">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Menu
            </Button>
          </Link>
          <h1 className="font-bold text-lg">Track Order</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Search Bar */}
        <Card className="shadow-sm border-none ring-1 ring-gray-200">
            <CardContent className="pt-6">
                <form onSubmit={handleSearchOrder} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="Enter 6-digit order number" 
                            className="pl-9 h-11"
                            value={searchNumber}
                            onChange={(e) => setSearchNumber(e.target.value.toUpperCase())}
                            maxLength={6}
                        />
                    </div>
                    <Button 
                        type="submit" 
                        disabled={isSearching || searchNumber.length < 6}
                        className="h-11 bg-orange-600 hover:bg-orange-700"
                    >
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track"}
                    </Button>
                </form>
            </CardContent>
        </Card>

        {loading ? (
             <div className="py-20 text-center flex flex-col items-center gap-3">
                 <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                 <p className="text-gray-500">Loading your orders...</p>
             </div>
        ) : sortedOrders.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <Clock className="h-8 w-8" />
            </div>
            <div>
                <p className="font-medium text-gray-900">No active orders</p>
                <p className="text-sm text-gray-500">Enter an order number above or place a new order</p>
            </div>
            <Link href={`/${restaurantSlug}/order`}>
                <Button className="bg-orange-600 hover:bg-orange-700">Order Something</Button>
            </Link>
          </div>
        ) : (
          sortedOrders.map((order) => {
            const meta = getStatusMeta(order.status);
            const step = getStatusStep(order.status);
            const canFeedback = order.status === "completed" && !order.rating;
            
            return (
              <Card key={order.id} className="overflow-hidden border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className={cn("pb-4", meta.bg)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                         <Badge variant="secondary" className="bg-white/80 font-mono text-sm tracking-wider">
                           #{order.orderNumber || "..."}
                         </Badge>
                      </div>
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
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                        {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">{item.quantity}x {item.name}</span>
                                <span className="text-gray-400">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="pt-3 border-t flex justify-between font-bold text-gray-900">
                        <span>Total amount</span>
                        <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </CardContent>

                {canFeedback && (
                    <CardFooter className="flex flex-col items-stretch gap-4 border-t bg-gray-50/50 pt-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">How was your meal?</Label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => updateFeedbackData(order.id!, star)}
                                            className="focus:outline-none transition-transform active:scale-95"
                                        >
                                            <Star 
                                                className={cn(
                                                    "h-7 w-7",
                                                    (feedbackData[order.id!]?.rating || 0) >= star
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Any comments?</Label>
                                <Textarea 
                                    placeholder="Tell us what you liked or how we can improve..."
                                    className="bg-white resize-none"
                                    rows={2}
                                    value={feedbackData[order.id!]?.text || ""}
                                    onChange={(e) => updateFeedbackData(order.id!, undefined, e.target.value)}
                                />
                            </div>

                            <Button 
                                className="w-full bg-slate-900 hover:bg-slate-800"
                                disabled={submittingFeedback === order.id}
                                onClick={() => handleSubmitFeedback(order.id!)}
                            >
                                {submittingFeedback === order.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                Submit Feedback
                            </Button>
                        </div>
                    </CardFooter>
                )}

                {order.rating && (
                    <CardFooter className="border-t bg-green-50/30 pt-4 flex flex-col items-start gap-1">
                        <div className="flex items-center gap-1 text-xs font-semibold text-green-700 mb-1">
                            <CheckCircle2 className="h-3 w-3" /> Feedback Submitted
                        </div>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star}
                                    className={cn(
                                        "h-3 w-3",
                                        order.rating! >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                                    )}
                                />
                            ))}
                        </div>
                        {order.feedback && (
                            <p className="text-xs text-gray-500 italic mt-1 font-medium">"{order.feedback}"</p>
                        )}
                    </CardFooter>
                )}
              </Card>
            );
          })
        )}
      </main>
    </div>
  );
}
