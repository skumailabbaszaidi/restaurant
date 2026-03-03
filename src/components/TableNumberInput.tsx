"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface TableNumberInputProps {
  restaurantName: string;
  logoUrl?: string;
}

export function TableNumberInput({ restaurantName, logoUrl }: TableNumberInputProps) {
  const [tableInput, setTableInput] = useState("");
  const [error, setError] = useState("");
  const setTableNumber = useCartStore((state) => state.setTableNumber);
  const router = useRouter(); // Although we might just render conditionally in the page

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableInput.trim()) {
      setError("Please enter your table number");
      return;
    }
    setTableNumber(tableInput);
    // Logic to proceed. If this component is used on the main order page, 
    // the parent component might listen to the store or we might not need to route anywhere.
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50/50 p-4">
      <Card className="w-full max-w-md border-orange-100 shadow-xl">
        <CardHeader className="text-center space-y-4">
          {logoUrl && (
            <div className="mx-auto w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden mb-2">
               {/* Replace with actual Image component if we have real images */}
               <img src={logoUrl} alt={restaurantName} className="object-cover w-full h-full" />
            </div>
          )}
          <CardTitle className="text-3xl font-bold text-orange-950">{restaurantName}</CardTitle>
          <CardDescription className="text-lg text-orange-800/80">
            Welcome! Please enter your table number to start ordering.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter Table Number (e.g. 7)"
                value={tableInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setTableInput(val);
                  setError("");
                }}
                className="text-2xl py-8 text-center border-orange-200 focus-visible:ring-orange-500 font-bold"
              />
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </div>
            <Button 
                type="submit" 
                className="w-full py-6 text-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md transition-all active:scale-[0.98]"
            >
              Start Ordering <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
