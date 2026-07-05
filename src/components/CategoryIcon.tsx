/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Car,
  Home,
  Zap,
  Tv,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  PiggyBank,
  Sparkles,
  Gift,
  Coins,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  LogOut,
  Calendar,
  DollarSign,
  PieChart,
  ListFilter,
  Info,
  Sparkle,
  X,
  PlusCircle,
  User
} from 'lucide-react';

const iconsMap: Record<string, React.ComponentType<any>> = {
  Utensils,
  ShoppingBag,
  Car,
  Home,
  Zap,
  Tv,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  PiggyBank,
  Sparkles,
  Gift,
  Coins,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  LogOut,
  Calendar,
  DollarSign,
  PieChart,
  ListFilter,
  Info,
  Sparkle,
  X,
  PlusCircle,
  User
};

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function CategoryIcon({ name, className = '', size = 20 }: CategoryIconProps) {
  const IconComponent = iconsMap[name] || MoreHorizontal;
  return <IconComponent className={className} size={size} />;
}
