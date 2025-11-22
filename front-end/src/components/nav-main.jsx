"use client"

import { ChevronLeft, ChevronRight } from "lucide-react";

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
import { useSearchParams } from "next/navigation.js";

export function NavMain({
  items,
  title
}) {
  const searchParams = useSearchParams()
  const lang = searchParams.get("lang") || i18n.language || "en"
  const isRtl = lang !== "en"

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item, itemIndex) => {
          const isSimple = item?.['no-chv'] === true || item?.noChv === true;

          if (isSimple) {
            return (
              <SidebarMenuItem key={`${item.title ?? "item"}-${itemIndex}`}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={`${item.title ?? "item"}-${itemIndex}`} // key فريد باستخدام العنوان + الايندكس
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
{!isRtl?
                    <ChevronRight
                      className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      :
                      <ChevronLeft
                        className="mr-auto transition-transform duration-200 group-data-[state=open]/collapsible:-rotate-90" />
                    }      
            </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem, subIndex) => (
                      <SidebarMenuSubItem
                        key={`${item.title ?? "item"}-${subItem.title ?? "sub"}-${subIndex}`} // key فريد للمجموعة الفرعية
                      >
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
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
