"use client";

import { useAdminStore } from "@/store/adminStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { Copy, ExternalLink, QrCode } from "lucide-react";

export default function SettingsPage() {
  const currentOrganization = useAdminStore((state) => state.currentOrganization);
  const currentUser = useAdminStore((state) => state.currentUser);
  const router = useRouter();

  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [origin, setOrigin] = useState("");

  // RBAC Check (Redundant if handled in Layout/Middleware, but good safety)
  useEffect(() => {
    if (currentUser?.role !== "admin") {
      router.push("/admin/dashboard/orders");
      toast.error("Unauthorized access");
    }
  }, [currentUser, router]);

  useEffect(() => {
    if (currentOrganization) {
        setOrgName(currentOrganization.name);
        setOrgSlug(currentOrganization.slug);
    }
    // Set origin for QR code link
    if (typeof window !== 'undefined') {
        setOrigin(window.location.origin);
    }
  }, [currentOrganization]);

  if (!currentUser || currentUser.role !== "admin") return null;

  const handleSave = () => {
    // In a real app, update the store/backend
    toast.success("Settings saved", {
        description: "Organization details updated successfully."
    });
  };

  const orderingUrl = `${origin}/${orgSlug}/order`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(orderingUrl);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="space-y-6 max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
            <p className="text-gray-500">Manage your restaurant details and configurations.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                    Update your restaurant's name and URL identifier.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="orgName">Restaurant Name</Label>
                    <Input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="orgSlug">URL Slug</Label>
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-500 text-sm">example.com/</span>
                        <Input id="orgSlug" value={orgSlug} onChange={(e) => setOrgSlug(e.target.value)} />
                    </div>
                    <p className="text-xs text-gray-500">Changing this will update your ordering link.</p>
                </div>
                <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">
                    Save Changes
                </Button>
            </CardContent>
        </Card>

        <Card className="border-red-100">
            <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                    Irreversible actions for your organization.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="destructive">
                    Delete Organization
                </Button>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
         <Card className="h-full">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-orange-600" />
                    <CardTitle>Share Your Menu</CardTitle>
                </div>
                <CardDescription>
                    Your customers can scan this code to view the menu and order.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
                <div className="p-4 bg-white border rounded-xl shadow-sm">
                    {orderingUrl && (
                        <QRCode 
                            value={orderingUrl} 
                            size={200} 
                            fgColor="#ea580c" // Orange 600
                        />
                    )}
                </div>
                
                <div className="w-full space-y-2">
                    <Label>Ordering Link</Label>
                    <div className="flex gap-2">
                        <Input value={orderingUrl} readOnly className="bg-gray-50 font-mono text-sm" />
                        <Button variant="outline" size="icon" onClick={copyToClipboard}>
                            <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => window.open(orderingUrl, '_blank')}>
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="text-center text-sm text-gray-500">
                    Print this QR code and place it on your tables.
                </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
