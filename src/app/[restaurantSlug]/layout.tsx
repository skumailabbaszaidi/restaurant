import { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Food | Restaurant SaaS",
  description: "View menu and order food directly from your table.",
};

export default function RestaurantLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      {children}
    </div>
  );
}
