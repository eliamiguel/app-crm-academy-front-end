"use client"

import { Calendar, CreditCard, Dumbbell, Home, TrendingUp, Users, Bell, Activity, LogOut, GraduationCap } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { logout } from "@/lib/auth"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    path: "/",
  },
  {
    title: "Alunos",
    icon: Users,
    path: "/students",
  },
  {
    title: "Instrutores",
    icon: GraduationCap,
    path: "/instructors",
  },
  {
    title: "Pagamentos",
    icon: CreditCard,
    path: "/payments",
  },
  {
    title: "Agendamentos",
    icon: Calendar,
    path: "/schedule",
  },
  {
    title: "Evolução",
    icon: TrendingUp,
    path: "/progress",
  },
  {
    title: "Planos de Treino",
    icon: Dumbbell,
    path: "/workout-plans",
  },
  {
    title: "Notificações",
    icon: Bell,
    path: "/notifications",
  },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold">GymCRM</h1>
            <p className="text-sm text-muted-foreground">Academia & Personal</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    isActive={pathname === item.path} 
                    onClick={() => handleNavigation(item.path)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Botão de Logout separado */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
