"use client";

import { Category, MenuItem } from "@/lib/types";
import { MenuItemCard } from "./MenuItemCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface MenuCategoryProps {
  categories: Category[];
  items: MenuItem[];
}

export function MenuCategory({ categories, items }: MenuCategoryProps) {
  // Group items by category
  const itemsByCategory = categories.reduce((acc, category) => {
    acc[category.id] = items.filter((item) => item.categoryId === category.id);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <Tabs defaultValue={categories[0]?.id} className="w-full">
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 w-full border-b border-gray-100">
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-0">
                {categories.map((category) => (
                <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:text-orange-700 data-[state=active]:shadow-none py-4 px-6 text-base font-medium text-gray-500"
                >
                    {category.name}
                </TabsTrigger>
                ))}
            </TabsList>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
      </div>

      <div className="p-4 pb-24 max-w-7xl mx-auto">
        {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-4 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    {itemsByCategory[category.id]?.map((item) => (
                        <MenuItemCard key={item.id} item={item} />
                    ))}
                </div>
                {itemsByCategory[category.id]?.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No items in this category.
                    </div>
                )}
            </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
