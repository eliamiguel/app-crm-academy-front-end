import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, TrendingUp, AlertCircle, DollarSign, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useGetDashboardOverview, useGetRecentActivities, useGetUpcomingPayments } from "@/lib/dashbordService"

export function Dashboard() {
  const { data: overviewData, isLoading: overviewLoading, error: overviewError, isError: overviewIsError } = useGetDashboardOverview()
  const { data: recentActivitiesData, isLoading: activitiesLoading } = useGetRecentActivities(5)
  const { data: upcomingPaymentsData, isLoading: paymentsLoading } = useGetUpcomingPayments(5)

  if (overviewLoading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
  
  if (overviewIsError) return <div>Erro ao carregar dados: {overviewError?.message}</div>

  const stats = [
    {
      title: "Total de Alunos",
      value: overviewData?.students.total || 0,
      description: "+12% em relação ao mês passado",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Receita Mensal",
      value: `R$ ${Number(overviewData?.revenue.total || 0).toFixed(2)}`,
      description: "+8% em relação ao mês passado",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Aulas Agendadas",
      value: overviewData?.appointments.thisWeek || 0,
      description: "Para esta semana",
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      title: "Frequência Média",
      value: `${((overviewData?.appointments.thisWeek || 0) / Math.max(overviewData?.students.active || 1, 1)).toFixed(1)} aulas/aluno`,
      description: "Com base em alunos ativos",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  // Função para formatar tempo relativo
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`
    } else if (diffInMinutes < 1440) { // 24 horas
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hora${hours > 1 ? 's' : ''} atrás`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} dia${days > 1 ? 's' : ''} atrás`
    }
  }

  // Função para mapear tipo de atividade para badge
  const getActivityBadgeVariant = (type: string, status: string) => {
    if (type === "payment") {
      return status === "PAID" ? "default" : status === "OVERDUE" ? "destructive" : "secondary"
    } else if (type === "appointment") {
      return "secondary"
    } else {
      return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua academia</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas atividades dos alunos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activitiesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : recentActivitiesData && recentActivitiesData.length > 0 ? (
                recentActivitiesData.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {activity.description.split(' - ')[0]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={getActivityBadgeVariant(activity.type, activity.status)}>
                        {formatRelativeTime(activity.createdAt)}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Nenhuma atividade recente encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Pagamentos Próximos
            </CardTitle>
            <CardDescription>Mensalidades com vencimento próximo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : upcomingPaymentsData && upcomingPaymentsData.length > 0 ? (
                upcomingPaymentsData.map((payment, index) => (
                  <div key={payment.id || index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{payment.student}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {payment.amount.toFixed(2)}
                      </p>
                    </div>
                    <Badge variant={payment.diffDays === 0 ? "destructive" : payment.diffDays === 1 ? "secondary" : "outline"}>
                      {payment.dueDateText}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Nenhum pagamento próximo encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
