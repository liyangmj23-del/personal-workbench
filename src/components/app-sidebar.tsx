"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  NotebookText,
  Network,
  Inbox,
  Settings,
  Check,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/components/language-provider";
import type { Lang } from "@/lib/i18n/dictionary";

export function AppSidebar() {
  const pathname = usePathname();
  const { t, lang, setLang } = useLanguage();

  const NAV_ITEMS = [
    { href: "/", label: t.nav_dashboard, icon: LayoutDashboard },
    { href: "/finance", label: t.nav_finance, icon: Wallet },
    { href: "/notes", label: t.nav_notes, icon: NotebookText },
    { href: "/knowledge-graph", label: t.nav_knowledge_graph, icon: Network },
    { href: "/capture", label: t.nav_capture, icon: Inbox },
  ];

  const LANG_OPTIONS: { value: Lang; label: string }[] = [
    { value: "zh", label: t.lang_zh },
    { value: "en", label: t.lang_en },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-1.5">
          <div className="text-sm font-semibold">{t.app_name}</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t.nav_group_modules}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton render={<Link href={item.href} />} isActive={active}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton />}>
                <Settings />
                <span>{t.settings}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{t.language}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {LANG_OPTIONS.map((opt) => (
                    <DropdownMenuItem key={opt.value} onClick={() => setLang(opt.value)}>
                      {opt.label}
                      {lang === opt.value && <Check className="ml-auto size-4" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
