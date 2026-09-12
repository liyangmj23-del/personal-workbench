import {
  UtensilsCrossed,
  Bus,
  ShoppingBag,
  Home,
  Gamepad2,
  HeartPulse,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { Lang } from "@/lib/i18n/dictionary";

export type TxDirection = "IN" | "OUT";

export type CategoryDef = {
  key: string;
  icon: LucideIcon;
  label: { zh: string; en: string };
  /** Fixed chart color token for the stats chart. Only categories with a chartColor
   * get their own identity color — everything else folds into the "other" bucket.
   * This must stay a small, fixed set (color-formula: never repaint by rank). */
  chartColor?: string;
};

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { key: "food", icon: UtensilsCrossed, label: { zh: "餐饮", en: "Food" }, chartColor: "var(--chart-1)" },
  { key: "transport", icon: Bus, label: { zh: "交通", en: "Transport" }, chartColor: "var(--chart-2)" },
  { key: "shopping", icon: ShoppingBag, label: { zh: "购物", en: "Shopping" }, chartColor: "var(--chart-3)" },
  { key: "housing", icon: Home, label: { zh: "居住", en: "Housing" }, chartColor: "var(--chart-4)" },
  { key: "entertainment", icon: Gamepad2, label: { zh: "娱乐", en: "Entertainment" }, chartColor: "var(--chart-5)" },
  { key: "medical", icon: HeartPulse, label: { zh: "医疗", en: "Medical" } },
  { key: "other", icon: MoreHorizontal, label: { zh: "其他", en: "Other" } },
];

export const INCOME_CATEGORIES: CategoryDef[] = [
  { key: "salary", icon: Briefcase, label: { zh: "工资", en: "Salary" } },
  { key: "investment_income", icon: TrendingUp, label: { zh: "理财收益", en: "Investment income" } },
  { key: "other_income", icon: MoreHorizontal, label: { zh: "其他", en: "Other" } },
];

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function categoriesFor(direction: TxDirection): CategoryDef[] {
  return direction === "OUT" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
}

export function findCategory(key: string): CategoryDef | undefined {
  return ALL_CATEGORIES.find((c) => c.key === key);
}

/** Human label for a category key. Falls back to the raw stored text for
 * custom (non-preset) categories — those were typed by the user as-is. */
export function categoryLabel(key: string, lang: Lang): string {
  return findCategory(key)?.label[lang] ?? key;
}

export function categoryIcon(key: string): LucideIcon | undefined {
  return findCategory(key)?.icon;
}

/** Fixed chart-identity color for the "expense by category" chart.
 * Categories without a dedicated slot (medical, other, any custom text)
 * all fold into the same muted "other" bucket color — never assigned by
 * rank, so a category's color never changes when the data changes. */
export function chartColorFor(key: string): string {
  return findCategory(key)?.chartColor ?? "var(--muted-foreground)";
}

export const OTHER_BUCKET_KEY = "__other__";
