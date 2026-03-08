"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Clock, Utensils, Loader2 } from "lucide-react";

export default function FeedbackPage() {
    const [feedback, setFeedback] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFeedback() {
            try {
                const data = await apiService.getAllFeedback();
                setFeedback(data);
            } catch (err) {
                console.error("Failed to fetch feedback", err);
            } finally {
                setLoading(false);
            }
        }
        fetchFeedback();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-2" />
                <p className="text-gray-500">Loading reviews...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Customer Feedback</h1>
                <p className="text-gray-500">View what your customers are saying about your food and service.</p>
            </div>

            {feedback.length === 0 ? (
                <Card className="border-dashed py-12">
                    <CardContent className="flex flex-col items-center justify-center text-center text-gray-500">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                        <p className="font-medium">No feedback yet</p>
                        <p className="text-sm">Customer reviews will appear here once they complete their orders.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {feedback.map((item) => (
                        <Card key={item.id} className="overflow-hidden shadow-sm">
                            <CardHeader className="pb-3 border-b bg-gray-50/50">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <Badge variant="outline" className="font-mono text-xs">
                                            #{item.orderNumber}
                                        </Badge>
                                        <div className="flex gap-0.5 mt-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star 
                                                    key={star}
                                                    className={`h-4 w-4 ${item.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center text-xs text-gray-400 gap-1">
                                            <Clock className="h-3 w-3" />
                                            {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {item.feedback && (
                                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-inner">
                                        <p className="text-sm text-gray-700 italic">"{item.feedback}"</p>
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <Utensils className="h-3 w-3" /> Ordered Items
                                    </div>
                                    <div className="space-y-1">
                                        {item.items?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-600 truncate mr-2">{item.quantity}x {item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
