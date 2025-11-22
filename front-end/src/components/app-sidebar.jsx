"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import LanguageToggler from "./ui/common/langSelectionButton.jsx"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "next/navigation.js"
import { TbCheckupList } from "react-icons/tb";
import { RiCustomerService2Line } from "react-icons/ri";
import { LuPackageCheck } from "react-icons/lu";
import { LiaShippingFastSolid } from "react-icons/lia";
import { LuWarehouse } from "react-icons/lu";
import { TbReportMoney } from "react-icons/tb";
import { LuMessageSquareWarning } from "react-icons/lu";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { LuSettings2 } from "react-icons/lu";

// This is sample data.

export function AppSidebar({
  ...props
}) {
  const { t, i18n } = useTranslation(['sideBar'])
  const searchParams = useSearchParams()
  const lang = searchParams.get("lang") || i18n.language || "en"
  const isRtl = lang !== "en"
  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "https://github.com/shadcn.png",
    },
    teams: [
      {
        name: t("branch-Name"),
        logo: GalleryVerticalEnd,
        plan: t("branch-desc"),
      },
      // {
      //   name: "Acme Corp.",
      //   logo: AudioWaveform,
      //   plan: "Startup",
      // },
      // {
      //   name: "Evil Corp.",
      //   logo: Command,
      //   plan: "Free",
      // },
    ],
    navMain: [
      {
        title: t("divisions.follow-up.name"),
        url: "#",
        icon: TbCheckupList,
        isActive: true,
        items: [
          {
            title:  t("divisions.follow-up.Departments.join"),
            url: "#",
          },
          {
            title: t("divisions.follow-up.Departments.order"),
            url: "#",
          },
          {
            title: t("divisions.follow-up.Departments.purchase"),
            url: "#",
          },
          {
            title: t("divisions.follow-up.Departments.complains"),
            url: "#",
          },
        ],
      },
      {
        title:  t("divisions.customer-service.name"),
        url: "#",
        icon: RiCustomerService2Line  ,
        items: [
          {
            title: t("divisions.customer-service.Departments.join"),
            url: "#",
          },
          {
            title: t("divisions.customer-service.Departments.order"),
            url: "#",
          },
          {
            title: t("divisions.customer-service.Departments.complains"),
            url: "#",
          },
        ],
      },
      {
        title:  t("divisions.receiving.name"),
        url: "#",
        icon: LuPackageCheck,
        items: [
          {
            title: t("divisions.receiving.Departments.receive"),
            url: "#",
          },
          {
            title: t("divisions.receiving.Departments.returns"),
            url: "#",
          },
          {
            title: t("divisions.receiving.Departments.complains"),
            url: "#",
          },
        ],
      },
      {
        title:  t("divisions.shipping.name"),
        url: "#",
        icon: LiaShippingFastSolid,
        items: [
          {
            title: t("divisions.shipping.Departments.order-delivery"),
            url: "#",
          },
          {
            title: t("divisions.shipping.Departments.order-pickup"),
            url: "#",
          },
          {
            title: t("divisions.shipping.Departments.complains"),
            url: "#",
          },
        ],
      },
      {
        title:  t("divisions.storage.name"),
        url: "#",
        icon: LuWarehouse,
        items: [
          {
            title: t("divisions.storage.Departments.process"),
            url: "#",
          },
          {
            title: t("divisions.storage.Departments.returns"),
            url: "#",
          },
          {
            title: t("divisions.storage.Departments.complains"),
            url: "#",
          },
        ],
      },
      {
        title:  t("divisions.accounting.name"),
        url: "#",
        icon: TbReportMoney,
        items: [
          {
            title: t("divisions.accounting.Departments.receipts"),
            url: "#",
          },
          {
            title: t("divisions.accounting.Departments.supplier-payment"),
            url: "#",
          },
          {
            title: t("divisions.accounting.Departments.client-payment"),
            url: "#",
          },
          {
            title: t("divisions.accounting.Departments.complains"),
            url: "#",
          },
        ],
      },
      {
        title:  t("divisions.marketing.name"),
        url: "#",
        icon: LuMessageSquareWarning,
        items: [
          {
            title: t("divisions.marketing.Departments.general"),
            url: "#",
          },
        ],
      },
      {
        title:  t("divisions.complains.name"),
        url: "#",
        icon: TbBrandGoogleAnalytics,
        items: [
          {
            title: t("divisions.complains.Departments.general"),
            url: "#",
          },
        ],
      },
    ],
    projects: [
      {
        name:  t("platform.dashboard"),
        url: "#",
        icon: TbLayoutDashboardFilled,
        'no-chv': true
      },
      {
        name:  t("platform.Management.name"),
        url: "#",
        icon: LuSettings2,
              items:[
          {title:t("platform.Management.tabs.employees"),url:"#"},
          {title:t("platform.Management.tabs.suppliers"),url:"#"},
          {title:t("platform.Management.tabs.clients"),url:"#"},
          {title:t("platform.Management.tabs.products"),url:"#"},
          {title:t("platform.Management.tabs.branches"),url:"#"},
        ]
      },
    ],
  }
  // map projects into the shape expected by `NavMain` (title, url, icon, items[])
  const platformItems = data.projects.map((p) => ({
    title: p.name,
    url: p.url,
    icon: p.icon,
    // keep any `no-chv` / `noChv` flag so NavMain can detect it
    ...(p?.['no-chv'] ? { 'no-chv': true } : {}),
    ...(p?.noChv ? { noChv: true } : {}),
    items: Array.isArray(p.items)
      ? p.items.map((si) => ({ title: si.title || si.name || '', url: si.url }))
      : undefined,
  }))
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className={isRtl ? "text-right" : "text-left"}>
      <Sidebar
        // لو الـ Sidebar component بيسمح بتمرير className / style فممكن نضيف direction كمان
        {...props}
        className={`${props.className || ""} ${isRtl ? "rtl-sidebar right-0" : ""}`}
        style={{ direction: isRtl ? "rtl" : "ltr" }}
        collapsible="icon"
      >

        <SidebarHeader>
          <TeamSwitcher teams={data.teams} />
        </SidebarHeader>
        <SidebarContent>
          <LanguageToggler />
          <NavMain title={t('divisions.sec-name')} items={data.navMain} />
          <NavMain title={t('platform.sec-name')} items={platformItems} />
          {/* <NavProjects projects={data.projects} /> */}
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </div>
  );
}
