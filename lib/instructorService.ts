import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/axios"
import { toast } from "sonner"

export interface Instructor {
  id: string
  name: string
  email: string
  role: "ADMIN" | "MANAGER" | "INSTRUCTOR"
  createdAt: string
  updatedAt: string
  avatar?: string
}

export interface CreateInstructorData {
  name: string
  email: string
  password: string
  role: "ADMIN" | "MANAGER" | "INSTRUCTOR"
  avatar?: string
}

export interface UpdateInstructorData {
  name?: string
  email?: string
  password?: string
  role?: "ADMIN" | "MANAGER" | "INSTRUCTOR"
  avatar?: string
}

// Get all instructors
export function useGetInstructors() {
  return useQuery({
    queryKey: ["instructors"],
    queryFn: async () => {
      const { data } = await api.get("/users/instructors")
      console.log("esds", data)
      return data as Instructor[]
    },
  })
}

// Create instructor
export function useCreateInstructor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateInstructorData) => {
      const { data: response } = await api.post("/users", data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructors"] })
      toast.success("Instrutor criado com sucesso!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao criar instrutor")
    },
  })
}

// Update instructor
export function useUpdateInstructor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateInstructorData }) => {
      const { data: response } = await api.put(`/users/${id}`, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructors"] })
      toast.success("Instrutor atualizado com sucesso!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao atualizar instrutor")
    },
  })
}

// Delete instructor
export function useDeleteInstructor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/users/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructors"] })
      toast.success("Instrutor removido com sucesso!")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao remover instrutor")
    },
  })
}

// Get instructor by ID
export function useGetInstructor(id: string) {
  return useQuery({
    queryKey: ["instructor", id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}`)
      return data as Instructor
    },
    enabled: !!id,
  })
}

// Get instructor statistics
export function useGetInstructorStats(id: string) {
  return useQuery({
    queryKey: ["instructor-stats", id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}/stats`)
      return data
    },
    enabled: !!id,
  })
} 