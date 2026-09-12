import type { Lang } from "@/lib/i18n/dictionary";

export function formatCNY(n: number, lang: Lang = "zh") {
  return n.toLocaleString(lang === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 2,
  });
}

export function formatDate(d: Date, lang: Lang = "zh") {
  return d.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US");
}
