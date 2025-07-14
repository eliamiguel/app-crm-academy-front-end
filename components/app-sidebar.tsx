"use client"

import { Calendar, CreditCard, Dumbbell, Home, TrendingUp, Users, Bell, Activity, LogOut, GraduationCap } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { logout } from "@/lib/auth"
import { getAuthState } from "@/lib/auth"

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

  const authState = getAuthState()
  const user = authState.user
  console.log(user)

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
      <div className="text-center">
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-3 text-1xl font-extrabold text-gray-900">
            Gym CRM Academy
          </h2>
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
