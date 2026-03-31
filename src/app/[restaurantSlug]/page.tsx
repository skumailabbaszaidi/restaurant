"use client";

import { use, useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, Search, ArrowRight, Loader2, MapPin, Clock, Star, HandPlatter } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { TableNumberInput } from "@/components/TableNumberInput";

interface PageProps {
  params: Promise<{ restaurantSlug: string }>;
}

export default function RestaurantLandingPage({ params }: PageProps) {
  const { restaurantSlug } = use(params);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const data = await apiService.getRestaurant(restaurantSlug);
        setRestaurant(data);
      } catch (err) {
        console.error("Failed to fetch restaurant", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();
  }, [restaurantSlug]);

  const tableNumber = useCartStore((state) => state.tableNumber);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading restaurant...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full">
           <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-4" />
           <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h1>
           <p className="text-gray-500 mb-6">The restaurant slug you're looking for doesn't exist.</p>
           <Link href="/">
              <Button className="w-full bg-orange-600 hover:bg-orange-700">Go to Homepage</Button>
           </Link>
        </div>
      </div>
    );
  }

  if (!tableNumber) {
    return <TableNumberInput restaurantName={restaurant.name} logoUrl={restaurant.logoUrl} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"})` }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        </div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <Badge className="mb-4 bg-orange-500 hover:bg-orange-600 border-none px-3 py-1 text-sm">
            {restaurant.cuisine || "Restaurant"}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
            {restaurant.name}
          </h1>
          <div className="flex items-center gap-4 text-white/90 text-sm font-medium">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> 4.8 (500+)
            </span>
            <span className="w-1 h-1 bg-white/40 rounded-full" />
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> 20-30 min
            </span>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-10 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <Link href={`/${restaurantSlug}/order`} className="group">
            <Card className="h-full border-none shadow-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl overflow-hidden cursor-pointer bg-gradient-to-br from-orange-500 to-orange-600">
              <CardContent className="p-8 flex flex-col h-full justify-between min-h-[220px]">
                <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  <Utensils className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center group-hover:gap-3 transition-all">
                    Order Now <ArrowRight className="h-6 w-6 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                  </h2>
                  <p className="text-orange-50 font-medium">Browse our delicious menu and place your order instantly from your table.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/${restaurantSlug}/track`} className="group">
            <Card className="h-full border-none shadow-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl overflow-hidden cursor-pointer bg-white">
              <CardContent className="p-8 flex flex-col h-full justify-between min-h-[220px]">
                <div className="bg-gray-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-100 transition-colors">
                  <Search className="h-8 w-8 text-gray-600 group-hover:text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center group-hover:gap-3 transition-all">
                    Track Order <ArrowRight className="h-6 w-6 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all text-orange-600" />
                  </h2>
                  <p className="text-gray-500 font-medium">Already ordered? Check your order status and estimated arrival time.</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <div 
            className="group cursor-pointer"
            onClick={async () => {
                try {
                    await apiService.requestWaiter({ restaurantSlug, tableNumber });
                    toast.success("Waiter requested!", {
                        description: "A staff member is on their way to your table.",
                        duration: 5000,
                    });
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to request waiter");
                }
            }}
          >
            <Card className="h-full border-none shadow-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl overflow-hidden bg-white">
              <CardContent className="p-8 flex flex-col h-full justify-between min-h-[220px]">
                <div className="bg-gray-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                   <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                   >
                     <HandPlatter className="h-8 w-8 text-gray-600 group-hover:text-blue-600" />
                   </motion.div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center group-hover:gap-3 transition-all text-blue-600">
                    Waiter Request <ArrowRight className="h-6 w-6 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                  </h2>
                  <p className="text-gray-500 font-medium">Need assistance? Request a waiter to your table with a single click.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4 items-start">
                <div className="bg-gray-100 p-3 rounded-xl text-gray-600">
                    <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-bold text-gray-900">Location</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{restaurant.address || "123 Main St, New York, NY"}</p>
                </div>
            </div>
            <div className="flex gap-4 items-start">
                <div className="bg-gray-100 p-3 rounded-xl text-gray-600">
                    <Clock className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-bold text-gray-900">Opening Hours</h3>
                    <p className="text-sm text-gray-500">11:00 AM - 10:00 PM</p>
                </div>
            </div>
            <div className="flex gap-4 items-start">
                <div className="bg-gray-100 p-3 rounded-xl text-gray-600">
                    <Star className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-bold text-gray-900">Excellent Service</h3>
                    <p className="text-sm text-gray-500">Highly rated by customers for speed and accuracy.</p>
                </div>
            </div>
        </div>
      </div>
      
      {/* Visual Footer Decor */}
      <div className="h-1 bg-gradient-to-r from-orange-100 via-orange-500 to-orange-100 opacity-20" />
    </div>
  );
}
