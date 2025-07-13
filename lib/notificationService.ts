import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/axios"

export type NotificationType = "PAYMENT_DUE" | "PAYMENT_OVERDUE" | "APPOINTMENT_REMINDER" | "BIRTHDAY" | "PLAN_EXPIRING" | "GENERAL"

export type Notification = {
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
  updatedAt: string
  student?: {
    id: string
    name: string
    email: string
  }
}

export type NotificationStats = {
  total: number
  unread: number
  urgent: number
  byType: Record<string, number>
}

export function useGetNotifications(params?: {
  page?: number
  limit?: number
  type?: NotificationType
  isRead?: boolean
}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: async () => {
      const { data } = await api.get("/notifications", { params })
      return data
    },
  })
}

export function useGetNotificationStats() {
  return useQuery({
    queryKey: ["notification-stats"],
    queryFn: async () => {
      const { data } = await api.get("/notifications/stats")
      return data as NotificationStats
    },
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/notifications/${id}/read`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await api.patch("/notifications/read-all")
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] })
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/notifications/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] })
    },
  })
}

export function useCreatePaymentOverdueNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/notifications/payment-overdue")
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] })
    },
  })
}

export function useCreateBirthdayNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/notifications/birthday")
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] })
    },
  })
}

export function useCreatePaymentDueNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/notifications/payment-due")
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] })
    },
  })
} 