"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { getAuthState } from "@/lib/auth"
import { usePathname } from "next/navigation"

export function AppHeader() {
  const authState = getAuthState()
  const user = authState.user
  const pathname = usePathname()

  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "Dashboard"
      case "/students":
        return "Alunos"
      case "/instructors":
        return "Instrutores"
      case "/payments":
        return "Pagamentos"
      case "/schedule":
        return "Agendamentos"
      case "/progress":
        return "Evolução"
      case "/workout-plans":
        return "Planos de Treino"
      case "/notifications":
        return "Notificações"
      default:
        return "Gym CRM Academy"
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-background px-4 shadow-sm">
      <SidebarTrigger className="h-9 w-9" />
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium">{user?.name || "Usuário"}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <img
            src={
              user?.avatar
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') || 'http://localhost:8000'}/uploads/${user.avatar}`
                : "/placeholder-user.jpg"
            }
            alt={user?.name || "Avatar"}
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
          />
        </div>
      </div>
    </header>
  )
} 