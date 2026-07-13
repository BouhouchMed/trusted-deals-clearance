import {
  Armchair,
  BadgePercent,
  Home,
  MonitorSmartphone,
  Shirt,
  ShoppingCart,
  Sparkles
} from "lucide-react";

const icons = { Armchair, BadgePercent, Home, MonitorSmartphone, Shirt, ShoppingCart, Sparkles };

export function CategoryIcon({ name }: { name: string }) {
  const Icon = icons[name as keyof typeof icons] ?? Sparkles;
  return <Icon size={24} />;
}
