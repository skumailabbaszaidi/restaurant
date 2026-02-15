"use client";

import { useState } from "react";
import { useAdminStore } from "@/store/adminStore";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Image as ImageIcon, Plus } from "lucide-react";
import { MOCK_CATEGORIES } from "@/lib/mockData";
import { toast } from "sonner";

export default function MenuPage() {
  const menuItems = useAdminStore((state) => state.menuItems);
  const toggleMenuItemAvailability = useAdminStore((state) => state.toggleMenuItemAvailability);
  const addMenuItem = useAdminStore((state) => state.addMenuItem);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "/images/food-placeholder.png",
  });

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price || !newItem.categoryId) {
        toast.error("Please fill in all required fields");
        return;
    }

    addMenuItem({
        name: newItem.name,
        description: newItem.description,
        price: Number(newItem.price),
        categoryId: newItem.categoryId,
        imageUrl: newItem.imageUrl,
    });

    toast.success("Item added successfully");
    setIsAddOpen(false);
    setNewItem({ name: "", description: "", price: "", categoryId: "", imageUrl: "/images/food-placeholder.png" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="mr-2 h-4 w-4" /> Add New Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Menu Item</DialogTitle>
                    <DialogDescription>
                        Create a new delicious item for your menu.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Item Name</Label>
                        <Input 
                            id="name" 
                            value={newItem.name} 
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} 
                            placeholder="e.g., Spicy Beef Burger"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select 
                            value={newItem.categoryId} 
                            onValueChange={(val) => setNewItem({ ...newItem, categoryId: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {MOCK_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="price">Price (PKR)</Label>
                        <Input 
                            id="price" 
                            type="number" 
                            value={newItem.price} 
                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} 
                            placeholder="0"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                            id="description" 
                            value={newItem.description} 
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} 
                            placeholder="Describe the ingredients and taste..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddItem} className="bg-orange-600 hover:bg-orange-700">Save Item</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
         <div className="grid grid-cols-12 gap-4 p-4 font-semibold border-b bg-gray-50 text-gray-500 text-sm">
            <div className="col-span-6 md:col-span-5">Item Details</div>
            <div className="col-span-3 md:col-span-2 text-right">Price</div>
            <div className="col-span-3 md:col-span-2 text-center md:text-left">Status</div>
            <div className="col-span-12 md:col-span-3 text-right">Actions</div>
         </div>
         
         <div className="divide-y">
            {menuItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50/50 transition-colors">
                    <div className="col-span-6 md:col-span-5 flex gap-3 items-center">
                        <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                             {/* Placeholder */}
                             <ImageIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                        </div>
                    </div>
                    
                    <div className="col-span-3 md:col-span-2 text-right font-medium text-gray-700">
                        {formatCurrency(item.price)}
                    </div>
                    
                    <div className="col-span-3 md:col-span-2 flex justify-center md:justify-start">
                         <Badge 
                            variant="secondary" 
                            className={cn(
                                "cursor-pointer select-none",
                                item.available ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                            )}
                            onClick={() => toggleMenuItemAvailability(item.id)}
                         >
                            {item.available ? "Available" : "Sold Out"}
                         </Badge>
                    </div>

                    <div className="col-span-12 md:col-span-3 flex justify-end gap-2 mt-2 md:mt-0">
                        <div className="flex items-center space-x-2">
                             <span className="text-xs text-gray-400">Availability</span>
                             <Switch 
                                checked={item.available} 
                                onCheckedChange={() => toggleMenuItemAvailability(item.id)}
                             />
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                    </div>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
}
