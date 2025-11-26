"use client"

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from 'next/link';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useSearchParams, usePathname } from "next/navigation.js";

export function NavMain({
  items,
  title
}) {
  const searchParams = useSearchParams()
  const lang = searchParams.get("lang") || "en"
  const isRtl = lang !== "en"
  const pathname = usePathname() || '/'

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item, itemIndex) => {
          const isSimple = item?.['no-chv'] === true || item?.noChv === true;

          // determine active state for this item
          // - simple links (no-chv) should be active only on exact match
          // - collapsible parents should be active on exact match or when any nested route starts with the parent url
          const itemUrl = (item?.url && item.url !== '#') ? item.url : null
          let itemActive = false
          if (itemUrl) {
            if (isSimple) {
              itemActive = pathname === itemUrl
            } else {
              itemActive = pathname === itemUrl || pathname.startsWith(itemUrl + '/')
            }
          }

          if (isSimple) {
            const simpleActiveClass = itemActive ? 'bg-go-bg-l-e text-go-primary-g font-semibold' : ''
            return (
              <SidebarMenuItem key={`${item.title ?? "item"}-${itemIndex}`}>
                {/* Pass tooltip so simple (no-chv) items still show tooltips when sidebar is collapsed */}
                <SidebarMenuButton asChild isActive={itemActive} className={simpleActiveClass} tooltip={item.title}>
                    <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={`${item.title ?? "item"}-${itemIndex}`} // key فريد باستخدام العنوان + الايندكس
              asChild
              defaultOpen={itemActive}
              className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={itemActive} className={`${lang === 'en' ? 'text-left' : 'text-right'} ${itemActive ? 'bg-go-bg-l-e text-go-primary-g font-semibold' : ''}`}>
                    <Link href={item.url} onClick={(e) => e.stopPropagation()} className="flex-1 inline-flex items-center gap-2">
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {console.log && console.log("NavMain active:", item.title, itemActive)}
                      {!isRtl ? (
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      ) : (
                        <ChevronLeft className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:-rotate-90" />
                      )}
                    </Link>
            </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub lang={lang}>
                    {item.items?.map((subItem, subIndex) => {
                      const subUrl = (subItem?.url && subItem.url !== '#') ? subItem.url : null
                      const subActive = subUrl ? pathname === subUrl : false
                      return (
                        <SidebarMenuSubItem rMenuSubItem
                          key={`${item.title ?? "item"}-${subItem.title ?? "sub"}-${subIndex}`} // key فريد للمجموعة الفرعية
                        >
                            <SidebarMenuSubButton asChild isActive={subActive} className={subActive ? 'bg-go-bg-l-e text-go-primary-g font-semibold' : ''}>
                              <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
