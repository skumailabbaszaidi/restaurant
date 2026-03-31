"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bell, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function WaiterRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const data = await apiService.getAdminWaiterRequests();
            setRequests(data);
        } catch (err) {
            console.error("Failed to fetch waiter requests", err);
            toast.error("Failed to load waiter requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        const interval = setInterval(fetchRequests, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const handleResolve = async (id: string) => {
        try {
            await apiService.updateAdminWaiterRequest(id, 'resolved');
            toast.success("Request resolved", {
                description: `Table ${requests.find(r => r.id === id)?.tableNumber} has been attended to.`,
            });
            fetchRequests();
        } catch (err) {
            console.error(err);
            toast.error("Failed to resolve request");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const resolvedRequests = requests.filter(r => r.status === 'resolved');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Waiter Requests</h1>
                <Button onClick={fetchRequests} variant="outline" size="sm">Refresh</Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Pending Requests */}
                <Card className="border-orange-100 shadow-sm">
                    <CardHeader className="bg-orange-50/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Bell className="h-5 w-5 text-orange-600" />
                            Pending Requests
                            <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-700 border-orange-200">
                                {pendingRequests.length}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {pendingRequests.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 italic">No pending requests</div>
                        ) : (
                            <div className="divide-y">
                                {pendingRequests.map((request) => (
                                    <div key={request.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-bold">Table {request.tableNumber}</span>
                                                <Badge className="bg-orange-500">Wait Needed</Badge>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(request.createdAt?._seconds ? request.createdAt._seconds * 1000 : request.createdAt), { addSuffix: true })}
                                            </div>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            className="bg-green-600 hover:bg-green-700 h-9"
                                            onClick={() => handleResolve(request.id)}
                                        >
                                            <CheckCircle2 className="mr-1 h-4 w-4" />
                                            Resolve
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recently Resolved */}
                <Card className="border-gray-100 shadow-sm opacity-80">
                    <CardHeader className="bg-gray-50">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-600">
                            <CheckCircle2 className="h-5 w-5" />
                            Recently Resolved
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {resolvedRequests.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 italic">No resolved requests</div>
                        ) : (
                            <div className="divide-y">
                                {resolvedRequests.slice(0, 5).map((request) => (
                                    <div key={request.id} className="p-4 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base font-semibold text-gray-600">Table {request.tableNumber}</span>
                                                <Badge variant="outline" className="text-gray-400 border-gray-200">Resolved</Badge>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {formatDistanceToNow(new Date(request.updatedAt?._seconds ? request.updatedAt._seconds * 1000 : request.updatedAt), { addSuffix: true })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
