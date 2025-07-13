import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "../axios"
import { toast } from "sonner"
import { AxiosError } from "axios"
import { Student } from "@/styles";



export const useGetStudents  = () => {
    const { data, isLoading, isError, error, refetch } = useQuery<Student[]>({
        queryKey: ['students'],
        queryFn: async () => await api.get('/students')
        .then((res)=>{
          return res.data.students || [];
        })
      });
    
      return { data, isLoading, isError, error, refetch };
  };
  export const useCreateStudent = ()=>{
    const queryClient = useQueryClient();
    
    const mutate = useMutation({
      mutationFn: async (data: { 
        id?: string;
        name: string;
        email: string;
        phone: string;
        dateOfBirth: string;
        gender: string;
        address: string;
        emergencyContact?: string;
        emergencyPhone?: string;
        medicalRestrictions?: string;
        objectives?: string;
      }) => {
        console.log("data do aluno", data)
            return await api.post(`/students`, data).then((res) => {
          return res.data;
        });
      },
      onSuccess: (data) => {
        if (data.sucesso) {
          toast.success(data.mensagem || "Aluno criado com sucesso.");
          queryClient.invalidateQueries({ queryKey: ["students"] });
        } else {
          toast.error(data.mensagem || "Erro ao criar aluno.");
        }
      },
      onError: (error: AxiosError<{ mensagem: string }>) => {
        const errorMessage = error.response?.data?.mensagem || "Erro ao criar aluno.";
        toast.error(errorMessage);
      },
    });
    
      return mutate;
  }

  export const useUpdateStudent = () => {
    const queryClient = useQueryClient();
    
    const mutate = useMutation({
      mutationFn: async (data: { 
        id: string;
        name: string;
        email: string;
        phone: string;
        dateOfBirth: string;
        gender: string;
        address: string;
        emergencyContact?: string;
        emergencyPhone?: string;
        medicalRestrictions?: string;
        objectives?: string;
      }) => {
        return await api.put(`/students/${data.id}`, data).then((res) => {
          return res.data;
        });
      },
      onSuccess: (data) => {
        if (data.sucesso) {
          toast.success(data.mensagem || "Aluno atualizado com sucesso.");
          queryClient.invalidateQueries({ queryKey: ["students"] });
        } else {
          toast.error(data.mensagem || "Erro ao atualizar aluno.");
        }
      },
      onError: (error: AxiosError<{ mensagem: string }>) => {
        const errorMessage = error.response?.data?.mensagem || "Erro ao atualizar aluno.";
        toast.error(errorMessage);
      },
    });
    
    return mutate;
  }

  export const useGetStudent = (id: string) => {
    const { data, isLoading, isError, error } = useQuery<Student>({
      queryKey: ['student', id],
      queryFn: async () => {
        const response = await api.get(`/students/${id}`);
        if (!response.data || !response.data.student) {
          throw new Error('Aluno não encontrado');
        }
        return response.data.student;
      },
      enabled: !!id,
      retry: 1,
    });

    return { data, isLoading, isError, error };
  };
     