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
        <div className="flex items-center gap-2">
          {/* Avatar e nome do usuário logado */}
          <img
            src={
              user?.avatar
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/uploads/${user.avatar}`
                : "/placeholder-user.jpg"
            }
            alt={user?.name || "Avatar"}
            className="w-14 h-14 rounded-full object-cover border"
          />
          <div>
            <p className="text-sm font-bold">{user?.name|| "Usuário"}</p >
            <p className="text-xs text-muted-foreground">{user?.role}</p>
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
