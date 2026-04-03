"use client";

import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { Trash2, Plus, Edit, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function MenuPage() {
  const menuItems = useAdminStore((state) => state.menuItems);
  const toggleMenuItemAvailability = useAdminStore((state) => state.toggleMenuItemAvailability);
  const addMenuItem = useAdminStore((state) => state.addMenuItem);
  const fetchMenu = useAdminStore((state) => state.fetchMenu);
  const categories = useAdminStore((state) => state.categories);
  const fetchCategories = useAdminStore((state) => state.fetchCategories);
  const addCategory = useAdminStore((state) => state.addCategory);
  const deleteCategory = useAdminStore((state) => state.deleteCategory);
  const updateMenuItem = useAdminStore((state) => state.updateMenuItem);
  const deleteMenuItem = useAdminStore((state) => state.deleteMenuItem);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  
  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, [fetchMenu, fetchCategories]);

  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "/images/food-placeholder.png",
  });
  const [errors, setErrors] = useState({
    name: "",
    price: "",
    categoryId: "",
  });

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large", { description: "Maximum size is 5MB" });
        return;
    }

    // Set local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploading(true);
    try {
        const url = await uploadToCloudinary(file);
        setNewItem(prev => ({ ...prev, imageUrl: url }));
        toast.success("Image uploaded successfully");
    } catch (error: any) {
        toast.error("Upload failed", { description: error.message });
        setPreviewUrl(null); // Reset on failure
    } finally {
        setIsUploading(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const handleSaveItem = async () => {
    const newErrors = {
      name: newItem.name ? "" : "Item name is required",
      price: newItem.price ? "" : "Price is required",
      categoryId: newItem.categoryId ? "" : "Category is required",
    };

    if (newErrors.name || newErrors.price || newErrors.categoryId) {
      setErrors(newErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setIsSaving(true);
    try {
        if (editingItem) {
            await updateMenuItem(editingItem.id, {
                name: newItem.name,
                description: newItem.description,
                price: Number(newItem.price),
                categoryId: newItem.categoryId,
                imageUrl: newItem.imageUrl,
            });
            toast.success("Item updated successfully");
        } else {
            await addMenuItem({
                name: newItem.name,
                description: newItem.description,
                price: Number(newItem.price),
                categoryId: newItem.categoryId,
                imageUrl: newItem.imageUrl,
            });
            toast.success("Item added successfully");
        }

        setIsItemModalOpen(false);
        setEditingItem(null);
        setNewItem({ name: "", description: "", price: "", categoryId: "", imageUrl: "/images/food-placeholder.png" });
        setPreviewUrl(null);
        setErrors({ name: "", price: "", categoryId: "" });
    } catch (err) {
        toast.error("Failed to save item");
    } finally {
        setIsSaving(false);
    }
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setNewItem({
        name: item.name,
        description: item.description || "",
        price: item.price.toString(),
        categoryId: item.categoryId,
        imageUrl: item.imageUrl || "/images/food-placeholder.png",
    });
    setIsItemModalOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
        await deleteMenuItem(id);
        toast.success("Item deleted successfully");
    }
  };

  const [isAddingCat, setIsAddingCat] = useState(false);
  const handleAddCategory = async () => {
    if (!newCatName) return;
    setIsAddingCat(true);
    try {
        await addCategory(newCatName);
        setNewCatName("");
        toast.success("Category added");
    } catch (e) {
        toast.error("Failed to add category");
    } finally {
        setIsAddingCat(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
        
        <div className="flex gap-2">
            <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        Manage Categories
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Categories</DialogTitle>
                        <DialogDescription>
                            Add or remove categories for your menu.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex gap-2">
                            <Input 
                                placeholder="Category Name" 
                                value={newCatName} 
                                onChange={(e) => setNewCatName(e.target.value)} 
                            />
                            <Button 
                                onClick={handleAddCategory}
                                disabled={isAddingCat || !newCatName}
                            >
                                {isAddingCat ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                            </Button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            {categories.map((cat) => (
                                <div key={cat.id} className="flex items-center justify-between p-2 border rounded">
                                    <span>{cat.name}</span>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-red-500"
                                        onClick={() => {
                                            if (confirm(`Remove category "${cat.name}"?`)) {
                                                deleteCategory(cat.id);
                                                toast.success("Category removed");
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isItemModalOpen} onOpenChange={(open) => {
                setIsItemModalOpen(open);
                if (!open) {
                    setEditingItem(null);
                    setNewItem({ name: "", description: "", price: "", categoryId: "", imageUrl: "/images/food-placeholder.png" });
                    setPreviewUrl(null);
                    setErrors({ name: "", price: "", categoryId: "" });
                }
            }}>
                <DialogTrigger asChild>
                    <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setIsItemModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add New Item
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
                        <DialogDescription>
                            {editingItem ? "Update the details of this item." : "Create a new delicious item for your menu."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Item Name</Label>
                            <Input 
                                id="name" 
                                value={newItem.name} 
                                onChange={(e) => {
                                    setNewItem({ ...newItem, name: e.target.value });
                                    if (errors.name) {
                                        setErrors((prev) => ({ ...prev, name: "" }));
                                    }
                                }} 
                                placeholder="e.g., Spicy Beef Burger"
                                className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select 
                                value={newItem.categoryId} 
                                onValueChange={(val) => {
                                    setNewItem({ ...newItem, categoryId: val });
                                    if (errors.categoryId) {
                                        setErrors((prev) => ({ ...prev, categoryId: "" }));
                                    }
                                }}
                            >
                                <SelectTrigger className={cn(errors.categoryId && "border-red-500 focus-visible:ring-red-500")}>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.categoryId && (
                                <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price (PKR)</Label>
                                <Input 
                                id="price" 
                                type="text" 
                                inputMode="numeric"
                                step={100}
                                min={0}
                                pattern="[0-9]*"
                                value={newItem.price} 
                                onChange={(e) => {
                                    const rawValue = e.target.value;
                                    const numericValue = rawValue.replace(/\D/g, "");

                                    setNewItem({ ...newItem, price: numericValue });

                                    if (errors.price && numericValue) {
                                        setErrors((prev) => ({ ...prev, price: "" }));
                                    }
                                }} 
                                placeholder="0"
                                className={cn(errors.price && "border-red-500 focus-visible:ring-red-500")}
                            />
                            {errors.price && (
                                <p className="text-xs text-red-500 mt-1">{errors.price}</p>
                            )}
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
                        <div className="grid gap-2">
                            <Label>Item Image</Label>
                            <div className="flex items-center gap-4">
                                <div className="h-24 w-24 rounded-lg border-2 border-dashed border-orange-200 flex items-center justify-center overflow-hidden bg-gray-50 relative group transition-all hover:bg-orange-50/50">
                                    {isUploading ? (
                                        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                                    ) : (
                                        <>
                                            <img 
                                                src={previewUrl || newItem.imageUrl} 
                                                alt="Preview" 
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = "/images/food-placeholder.png";
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <ImageIcon className="h-6 w-6 text-white" />
                                            </div>
                                        </>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-semibold text-gray-700">Upload Item Image</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Best size: 800x800px. <br/>
                                        Max size 5MB. format: JPG, PNG.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsItemModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveItem} className="bg-orange-600 hover:bg-orange-700" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingItem ? "Update Item" : "Save Item"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
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
                        <div className="h-12 w-12 rounded-lg border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-50">
                             <img 
                                 src={item.imageUrl || "/images/food-placeholder.png"} 
                                 alt={item.name} 
                                 className="h-full w-full object-cover"
                                 onError={(e) => {
                                     const target = e.target as HTMLImageElement;
                                     target.src = "/images/food-placeholder.png";
                                 }}
                             />
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(item)}>
                            <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
}
