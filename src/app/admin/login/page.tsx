"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Mock password
  const login = useAdminStore((state) => state.login);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock auth
    if (login(email)) {
      toast.success("Welcome back!");
      router.push("/admin/dashboard/orders");
    } else {
      toast.error("Invalid credentials", {
        description: "Try admin@demo.com or member@demo.com",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
             <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <Lock className="h-6 w-6" />
             </div>
          </div>
          <CardTitle className="text-2xl text-center font-bold">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your email to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@demo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Any password works"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
              Sign In
            </Button>
            <div className="text-xs text-center text-gray-400 mt-4">
               <p>Demo Credentials:</p>
               <p>Admin: admin@demo.com</p>
               <p>Member: member@demo.com</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
