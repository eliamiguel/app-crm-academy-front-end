"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { WorkoutPlansSection } from "@/components/workout-plans-section"
import { getAuthState } from "@/lib/auth"

export default function WorkoutPlansPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const authState = getAuthState()
      
      if (!authState.isAuthenticated) {
        router.push("/login")
        return
      }
      
      if (authState.token) {
        try {
          const payload = JSON.parse(atob(authState.token.split(".")[1]))
          const isExpired = payload.exp * 1000 < Date.now()
          
          if (isExpired) {
            router.push("/login")
            return
          }
        } catch (error) {
          router.push("/login")
          return
        }
      }
      
      setIsAuthenticated(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <WorkoutPlansSection />
        </main>
      </div>
    </SidebarProvider>
  )
} 