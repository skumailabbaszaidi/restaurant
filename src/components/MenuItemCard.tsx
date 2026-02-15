"use client";

import { useState } from "react";
import { MenuItem, CartItem, SpiceLevel, Modifier } from "@/lib/types";
import { useCartStore } from "@/store/cartStore";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSpice, setSelectedSpice] = useState<SpiceLevel | undefined>(item.spiceLevels?.[0]);
  const [selectedModifiers, setSelectedModifiers] = useState<Modifier[]>([]);
  const [notes, setNotes] = useState("");
  
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    addToCart({
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      spiceLevel: selectedSpice,
      modifiers: selectedModifiers,
      notes: notes.trim() || undefined,
    });
    setIsOpen(false);
    toast.success(`Added ${quantity} ${item.name} to cart`);
    // Reset state
    setQuantity(1);
    setSelectedSpice(item.spiceLevels?.[0]);
    setSelectedModifiers([]);
    setNotes("");
  };

  const totalPrice = (item.price + selectedModifiers.reduce((acc, mod) => acc + mod.price, 0)) * quantity;

  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow border-orange-100/50">
        <div className="relative h-48 w-full bg-gray-100">
           {/* Placeholder Image */}
           <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-orange-50">
             <ShoppingBag className="h-12 w-12 opacity-20" />
           </div>
           {/* If real image: <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" /> */}
        </div>
        
        <div className="flex-1 p-4 flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg leading-tight text-gray-900">{item.name}</h3>
                <span className="font-semibold text-orange-600">PKR {item.price}</span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
        </div>

        <CardFooter className="p-4 pt-0">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">Add to Order</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-[95%] rounded-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{item.name}</DialogTitle>
                        <DialogDescription>{item.description}</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        {/* Spice Level */}
                        {item.spiceLevels && item.spiceLevels.length > 0 && (
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Spice Level</Label>
                                <RadioGroup 
                                    value={selectedSpice} 
                                    onValueChange={(val: string) => setSelectedSpice(val as SpiceLevel)}
                                    className="flex flex-wrap gap-2"
                                >
                                    {item.spiceLevels.map((level) => (
                                        <div key={level} className="flex items-center space-x-2">
                                            <RadioGroupItem value={level} id={`spice-${item.id}-${level}`} className="peer sr-only" />
                                            <Label
                                                htmlFor={`spice-${item.id}-${level}`}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-full border border-gray-200 cursor-pointer hover:bg-orange-50 peer-data-[state=checked]:bg-orange-100 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:text-orange-700 capitalize",
                                                )}
                                            >
                                                {level}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        )}

                        {/* Modifiers (Mock example if we had them in data) */}
                        {/* 
                        <div className="space-y-3">
                             <Label className="text-base font-semibold">Add-ons</Label>
                             ...
                        </div>
                        */}

                        {/* Notes */}
                        <div className="space-y-3">
                            <Label htmlFor="notes" className="text-base font-semibold">Special Instructions</Label>
                            <Textarea 
                                id="notes" 
                                placeholder="E.g. No onions, extra sauce..." 
                                value={notes}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                                className="resize-none"
                            />
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center justify-between border-t border-b border-gray-100 py-4">
                            <span className="font-semibold text-base">Quantity</span>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="font-semibold w-6 text-center">{quantity}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleAddToCart} className="w-full bg-orange-600 hover:bg-orange-700 py-6 text-lg">
                            Add for PKR {totalPrice}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CardFooter>
      </Card>
    </>
  );
}
