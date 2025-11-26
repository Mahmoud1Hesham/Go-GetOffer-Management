"use client"

import {
  ChevronsUpDown,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "next/navigation.js"
import { GoPasskeyFill } from "react-icons/go";
export function NavUser({
  user
}) {
  const { isMobile } = useSidebar()
  // Use explicit namespace string to avoid ambiguity
  const { t, i18n } = useTranslation('sideBar');
  const searchParams = useSearchParams();
  const lang = searchParams.get("lang") || i18n.language || "en";
  const isRtl = lang !== "en";


  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
                <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className={`truncate font-semibold ${lang === 'en' ? "text-left" : "text-right"}`}>{user.name}</span>
                <span className={`truncate text-xs ${lang === 'en' ? "text-left" : "text-right"}`}>{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
                <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className={`flex items-center gap-2 px-1 py-1.5 text-sm
      ${lang === 'en' ? 'flex-row text-left' : 'flex-row-reverse text-right'}`}>
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                  <DropdownMenuItem className={`${isRtl ? "flex-row-reverse" : "flex-row"} flex items-center gap-2`}>
                <GoPasskeyFill />
                <span className={`${isRtl ? "text-right" : "text-left"}`}>{t("user-menu.change-password")}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {/* <DropdownMenuGroup>
              <DropdownMenuItem className={`${isRtl ? "flex-row-reverse" : "flex-row"} flex items-center gap-2`}>
                <Sparkles />
                <span className={`${isRtl ? "text-right" : "text-left"}`}>Upgrade to Pro</span>
              </DropdownMenuItem>
            </DropdownMenuGroup> */}

            {/* <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem className={`${isRtl ? "flex-row-reverse" : "flex-row"} flex items-center gap-2`}>
                <BadgeCheck />
                <span className={`${isRtl ? "text-right" : "text-left"}`}>Account</span>
              </DropdownMenuItem>

              <DropdownMenuItem className={`${isRtl ? "flex-row-reverse" : "flex-row"} flex items-center gap-2`}>
                <CreditCard />
                <span className={`${isRtl ? "text-right" : "text-left"}`}>Billing</span>
              </DropdownMenuItem>

              <DropdownMenuItem className={`${isRtl ? "flex-row-reverse" : "flex-row"} flex items-center gap-2`}>
                <Bell />
                <span className={`${isRtl ? "text-right" : "text-left"}`}>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator /> */}
            <DropdownMenuSeparator />

            <DropdownMenuItem className={`${isRtl ? "flex-row-reverse" : "flex-row"} flex items-center gap-2`}>
              <LogOut />
              <span className={`${isRtl ? "text-right" : "text-left"}`}>{t("user-menu.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
