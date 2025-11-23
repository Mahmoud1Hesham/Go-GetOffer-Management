"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
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

export function TeamSwitcher({
  teams
}) {
  const { isMobile } = useSidebar()
  // Track active team by index so display updates when `teams` or language change
  const [activeIndex, setActiveIndex] = React.useState(0)
  const activeTeam = teams[activeIndex]
  const { t, i18n } = useTranslation(["sideBar"]);
  const searchParams = useSearchParams();
  const lang = searchParams.get("lang") || i18n.language || "en";
  const isRtl = lang !== 'en'
  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div
                className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className={`truncate font-semibold ${lang === 'en' ? "text-left":"text-right" }`}>
                  {activeTeam.name}
                </span>
                <span className={`truncate text-xs ${lang === 'en' ? "text-left":"text-right" }`}>{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align={isRtl ? 'end' : 'start'}
            side={isMobile ? 'bottom' : (isRtl ? 'left' : 'right')}
            sideOffset={4}>
            <DropdownMenuLabel className={`text-xs text-muted-foreground ${lang === 'en' ? "text-left":"text-right" }`}>
              {t('teams')}
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveIndex(index)}
                className={`flex items-center gap-2 p-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <team.logo className="size-4 shrink-0" />
                </div>
                <span className={`flex-1 truncate ${isRtl ? 'text-right' : 'text-left'}`}>
                  {team.name}
                </span>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className={`flex items-center gap-2 p-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className={`font-medium text-muted-foreground ${isRtl ? 'text-right flex-1' : ''}`}> {t("add-team")}</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
