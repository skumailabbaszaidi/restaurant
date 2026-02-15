"use client";

import { useAdminStore } from "@/store/adminStore";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, ChefHat } from "lucide-react";

import { useEffect } from "react";

export default function OrdersPage() {
  const orders = useAdminStore((state) => state.orders);
  const updateOrderStatus = useAdminStore((state) => state.updateOrderStatus);
  const fetchOrders = useAdminStore((state) => state.fetchOrders);
  const currentOrganization = useAdminStore((state) => state.currentOrganization);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);


  // Simple sorting: Pending first, then confirmed, then completed
  const sortedOrders = [...orders].sort((a, b) => {
    const statusOrder = { pending: 0, confirmed: 1, completed: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "confirmed": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "completed": return "bg-green-100 text-green-800 hover:bg-green-100";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Active Orders</h1>
        <div className="flex gap-2">
           <Badge variant="outline" className="px-3 py-1">Pending: {orders.filter(o => o.status === 'pending').length}</Badge>
           <Badge variant="outline" className="px-3 py-1">In Progress: {orders.filter(o => o.status === 'confirmed').length}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedOrders.map((order, index) => (
          <Card key={`${order.tableNumber}-${index}`} className={cn("border-t-4", 
             order.status === 'pending' ? 'border-t-yellow-400' : 
             order.status === 'confirmed' ? 'border-t-blue-400' : 'border-t-green-400'
          )}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                   <CardTitle className="text-xl">Table {order.tableNumber}</CardTitle>
                   <CardDescription>{new Date(order.createdAt).toLocaleTimeString()}</CardDescription>
                </div>
                <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                    {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">
                                {item.quantity}x {item.name}
                                {item.spiceLevel && <span className="text-xs text-gray-500 ml-1">({item.spiceLevel})</span>}
                            </span>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    ))}
                    {order.notes && (
                        <div className="bg-orange-50 p-2 rounded text-xs text-orange-800 mt-2">
                            <span className="font-bold">Note:</span> {order.notes}
                        </div>
                    )}
                </div>
                
                <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                </div>

                <div className="pt-2 flex gap-2">
                    {order.status === 'pending' && (
                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                            onClick={() => updateOrderStatus(index, 'confirmed')} // Should use ID in real app
                        >
                            <ChefHat className="mr-2 h-4 w-4" /> Start Preparing
                        </Button>
                    )}
                    {order.status === 'confirmed' && (
                        <Button 
                            className="w-full bg-green-600 hover:bg-green-700 text-white" 
                            onClick={() => updateOrderStatus(index, 'completed')}
                        >
                            <Check className="mr-2 h-4 w-4" /> Mark Completed
                        </Button>
                    )}
                     {order.status === 'completed' && (
                        <Button variant="outline" className="w-full" disabled>
                            Completed
                        </Button>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
