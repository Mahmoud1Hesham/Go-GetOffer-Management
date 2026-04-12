"use client"

import React, { useState, useEffect } from 'react'
import {
  ChevronsUpDown,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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
import { useSearchParams, useRouter } from "next/navigation.js"
import { GoPasskeyFill } from "react-icons/go";
import useAuth from "@/hooks/useAuth"
import LoginDialog from "./ui/common/dialogs/loginDialog"
import useFetch from "@/hooks/useFetch"
import { toast } from "sonner"

export function NavUser({
  user
}) {
  const { isMobile } = useSidebar()
  const router = useRouter();
  // Use explicit namespace string to avoid ambiguity
  const { t, i18n } = useTranslation('sideBar');
  const searchParams = useSearchParams();
  const lang = searchParams.get("lang") || i18n.language || "ar";
  const isRtl = lang !== "en";
  const { login,logout,isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const [isMaintenanceEnabled, setIsMaintenanceEnabled] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [maintenanceStep, setMaintenanceStep] = useState(1);

  const { data: maintenanceData, loading: isInitMaintenanceLoading } = useFetch("/api/Maintenance", {
    method: "GET",
  });

  const { run: setMaintenanceRun, loading: isMaintenanceLoading } = useFetch("/api/Maintenance/set-maintenance", {
    method: "POST",
    manual: true
  });

  useEffect(() => {
    if (maintenanceData) {
      // Set initial status based on API response
      // Structure logic depending on how the backend returns it. Usually maintenanceData.isInMaintenanceMode
      setIsMaintenanceEnabled(!!maintenanceData.isInMaintenanceMode);
    }
  }, [maintenanceData]);

  const toggleMaintenanceStatus = async () => {
    const newState = !isMaintenanceEnabled;
    const response = await setMaintenanceRun({
      data: { isInMaintenanceMode: newState }
    });

    if (response?.ok) {
      setIsMaintenanceEnabled(newState);
      toast.success(isRtl ? "تم تغيير وضع الصيانة بنجاح" : "Maintenance mode updated successfully");
      setMaintenanceDialogOpen(false);
      setTimeout(() => setMaintenanceStep(1), 300); // reset step after closing
    } else {
      toast.error(isRtl ? "حدث خطأ أثناء تغيير وضع الصيانة" : "Failed to update maintenance mode");
    }
  };

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
              <DropdownMenuItem onClick={() => router.push('/dashboard/auth/change-password')} className={`${isRtl ? "flex-row-reverse" : "flex-row"} flex items-center gap-2 cursor-pointer`}>
                <GoPasskeyFill />
                <span className={`${isRtl ? "text-right" : "text-left"}`}>{t("user-menu.change-password")}</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => !isInitMaintenanceLoading && setMaintenanceDialogOpen(true)} className={`${isRtl ? "flex-row-reverse" : "flex-row"} flex items-center justify-between gap-2 cursor-pointer w-full ${isInitMaintenanceLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
                <span className={`${isRtl ? "text-right" : "text-left"}`}>وضع الصيانة</span>
                <span className={`px-2 py-0.5 rounded text-xs text-white ${isInitMaintenanceLoading ? "bg-gray-300" : isMaintenanceEnabled ? "bg-[#14b8a6]" : "bg-gray-400"}`}>
                  {isInitMaintenanceLoading ? "..." : isMaintenanceEnabled ? "مفعل" : "غير مفعل"}
                </span>
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

            <DropdownMenuItem onClick={() => {
              if (!isAuthenticated) {
                setShowLogin(true);
              } else {
                logout();
              }
            }} className={`${isRtl ? "flex-row-reverse" : "flex-row"} flex items-center gap-2`}>
              <LogOut />
              <span className={`${isRtl ? "text-right" : "text-left"}`}>{!isAuthenticated ? "تسجيل الدخول" : t("user-menu.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {showLogin && <LoginDialog />}

        <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
          <DialogContent className="sm:max-w-md" dir={isRtl ? "rtl" : "ltr"}>
            <DialogHeader>
              <DialogTitle className={`font-bold ${isRtl ? "text-right" : "text-left"} text-gray-800`}>
                تحديد حالة وضع الصيانة
              </DialogTitle>
            </DialogHeader>

            {maintenanceStep === 1 ? (
              <div className="flex flex-col gap-6 py-4">
                <p className={`text-sm text-gray-600 ${isRtl ? "text-right" : "text-left"}`}>
                  حدّد إذا كنت تريد تفعيل وضع الصيانة أو إيقافه.
                </p>
                <div className="flex justify-between items-center gap-4">
                  <button
                    onClick={() => {
                      if (!isMaintenanceEnabled) setMaintenanceStep(2);
                    }}
                    disabled={isMaintenanceEnabled}
                    className={`flex-1 py-2.5 rounded text-white font-medium transition-colors ${
                      isMaintenanceEnabled ? "bg-gray-300 cursor-not-allowed" : "bg-[#14b8a6] hover:bg-teal-600"
                    }`}
                  >
                    تفعيل
                  </button>
                  <button
                    onClick={() => {
                      if (isMaintenanceEnabled) setMaintenanceStep(2);
                    }}
                    disabled={!isMaintenanceEnabled}
                    className={`flex-1 py-2.5 rounded text-white font-medium transition-colors ${
                      !isMaintenanceEnabled ? "bg-gray-300 cursor-not-allowed" : "bg-[#14b8a6] hover:bg-teal-600"
                    }`}
                  >
                    إيقاف
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 py-4">
                <p className={`text-sm font-semibold text-gray-800 ${isRtl ? "text-right" : "text-left"}`}>
                  هل أنت متأكد من تغيير حالة وضع الصيانة؟
                </p>
                <p className={`text-sm text-gray-600 ${isRtl ? "text-right" : "text-left"}`}>
                  سيؤدي هذا الإجراء إلى تفعيل/إيقاف وضع الصيانة على النظام.
                </p>
                <div className="flex justify-between items-center gap-4 mt-2">
                  <button
                    onClick={toggleMaintenanceStatus}
                    disabled={isMaintenanceLoading}
                    className="flex-1 py-2.5 rounded bg-[#14b8a6] hover:bg-teal-600 text-white font-medium transition-colors outline-none disabled:opacity-70 flex justify-center items-center"
                  >
                    {isMaintenanceLoading ? "جاري الحفظ..." : "تأكيد"}
                  </button>
                  <button
                    onClick={() => setMaintenanceStep(1)}
                    disabled={isMaintenanceLoading}
                    className="flex-1 py-2.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors outline-none"
                  >
                    رجوع
                  </button>
                </div>
              </div>
            )}
            <DialogDescription className="sr-only">نافذة تأكيد تغيير وضع الصيانة</DialogDescription>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
