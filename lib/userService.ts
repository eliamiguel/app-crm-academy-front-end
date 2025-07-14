import { useQuery } from "@tanstack/react-query"
import api from "@/axios"

type User = {
  id: string
  name: string
  email: string
  role: "ADMIN" | "MANAGER" | "INSTRUCTOR"
}

export function useGetInstructors() {
  return useQuery({
    queryKey: ["instructors"],
    queryFn: async () => {
      const { data } = await api.get("/users/instructors")
      console.log(data)
      return data as User[]
    },
  })
} 