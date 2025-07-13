"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, AlertCircle, Calendar, CreditCard, Users, CheckCircle, Trash2, RefreshCw } from "lucide-react"
import { 
  useGetNotifications, 
  useGetNotificationStats,
  useMarkAsRead, 
  useMarkAllAsRead,
  useDeleteNotification,
  type Notification,
  type NotificationType
} from "@/lib/notificationService"

export function NotificationsSection() {
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all")
  const [readFilter, setReadFilter] = useState<"all" | "read" | "unread">("all")

  const { data: notificationsData, isLoading, refetch } = useGetNotifications({
    type: typeFilter === "all" ? undefined : typeFilter,
    isRead: readFilter === "all" ? undefined : readFilter === "read"
  })

  console.log(notificationsData)
  const { data: stats } = useGetNotificationStats()
  console.log(stats)

  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()

  const notifications = notificationsData?.notifications || []

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync(id)
    } catch (error) {
      console.error("Erro ao marcar como lida:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync()
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification.mutateAsync(id)
    } catch (error) {
      console.error("Erro ao deletar notificação:", error)
    }
  }



  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PAYMENT_DUE":
      case "PAYMENT_OVERDUE":
        return <CreditCard className="h-4 w-4 text-red-600" />
      case "APPOINTMENT_REMINDER":
        return <Calendar className="h-4 w-4 text-blue-600" />
      case "BIRTHDAY":
        return <Users className="h-4 w-4 text-purple-600" />
      case "PLAN_EXPIRING":
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case "GENERAL":
        return <Bell className="h-4 w-4 text-green-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (type: string) => {
    switch (type) {
      case "PAYMENT_OVERDUE":
        return "destructive"
      case "PAYMENT_DUE":
      case "APPOINTMENT_REMINDER":
        return "outline"
      case "BIRTHDAY":
      case "GENERAL":
        return "secondary"
      case "PLAN_EXPIRING":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getPriorityText = (type: string) => {
    switch (type) {
      case "PAYMENT_OVERDUE":
        return "Alta"
      case "PAYMENT_DUE":
      case "APPOINTMENT_REMINDER":
        return "Média"
      case "BIRTHDAY":
      case "GENERAL":
        return "Baixa"
      case "PLAN_EXPIRING":
        return "Média"
      default:
        return "Baixa"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "PAYMENT_DUE":
        return "Pagamento Pendente"
      case "PAYMENT_OVERDUE":
        return "Pagamento Atrasado"
      case "APPOINTMENT_REMINDER":
        return "Lembrete de Agendamento"
      case "BIRTHDAY":
        return "Aniversário"
      case "PLAN_EXPIRING":
        return "Plano Vencendo"
      case "GENERAL":
        return "Geral"
      default:
        return type
    }
  }

  if (isLoading) {
    return <div>Carregando notificações...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">Central de alertas e lembretes</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            onClick={handleMarkAllAsRead} 
            disabled={stats?.unread === 0 || markAllAsRead.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar Todas como Lidas
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as NotificationType | "all")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="PAYMENT_DUE">Pagamento Pendente</SelectItem>
            <SelectItem value="PAYMENT_OVERDUE">Pagamento Atrasado</SelectItem>
            <SelectItem value="APPOINTMENT_REMINDER">Lembrete de Agendamento</SelectItem>
            <SelectItem value="BIRTHDAY">Aniversário</SelectItem>
            <SelectItem value="PLAN_EXPIRING">Plano Vencendo</SelectItem>
            <SelectItem value="GENERAL">Geral</SelectItem>
          </SelectContent>
        </Select>

        <Select value={readFilter} onValueChange={(value) => setReadFilter(value as "all" | "read" | "unread")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="unread">Não lidas</SelectItem>
            <SelectItem value="read">Lidas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Info sobre notificações automáticas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Notificações Automáticas</h3>
        </div>
        <p className="text-sm text-blue-700">
          O sistema gera notificações automaticamente todos os dias às 9:00 AM para:
        </p>
        <ul className="text-sm text-blue-700 mt-2 space-y-1">
          <li>• Pagamentos em atraso</li>
          <li>• Pagamentos próximos do vencimento (3 dias)</li>
          <li>• Aniversários dos alunos</li>
        </ul>
        <p className="text-xs text-blue-600 mt-2">
          Verificações adicionais são executadas a cada 6 horas para pagamentos em atraso.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unread || 0}</div>
            <p className="text-xs text-muted-foreground">Notificações pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.urgent || 0}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção imediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Total de notificações</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification: Notification) => (
          <Card
            key={notification.id}
            className={`${!notification.isRead ? "border-l-4 border-l-blue-500 bg-blue-50/50" : ""}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">{getTypeIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${!notification.isRead ? "text-blue-900" : ""}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(notification.createdAt).toLocaleString("pt-BR")}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {getTypeText(notification.type)}
                      </span>
                      {notification.student && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {notification.student.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getPriorityColor(notification.type)}>
                    {getPriorityText(notification.type)}
                  </Badge>
                  {!notification.isRead && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={markAsRead.isPending}
                    >
                      Marcar como Lida
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(notification.id)}
                    disabled={deleteNotification.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
              <p className="text-muted-foreground">Você está em dia! Não há notificações pendentes.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
