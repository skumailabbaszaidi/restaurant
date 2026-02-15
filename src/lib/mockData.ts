import { Category, MenuItem, Restaurant } from "./types";

export const MOCK_RESTAURANT: Restaurant = {
  id: "r1",
  name: "Lahore Grill",
  slug: "lahore-grill",
  logoUrl: "/images/logo-placeholder.png", // We'll need a placeholder
  currency: "PKR",
};

export const MOCK_CATEGORIES: Category[] = [
  { id: "c1", name: "Appetizers" },
  { id: "c2", name: "Mains" },
  { id: "c3", name: "BBQ" },
  { id: "c4", name: "Naan & Breads" },
  { id: "c5", name: "Drinks" },
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: "m1",
    name: "Chicken Tikka Boti",
    description: "Tender chicken pieces marinated in yogurt and spices, grilled to perfection.",
    price: 450,
    categoryId: "c3",
    imageUrl: "/images/food-placeholder.png",
    available: true,
    spiceLevels: ["mild", "medium", "hot"],
  },
  {
    id: "m2",
    name: "Seekh Kebab",
    description: "Minced beef skewers mixed with herbs and spices.",
    price: 350,
    categoryId: "c3",
    imageUrl: "/images/food-placeholder.png",
    available: true,
    spiceLevels: ["medium", "hot"],
  },
  {
    id: "m3",
    name: "Chicken Biryani",
    description: "Aromatic basmati rice cooked with chicken and authentic spices.",
    price: 600,
    categoryId: "c2",
    imageUrl: "/images/food-placeholder.png",
    available: true,
  },
  {
    id: "m4",
    name: "Butter Naan",
    description: "Soft leavened bread brushed with butter.",
    price: 80,
    categoryId: "c4",
    imageUrl: "/images/food-placeholder.png",
    available: true,
  },
  {
    id: "m5",
    name: "Mango Lassi",
    description: "Chilled yogurt drink blended with sweet mangoes.",
    price: 250,
    categoryId: "c5",
    imageUrl: "/images/food-placeholder.png",
    available: true,
  },
   {
    id: "m6",
    name: "Samosa Chaat",
    description: "Crispy samosas topped with chickpeas, yogurt, and chutneys.",
    price: 200,
    categoryId: "c1",
    imageUrl: "/images/food-placeholder.png",
    available: true,
    spiceLevels: ["mild", "medium", "hot"],
  },
];
