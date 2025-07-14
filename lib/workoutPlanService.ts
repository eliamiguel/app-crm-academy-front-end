import api from "@/axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Tipos
export interface IExercise {
  id: string
  name: string
  sets: number
  reps: string
  weight?: string
  restTime?: number
  instructions?: string
  order: number
}

export interface IWorkoutPlan {
  id: string
  name: string
  description?: string
  startDate: string
  endDate?: string
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED"
  notes?: string
  student: {
    id: string
    name: string
    email: string
  }
  instructor: {
    id: string
    name: string
    email: string
  }
  exercises: IExercise[]
  createdAt: string
  updatedAt: string
}

export interface ICreateWorkoutPlanData {
  name: string
  description?: string
  studentId: string
  instructorId: string
  exercises: {
    name: string
    sets: number
    reps: string
    weight?: string
    restTime?: string
    notes?: string
  }[]
}

export interface IUpdateWorkoutPlanData {
  name?: string
  description?: string
  studentId?: string
  instructorId?: string
  exercises?: {
    name: string
    sets: number
    reps: string
    weight?: string
    restTime?: string
    notes?: string
  }[]
}

// Serviços da API
export const workoutPlanService = {
  async getAll(params?: { 
    page?: number
    limit?: number
    status?: string
    studentId?: string
    instructorId?: string
  }) {
    const response = await api.get<{
      workoutPlans: IWorkoutPlan[]
      pagination: {
        page: number
        limit: number
        total: number
        pages: number
      }
    }>("/workout-plans", { params })
    return response.data
  },

  async getById(id: string) {
    const response = await api.get<IWorkoutPlan>(`/workout-plans/${id}`)
    return response.data
  },

  async create(data: ICreateWorkoutPlanData) {
    const response = await api.post<{ workoutPlan: IWorkoutPlan }>("/workout-plans", data)
    return response.data.workoutPlan
  },

  async update(id: string, data: IUpdateWorkoutPlanData) {
    const response = await api.patch<{ workoutPlan: IWorkoutPlan }>(`/workout-plans/${id}`, data)
    return response.data.workoutPlan
  },

  async delete(id: string) {
    await api.delete(`/workout-plans/${id}`)
  },

  async toggleActive(id: string) {
    const response = await api.patch<{ workoutPlan: IWorkoutPlan }>(`/workout-plans/${id}/toggle-active`)
    return response.data.workoutPlan
  },

  async copy(id: string, data: { studentId: string; name: string }) {
    const response = await api.post<{ workoutPlan: IWorkoutPlan }>(`/workout-plans/${id}/copy`, data)
    return response.data.workoutPlan
  }
}

// Hooks React Query
export const useGetWorkoutPlans = (params?: { 
  page?: number
  limit?: number
  status?: string
  studentId?: string
  instructorId?: string
}) => {
  return useQuery({
    queryKey: ["workout-plans", params],
    queryFn: () => workoutPlanService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export const useGetWorkoutPlanById = (id: string) => {
  return useQuery({
    queryKey: ["workout-plan", id],
    queryFn: () => workoutPlanService.getById(id),
    enabled: !!id,
  })
}

export const useCreateWorkoutPlan = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: workoutPlanService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] })
      toast.success("Plano de treino criado com sucesso!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao criar plano de treino")
    }
  })
}

export const useUpdateWorkoutPlan = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateWorkoutPlanData }) => 
      workoutPlanService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] })
      toast.success("Plano de treino atualizado com sucesso!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar plano de treino")
    }
  })
}

export const useDeleteWorkoutPlan = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: workoutPlanService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] })
      toast.success("Plano de treino excluído com sucesso!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao excluir plano de treino")
    }
  })
}

export const useToggleWorkoutPlan = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: workoutPlanService.toggleActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] })
      toast.success("Status do plano de treino atualizado com sucesso!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar status do plano de treino")
    }
  })
}

export const useCopyWorkoutPlan = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { studentId: string; name: string } }) => 
      workoutPlanService.copy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] })
      toast.success("Plano de treino copiado com sucesso!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao copiar plano de treino")
    }
  })
} 