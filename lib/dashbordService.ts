import { useQuery } from "@tanstack/react-query"
import api from "../axios"


export const useGetDashboardOverview  = () => {
    const { data, isLoading, isError, error, refetch } = useQuery<any>({
        queryKey: ['dashboard-overview'],
        queryFn: async () => await api.get('/dashboard/overview')
        .then((res)=>{
          return res.data || [];
        })
      });
    
      return { data, isLoading, isError, error, refetch };
  };