import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../axios"

export interface ProgressRecord {
  id: string
  studentId: string
  weight?: number
  bodyFat?: number
  muscleMass?: number
  chest?: number
  waist?: number
  hip?: number
  thigh?: number
  arm?: number
  photos?: string[]
  notes?: string
  recordDate: string
  createdAt: string
  updatedAt: string
  student: {
    id: string
    name: string
    email: string
  }
}

export interface CreateProgressRecord {
  studentId: string
  weight?: number
  bodyFat?: number
  muscleMass?: number
  chest?: number
  waist?: number
  hip?: number
  thigh?: number
  arm?: number
  photos?: string[]
  notes?: string
}

export interface UpdateProgressRecord extends Partial<CreateProgressRecord> {
  id: string
}

export interface ProgressFilters {
  studentId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export const progressService = {
  async getAll(filters?: ProgressFilters) {
    const params = new URLSearchParams()
    if (filters?.studentId) params.append("studentId", filters.studentId)
    if (filters?.startDate) params.append("startDate", filters.startDate)
    if (filters?.endDate) params.append("endDate", filters.endDate)
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())

    const response = await api.get(`/progress?${params.toString()}`)
    return response.data
  },

  async getById(id: string) {
    const response = await api.get(`/progress/${id}`)
    return response.data
  },

  async create(data: CreateProgressRecord) {
    const response = await api.post("/progress", data)
    return response.data
  },

  async update(id: string, data: Partial<CreateProgressRecord>) {
    const response = await api.put(`/progress/${id}`, data)
    return response.data
  },

  async delete(id: string) {
    const response = await api.delete(`/progress/${id}`)
    return response.data
  },

  async getStudentHistory(studentId: string) {
    const response = await api.get(`/progress/student/${studentId}/history`)
    return response.data
  },
}

// React Query hooks
export const useGetProgressRecords = (filters?: ProgressFilters) => {
  return useQuery({
    queryKey: ["progressRecords", filters],
    queryFn: () => progressService.getAll(filters),
  })
}

export const useGetProgressRecord = (id: string) => {
  return useQuery({
    queryKey: ["progressRecord", id],
    queryFn: () => progressService.getById(id),
    enabled: !!id,
  })
}

export const useCreateProgressRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: progressService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progressRecords"] })
    },
  })
}

export const useUpdateProgressRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProgressRecord> }) =>
      progressService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progressRecords"] })
      queryClient.invalidateQueries({ queryKey: ["progressRecord"] })
    },
  })
}

export const useDeleteProgressRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: progressService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progressRecords"] })
    },
  })
}

export const useGetStudentHistory = (studentId: string) => {
  return useQuery({
    queryKey: ["studentHistory", studentId],
    queryFn: () => progressService.getStudentHistory(studentId),
    enabled: !!studentId,
  })
} 