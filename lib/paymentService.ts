import api from "@/axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Tipos
export interface IPayment {
  id: string
  amount: number
  dueDate: string
  paidDate?: string
  status: "PAID" | "PENDING" | "OVERDUE"
  description?: string
  method?: "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "PIX"
  studentId: string
  student: {
    id: string
    name: string
    email: string
    phone?: string
  }
  createdAt: string
  updatedAt: string
}

export interface IPaymentStats {
  revenue: {
    total: number
    pending: number
    overdue: number
  }
  payments: {
    total: number
    paid: number
    pending: number
    overdue: number
  }
}

export interface ICreatePaymentData {
  studentId: string
  amount: number
  dueDate: string
  description?: string
  type: "MONTHLY" | "ANNUAL" | "REGISTRATION" | "OTHER"
}

export interface IUpdatePaymentData {
  amount?: number
  dueDate?: string
  status?: "PAID" | "PENDING" | "OVERDUE"
  description?: string
  method?: "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "PIX"
  paidAt?: string
}

// Serviços da API
export const paymentService = {
  async getAll(params?: { 
    page?: number
    limit?: number
    status?: string
    studentId?: string
    startDate?: string
    endDate?: string
  }) {
    const response = await api.get<{
      payments: IPayment[]
      pagination: {
        page: number
        limit: number
        total: number
        pages: number
      }
    }>("/payments", { params })
    return response.data
  },

  async getById(id: string) {
    const response = await api.get<IPayment>(`/payments/${id}`)
    return response.data
  },

  async create(data: ICreatePaymentData) {
    const response = await api.post<{ payment: IPayment }>("/payments", data)
    return response.data.payment
  },

  async update(id: string, data: IUpdatePaymentData) {
    const response = await api.patch<{ payment: IPayment }>(`/payments/${id}`, data)
    return response.data.payment
  },

  async delete(id: string) {
    await api.delete(`/payments/${id}`)
  },

  async getStats(params?: { startDate?: string; endDate?: string }) {
    const response = await api.get<IPaymentStats>("/payments/stats/overview", { params })
    return response.data
  },

  async markOverdue() {
    const response = await api.post<{ count: number }>("/payments/mark-overdue")
    return response.data
  }
}

// Hooks React Query
export const useGetPayments = (params?: { 
  page?: number
  limit?: number
  status?: string
  studentId?: string
  startDate?: string
  endDate?: string
}) => {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => paymentService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export const useGetPaymentById = (id: string) => {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => paymentService.getById(id),
    enabled: !!id,
  })
}

export const useCreatePayment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: paymentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      queryClient.invalidateQueries({ queryKey: ["payment-stats"] })
    },
  })
}

export const useUpdatePayment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdatePaymentData }) => 
      paymentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      queryClient.invalidateQueries({ queryKey: ["payment-stats"] })
    },
  })
}

export const useDeletePayment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: paymentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      queryClient.invalidateQueries({ queryKey: ["payment-stats"] })
    },
  })
}

export const usePaymentStats = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ["payment-stats", params],
    queryFn: () => paymentService.getStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export const useMarkOverdue = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: paymentService.markOverdue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      queryClient.invalidateQueries({ queryKey: ["payment-stats"] })
    },
  })
} 