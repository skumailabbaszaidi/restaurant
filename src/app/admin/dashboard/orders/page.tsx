"use client";

import { useAdminStore } from "@/store/adminStore";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, ChefHat, TrendingUp, ShoppingCart, History, LayoutDashboard, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useMemo, useState } from "react";

export default function OrdersPage() {
  const orders = useAdminStore((state) => state.orders);
  const updateOrderStatus = useAdminStore((state) => state.updateOrderStatus);
  const subscribeToOrders = useAdminStore((state) => state.subscribeToOrders);
  const currentOrganization = useAdminStore((state) => state.currentOrganization);
  const currentUser = useAdminStore((state) => state.currentUser);
  const fetchOrders = useAdminStore((state) => state.fetchOrders);

  useEffect(() => {
    if (!currentOrganization?.id) return;
    
    console.log("OrdersPage: Initiating order subscription for", currentOrganization.id);
    const unsubscribe = subscribeToOrders();
    
    return () => {
        console.log("OrdersPage: Cleaning up order subscription");
        unsubscribe();
    };
  }, [subscribeToOrders, currentOrganization?.id]);

  // One-time fetch fallback if list is empty
  useEffect(() => {
    if (currentOrganization?.id && orders.length === 0) {
      fetchOrders();
    }
  }, [currentOrganization?.id, orders.length, fetchOrders]);

  // Stats Logic
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders30d = orders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
    const ordersToday = orders.filter(o => new Date(o.createdAt) >= today);
    
    const earnings30d = orders30d.reduce((acc, curr) => acc + curr.total, 0);
    const earningsToday = ordersToday.filter(o => o.status === 'completed').reduce((acc, curr) => acc + curr.total, 0);

    return {
      total30d: orders30d.length,
      earnings30d: earnings30d,
      totalToday: ordersToday.length,
      completedToday: ordersToday.filter(o => o.status === 'completed').length,
      earningsToday: earningsToday
    };
  }, [orders]);

  // Filter Logic
  const activeOrders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      // Active = Not completed OR (Completed AND from today)
      // Actually, user wants Active to be "current today's work"
      // and History to be "past 3 days".
      // Let's keep Active as NON-COMPLETED from today.
      return o.status !== 'completed' && orderDate >= today;
    }).sort((a, b) => {
      const statusOrder = { pending: 0, confirmed: 1, completed: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [orders]);

  const recentActivity = useMemo(() => {
    // Show all active + last 5 completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCompleted = orders.filter(o => o.status === 'completed' && new Date(o.createdAt) >= today)
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .slice(0, 5);
                                
    return [...activeOrders, ...todayCompleted];
  }, [orders, activeOrders]);

  const historyOrders = useMemo(() => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    return orders.filter(o => o.status === 'completed' && new Date(o.createdAt) >= threeDaysAgo)
                 .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200";
      case "confirmed": return "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const OrderCard = ({ order }: { order: any }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdateStatus = async (status: string) => {
        if (!order.id) return;
        setIsUpdating(true);
        try {
            await updateOrderStatus(order.id, status as any);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
    <Card key={order.id} className={cn("border-t-4 shadow-sm hover:shadow-md transition-shadow", 
       order.status === 'pending' ? 'border-t-yellow-400' : 
       order.status === 'confirmed' ? 'border-t-blue-400' : 'border-t-green-400'
    )}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
             <div className="flex items-center gap-2">
                <CardTitle className="text-xl">Table {order.tableNumber}</CardTitle>
                <span className="text-xs font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                    #{order.orderNumber}
                </span>
             </div>
             <CardDescription className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-gray-400" />
                {new Date(order.createdAt).toLocaleDateString(undefined, { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
             </CardDescription>
          </div>
          <Badge className={cn("border shrink-0", getStatusColor(order.status))}>{order.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
              {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex flex-col text-sm pb-1 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex justify-between">
                          <span className="font-medium text-gray-700">
                              {item.quantity}x {item.name}
                              {item.spiceLevel && <span className="text-xs text-red-500 ml-1">({item.spiceLevel})</span>}
                          </span>
                          <span className="text-gray-500">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                      {item.notes && (
                        <p className="text-[10px] text-gray-400 italic mt-0.5">Note: {item.notes}</p>
                      )}
                  </div>
              ))}
              {order.notes && (
                  <div className="bg-blue-50 p-2 rounded text-xs text-blue-800 mt-2 border border-blue-100 flex gap-2">
                      <span className="font-bold shrink-0">Order Note:</span> 
                      <span>{order.notes}</span>
                  </div>
              )}
          </div>
          
          <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
          </div>

          <div className="pt-2 flex gap-2">
              {order.status === 'pending' && (
                  <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white" 
                      onClick={() => handleUpdateStatus('confirmed')}
                      disabled={isUpdating}
                  >
                      {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChefHat className="mr-2 h-4 w-4" />}
                      Start Preparing
                  </Button>
              )}
              {order.status === 'confirmed' && (
                  <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white" 
                      onClick={() => handleUpdateStatus('completed')}
                      disabled={isUpdating}
                  >
                      {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="mr-2 h-4 w-4" />}
                      Mark Completed
                  </Button>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Debug Section (Hidden by default or barely visible) */}
      <div className="bg-gray-50 p-2 rounded text-[10px] text-gray-400 flex gap-4 border border-dashed">
         <span>Org ID: {currentOrganization?.id || "None"}</span>
         <span>User: {currentUser?.email || "None"} (Org: {currentUser?.organizationId || "None"})</span>
         <span>Orders: {orders.length}</span>
         <button 
           className="ml-auto underline hover:text-red-500"
           onClick={() => {
              localStorage.removeItem('restaurant-admin-storage');
              window.location.reload();
           }}
         >
           Reset Store
         </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Orders</h1>
          <p className="text-gray-500">Manage and track your restaurant orders in realtime.</p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="px-3 py-1 border-yellow-200 text-yellow-700 bg-yellow-50">
             <Clock className="w-3 h-3 mr-1" /> Pending: {orders.filter(o => o.status === 'pending').length}
           </Badge>
           <Badge variant="outline" className="px-3 py-1 border-blue-200 text-blue-700 bg-blue-50">
             <ChefHat className="w-3 h-3 mr-1" /> In Progress: {orders.filter(o => o.status === 'confirmed').length}
           </Badge>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-2" /> Summary</TabsTrigger>
          <TabsTrigger value="active"><Clock className="w-4 h-4 mr-2" /> Active Orders</TabsTrigger>
          <TabsTrigger value="history"><History className="w-4 h-4 mr-2" /> History (3d)</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-white to-gray-50 border-orange-100">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.earningsToday)}</div>
                <p className="text-xs text-muted-foreground">Today's completed orders</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalToday}</div>
                <p className="text-xs text-muted-foreground">{stats.completedToday} completed today</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">30D Orders</CardTitle>
                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total30d}</div>
                <p className="text-xs text-muted-foreground">Total volume past 30 days</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">30D Revenue</CardTitle>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.earnings30d)}</div>
                <p className="text-xs text-muted-foreground">Total earnings past 30 days</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity (Today)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {recentActivity.map(order => <OrderCard key={order.id} order={order} />)}
               {recentActivity.length === 0 && <p className="text-gray-500 italic">No activity today yet.</p>}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
           {activeOrders.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {activeOrders.map(order => <OrderCard key={order.id} order={order} />)}
             </div>
           ) : (
             <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed text-gray-500">
               <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <p className="text-lg font-medium">All caught up!</p>
               <p>No pending or active orders at the moment.</p>
             </div>
           )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
           {historyOrders.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {historyOrders.map(order => <OrderCard key={order.id} order={order} />)}
             </div>
           ) : (
             <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed text-gray-500">
               <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <p className="text-lg font-medium">No recent history</p>
               <p>Completed orders from the past 3 days will appear here.</p>
             </div>
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
