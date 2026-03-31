"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  MessageSquare,
  HandPlatter
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = useAdminStore((state) => state.currentUser);
  const logout = useAdminStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const checkAuth = useAdminStore((state) => state.checkAuth);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = checkAuth();
    
    // We wait a bit for Firebase to tell us if we are logged in or not
    const timeout = setTimeout(() => {
      setIsInitializing(false);
    }, 1500); // 1.5s grace period for Firebase auth to stabilize

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [checkAuth]);

  useEffect(() => {
    if (!isInitializing && !currentUser) {
      router.push("/admin/login");
    }
  }, [currentUser, router, isInitializing]);

  if (isInitializing || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        <div className="text-center">
            <div className="h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Verifying session...</p>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === "admin";

  const navigation = [
    { name: "Orders", href: "/admin/dashboard/orders", icon: LayoutDashboard },
    { name: "Menu", href: "/admin/dashboard/menu", icon: UtensilsCrossed },
    { name: "Feedback", href: "/admin/dashboard/feedback", icon: MessageSquare },
    { name: "Waiter Requests", href: "/admin/dashboard/waiter-requests", icon: HandPlatter },
    // Only show Team and Settings to Admin
    ...(isAdmin ? [
      { name: "Team", href: "/admin/dashboard/team", icon: Users },
      { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
    ] : []),
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight">Restaurant OS</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{currentUser.role}</p>
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1">
        {navigation.map((item) => {
           const isActive = pathname.startsWith(item.href);
           return (
            <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive 
                    ? "bg-orange-600 text-white" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
            >
                <item.icon className="h-5 w-5" />
                {item.name}
            </Link>
           );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
            </div>
        </div>
        <Button 
            variant="destructive" 
            className="w-full justify-start" 
            onClick={() => {
                logout();
                router.push("/admin/login");
            }}
        >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <div className="h-full fixed w-64">
           <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 p-4 flex items-center justify-between text-white">
         <span className="font-bold">Restaurant OS</span>
         <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-r-slate-800 bg-slate-900">
                <SidebarContent />
            </SheetContent>
         </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-0 pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            {children}
        </div>
      </main>
    </div>
  );
}
