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
import { useSelector } from 'react-redux'
import { selectUsername, selectEmail, selectAvatar, selectBranches, selectRoleKey } from '@/redux/slices/authSlice'
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
  const lang = searchParams.get("lang") || i18n.language || "ar"
  const isRtl = lang !== "en"
  const username = useSelector(selectUsername) || ''
  const emailAddr = useSelector(selectEmail) || ''
  const avatar = useSelector(selectAvatar) || ''
  const roleKey = useSelector(selectRoleKey) || null
  const branches = useSelector(selectBranches) || []

  const roleKeyValue = (roleKey && (roleKey.roleKey ?? (typeof roleKey === 'string' ? roleKey : null))) || null
  const displayName = username ? (roleKeyValue ? `${username} - ${roleKeyValue}` : username) : (roleKeyValue ? `shadcn - ${roleKeyValue}` : 'shadcn')
  // build teams from branches: name = first word of branchName, plan = last word, logo if provided
  const teams = Array.isArray(branches) && branches.length > 0
    ? branches.map((b) => {
        const branchName = b?.branchName || b?.name || ''
        const parts = branchName.trim().split(/\s+/).filter(Boolean)
        const name = parts[0] || branchName || t('branch-Name')
        const plan = parts.length > 0 ? parts[parts.length - 1] : ''
        return {
          name,
          // ensure logo is never undefined; fallback to GalleryVerticalEnd
          logo: b?.logo ?? GalleryVerticalEnd,
          plan,
        }
      })
    : [
      {
        name: t("branch-Name"),
        logo: GalleryVerticalEnd,
        plan: t("branch-desc"),
      },
    ]

  const data = {
    user: {
      name: displayName,
      email: emailAddr || 'm@example.com',
      avatar: avatar || 'https://github.com/shadcn.png',
    },
    teams,
    navMain: [
      {
        title: t("divisions.follow-up.name"),
        url: "/dashboard/divisions/follow-up",
        icon: TbCheckupList,
        isActive: true,
        items: [
          {
            title:  t("divisions.follow-up.Departments.join"),
            url: "/dashboard/divisions/follow-up/supplier-joining-requests",
          },
          {
            title: t("divisions.follow-up.Departments.order"),
            url: "/dashboard/divisions/follow-up/supplier-order-tracking",
          },
          {
            title: t("divisions.follow-up.Departments.purchase"),
            url: "/dashboard/divisions/follow-up/purchases",
          },
          {
            title: t("divisions.follow-up.Departments.complains"),
            url: "/dashboard/divisions/follow-up/complains",
          },
        ],
      },
      {
        title:  t("divisions.customer-service.name"),
        url: "/dashboard/divisions/customer-service",
        icon: RiCustomerService2Line  ,
        items: [
          {
            title: t("divisions.customer-service.Departments.join"),
            url: "/dashboard/divisions/customer-service/join-requests",
          },
          {
            title: t("divisions.customer-service.Departments.order"),
            url: "/dashboard/divisions/customer-service/order-tracking",
          },
          {
            title: t("divisions.customer-service.Departments.complains"),
            url: "/dashboard/divisions/customer-service/complains",
          },
        ],
      },
      {
        title:  t("divisions.receiving.name"),
        url: "/dashboard/divisions/receiving-completion",
        icon: LuPackageCheck,
        items: [
          {
            title: t("divisions.receiving.Departments.receive"),
            url: "/dashboard/divisions/receiving-completion/receive",
          },
          {
            title: t("divisions.receiving.Departments.returns"),
            url: "/dashboard/divisions/receiving-completion/returns",
          },
          {
            title: t("divisions.receiving.Departments.complains"),
            url: "/dashboard/divisions/receiving-completion/complains",
          },
        ],
      },
      {
        title:  t("divisions.shipping.name"),
        url: "/dashboard/divisions/shipping",
        icon: LiaShippingFastSolid,
        items: [
          {
            title: t("divisions.shipping.Departments.order-delivery"),
            url: "/dashboard/divisions/shipping/order-shipping",
          },
          {
            title: t("divisions.shipping.Departments.order-pickup"),
            url: "/dashboard/divisions/shipping/order-pickup",
          },
          {
            title: t("divisions.shipping.Departments.complains"),
            url: "/dashboard/divisions/shipping/complains",
          },
        ],
      },
      {
        title:  t("divisions.storage.name"),
        url: "/dashboard/divisions/storage",
        icon: LuWarehouse,
        items: [
          {
            title: t("divisions.storage.Departments.process"),
            url: "/dashboard/divisions/storage/process",
          },
          {
            title: t("divisions.storage.Departments.returns"),
            url: "/dashboard/divisions/storage/returns",
          },
          {
            title: t("divisions.storage.Departments.complains"),
            url: "/dashboard/divisions/storage/complains",
          },
        ],
      },
      {
        title:  t("divisions.accounting.name"),
        url: "/dashboard/divisions/accounting",
        icon: TbReportMoney,
        items: [
          {
            title: t("divisions.accounting.Departments.receipts"),
            url: "/dashboard/divisions/accounting/receipts",
          },
          {
            title: t("divisions.accounting.Departments.supplier-payment"),
            url: "/dashboard/divisions/accounting/supplier-transactions",
          },
          {
            title: t("divisions.accounting.Departments.client-payment"),
            url: "/dashboard/divisions/accounting/client-transactions",
          },
          {
            title: t("divisions.accounting.Departments.complains"),
            url: "/dashboard/divisions/accounting/complains",
          },
        ],
      },
      {
        title:  t("divisions.marketing.name"),
        url: "/dashboard/divisions/marketing",
        icon: LuMessageSquareWarning,
        items: [
          {
            title: t("divisions.marketing.Departments.general"),
            url: "/dashboard/divisions/marketing/general",
          },
        ],
      },
      {
        title:  t("divisions.complains.name"),
        url: "/dashboard/divisions/complains",
        icon: TbBrandGoogleAnalytics,
        items: [
          {
            title: t("divisions.complains.Departments.general"),
            url: "/dashboard/divisions/complains/general",
          },
        ],
      },
    ],
    projects: [
      {
        name:  t("platform.dashboard"),
        url: "/dashboard",
        icon: TbLayoutDashboardFilled,
        'no-chv': true
      },
      {
        name:  t("platform.Management.name"),
        url: "#",
        icon: LuSettings2,
              items:[
          {
            title:t("platform.Management.tabs.employees"),
            url:"/dashboard/management/employees"
          },
          {
            title:t("platform.Management.tabs.suppliers"),
            url:"/dashboard/management/suppliers"
          },
          {
            title:t("platform.Management.tabs.clients"),
            url:"/dashboard/management/clients"
          },
          {
            title:t("platform.Management.tabs.products"),
            url:"/dashboard/management/products"
          },
          {
            title:t("platform.Management.tabs.branches"),
            url:"/dashboard/management/branches"
          },
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
    <div dir={isRtl ? "rtl" : "ltr"} className={isRtl ? "text-right font-honor" : "text-left font-figtree"}>
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
