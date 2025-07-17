import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/axios"
import { toast } from "sonner"
import { AxiosError } from "axios"

type Appointment = {
  id: string
  title: string
  startTime: string
  endTime: string
  type: "PERSONAL_TRAINING" | "GROUP_CLASS" | "EVALUATION" | "CONSULTATION"
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
  notes?: string
  student: {
    id: string
    name: string
    email: string
    phone?: string
  }
  instructor: {
    id: string
    name: string
    email: string
  }
}

type CreateAppointmentData = {
  title: string
  studentId: string
  instructorId: string
  type: "PERSONAL_TRAINING" | "GROUP_CLASS" | "EVALUATION" | "CONSULTATION"
  startTime: string
  endTime: string
  notes?: string
}

type UpdateAppointmentData = Partial<CreateAppointmentData> & {
  status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
}

export function useGetAppointments(params?: {
  page?: number
  limit?: number
  status?: string
  type?: string
  studentId?: string
  instructorId?: string
  startDate?: string
  endDate?: string
}) {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: async () => {
      try {
    
        const token = localStorage.getItem("token")
        
        const { data } = await api.get("/appointments", { params })
    
      
        if (!data || !data.appointments) {
          return { appointments: [] }
        }
        
        return data
      } catch (error) {
        console.error("❌ Erro ao buscar agendamentos:", error)
       
        return { appointments: [] }
      }
    },
    // Atualizar automaticamente a cada 30 segundos
    refetchInterval: 30000,
    // Manter dados anteriores enquanto carrega novos
    staleTime: 5000,
  })
}

function formatDateToISO(dateString: string) {
  // Converte a string do formato "YYYY-MM-DDTHH:mm" para um objeto Date
  const date = new Date(dateString)
  
  // Ajusta o fuso horário para UTC
  const utcDate = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes()
  )
  
  return utcDate.toISOString()
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateAppointmentData) => {
      // Formata as datas para o formato ISO 8601 com fuso horário correto
      const formattedData = {
        ...data,
        startTime: formatDateToISO(data.startTime),
        endTime: formatDateToISO(data.endTime),
      }
      
      console.log("Dados formatados:", formattedData) // Debug
      
      const response = await api.post("/appointments", formattedData)
      return response.data
    },
    onSuccess: (data) => {
      if (data.appointment && data.message) {
        toast.success("Agendamento criado com sucesso.")
        queryClient.invalidateQueries({ queryKey: ["appointments"] })
      } else {
        toast.error("Erro ao criar agendamento.")
      }
    },
    onError: (error: AxiosError<{ mensagem: string }>) => {
      const errorMessage = error.response?.data?.mensagem || "Erro ao criar agendamento."
      toast.error(errorMessage)
    }
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateAppointmentData & { id: string }) => {
      // Formata as datas para o formato ISO 8601 com fuso horário correto
      const formattedData = {
        ...data,
        startTime: data.startTime ? formatDateToISO(data.startTime) : undefined,
        endTime: data.endTime ? formatDateToISO(data.endTime) : undefined,
      }
      
      console.log("Dados formatados:", formattedData) // Debug
      
      const response = await api.put(`/appointments/${id}`, formattedData)
      return response.data
    },
    onSuccess: (data) => {
      if (data.appointment && data.message) {
        toast.success("Agendamento atualizado com sucesso.")
        queryClient.invalidateQueries({ queryKey: ["appointments"] })
      } else {
        toast.error("Erro ao atualizar agendamento.")
      }
    },
  })
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/appointments/${id}`)
      return response.data
    },
    onSuccess: (data) => {
      if (data.appointment && data.message) {
        toast.success("Agendamento deletado com sucesso.")
        queryClient.invalidateQueries({ queryKey: ["appointments"] })
      } else {
        toast.error("Erro ao deletar agendamento.")
      }
    },
    onError: (error: AxiosError<{ mensagem: string }>) => {
      const errorMessage = error.response?.data?.mensagem || "Erro ao deletar agendamento."
      toast.error(errorMessage)
    }
  })
}

export function useGetInstructorAvailability(instructorId: string, date: string) {
  return useQuery({
    queryKey: ["instructor-availability", instructorId, date],
    queryFn: async () => {
      const { data } = await api.get(`/appointments/availability/${instructorId}`, {
        params: { date },
      })
      return data
    },
  })
} 

// Hook para buscar todos os agendamentos sem filtro de data
export function useGetAllAppointments() {
  return useQuery({
    queryKey: ["appointments", "all"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/appointments")
        console.log("Resposta da API appointments (todos):", data)
        return data
      } catch (error) {
        console.error("Erro ao buscar todos os agendamentos:", error)
        return { appointments: [] }
      }
    },
    refetchInterval: 30000,
    staleTime: 5000,
  })
} 