import { useQuery } from "@tanstack/react-query"
import api from "../axios"

export interface DashboardOverview {
  students: {
    total: number
    active: number
    inactive: number
  }
  revenue: {
    total: number
    pendingPayments: number
  }
  appointments: {
    today: number
    thisWeek: number
  }
  notifications: {
    unread: number
  }
  progress: {
    recentRecords: number
  }
}

export interface RecentActivity {
  type: "payment" | "appointment" | "student"
  id: string
  description: string
  status: string
  createdAt: string
}

export interface UpcomingPayment {
  id: string
  student: string
  amount: number
  dueDate: string
  dueDateText: string
  diffDays: number
}

export const useGetDashboardOverview = () => {
  const { data, isLoading, isError, error, refetch } = useQuery<DashboardOverview>({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const response = await api.get('/dashboard/overview')
      return response.data
    }
  });

  return { data, isLoading, isError, error, refetch };
};

export const useGetRecentActivities = (limit: number = 10) => {
  const { data, isLoading, isError, error, refetch } = useQuery<RecentActivity[]>({
    queryKey: ['dashboard-recent-activities', limit],
    queryFn: async () => {
      const response = await api.get(`/dashboard/recent-activities?limit=${limit}`)
      return response.data
    }
  });

  return { data, isLoading, isError, error, refetch };
};

export const useGetUpcomingPayments = (limit: number = 10) => {
  const { data, isLoading, isError, error, refetch } = useQuery<UpcomingPayment[]>({
    queryKey: ['dashboard-upcoming-payments', limit],
    queryFn: async () => {
      const response = await api.get(`/dashboard/upcoming-payments?limit=${limit}`)
      return response.data
    }
  });

  return { data, isLoading, isError, error, refetch };
};