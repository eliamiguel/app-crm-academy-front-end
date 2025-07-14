"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Calendar, AlertCircle, CheckCircle, Clock, Plus, Edit, Eye, Mail, Phone, Loader2 } from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { 
  useGetPayments, 
  useCreatePayment, 
  useUpdatePayment, 
  useDeletePayment, 
  usePaymentStats,
  useGetPaymentById,
  type IPayment 
} from "@/lib/paymentService"
import { useGetStudents } from "@/lib/studentsService"

export function PaymentsSection() {
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchStudent, setSearchStudent] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<IPayment | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const [createFormData, setCreateFormData] = useState({
    studentId: "",
    amount: "",
    dueDate: "",
    description: "",
    type: "MONTHLY" as const,
  })

  const [registerFormData, setRegisterFormData] = useState({
    method: "PIX" as const,
    notes: "",
  })

  // Hooks para dados do backend
  const { data: paymentsData, isLoading: paymentsLoading } = useGetPayments({
    status: filterStatus === "all" ? undefined : filterStatus,
    limit: 50,
  })
  const { data: studentsData, isLoading: studentsLoading } = useGetStudents()
  const { data: statsData, isLoading: statsLoading } = usePaymentStats()
  const createPaymentMutation = useCreatePayment()
  const updatePaymentMutation = useUpdatePayment()
  const deletePaymentMutation = useDeletePayment()

  if (paymentsLoading || studentsLoading || statsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const payments = paymentsData?.payments || []
  const students = studentsData || []
  const stats = statsData || { revenue: { total: 0, pending: 0, overdue: 0 }, payments: { total: 0, paid: 0, pending: 0, overdue: 0 } }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.student.name.toLowerCase().includes(searchStudent.toLowerCase())
    return matchesSearch
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "OVERDUE":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "success"
      case "PENDING":
        return "warning"
      case "OVERDUE":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return "Pago"
      case "PENDING":
        return "Pendente"
      case "OVERDUE":
        return "Vencido"
      default:
        return status
    }
  }

  const getMethodText = (method?: string) => {
    switch (method) {
      case "PIX":
        return "PIX"
      case "CREDIT_CARD":
        return "Cartão de Crédito"
      case "DEBIT_CARD":
        return "Cartão de Débito"
      case "BANK_TRANSFER":
        return "Transferência"
      case "CASH":
        return "Dinheiro"
      default:
        return "Não informado"
    }
  }

  const handleCreatePayment = async () => {
    if (!createFormData.studentId || !createFormData.amount || !createFormData.dueDate) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    try {
      setIsCreating(true)
      await createPaymentMutation.mutateAsync({
        studentId: createFormData.studentId,
        amount: parseFloat(createFormData.amount),
        dueDate: createFormData.dueDate,
        description: createFormData.description,
        type: createFormData.type,
      })
      toast.success("Pagamento criado com sucesso!")
      setIsCreateModalOpen(false)
      resetCreateForm()
    } catch (error) {
      toast.error("Erro ao criar pagamento")
    } finally {
      setIsCreating(false)
    }
  }

  const handleRegisterPayment = async () => {
    if (!selectedPayment) return

    try {
      setIsRegistering(true)
      await updatePaymentMutation.mutateAsync({
        id: selectedPayment.id,
        data: {
          status: "PAID",
          method: registerFormData.method,
          paidAt: new Date().toISOString(),
        },
      })
      toast.success("Pagamento registrado com sucesso!")
      setIsRegisterModalOpen(false)
      setSelectedPayment(null)
      resetRegisterForm()
    } catch (error) {
      toast.error("Erro ao registrar pagamento")
    } finally {
      setIsRegistering(false)
    }
  }

  const handleSendReminder = async (payment: IPayment) => {
    // Implementar envio de lembrete/cobrança
    toast.info(`Lembrete enviado para ${payment.student.name}`)
  }

  const resetCreateForm = () => {
    setCreateFormData({
      studentId: "",
      amount: "",
      dueDate: "",
      description: "",
      type: "MONTHLY" as const,
    })
  }

  const resetRegisterForm = () => {
    setRegisterFormData({
      method: "PIX",
      notes: "",
    })
  }

  const openDetailsModal = (payment: IPayment) => {
    setSelectedPayment(payment)
    setIsDetailsModalOpen(true)
  }

  const openRegisterModal = (payment: IPayment) => {
    setSelectedPayment(payment)
    setIsRegisterModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pagamentos</h1>
          <p className="text-muted-foreground">Controle de mensalidades e pagamentos</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Pagamento</DialogTitle>
              <DialogDescription>
                Crie um novo pagamento para um aluno
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Aluno</Label>
                <Select value={createFormData.studentId} onValueChange={(value) => setCreateFormData({ ...createFormData, studentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student: any) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={createFormData.amount}
                    onChange={(e) => setCreateFormData({ ...createFormData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={createFormData.dueDate}
                    onChange={(e) => setCreateFormData({ ...createFormData, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Pagamento</Label>
                <Select value={createFormData.type} onValueChange={(value: any) => setCreateFormData({ ...createFormData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensalidade</SelectItem>
                    <SelectItem value="ANNUAL">Anual</SelectItem>
                    <SelectItem value="REGISTRATION">Taxa de Matrícula</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  placeholder="Mensalidade, taxa de matrícula, etc."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePayment} disabled={!createFormData.studentId || !createFormData.amount || !createFormData.dueDate}>
                {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Criar Pagamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {stats.revenue.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Pagamentos recebidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {stats.revenue.pending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando pagamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {stats.revenue.overdue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Pagamentos em atraso</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="PAID">Pagos</SelectItem>
                <SelectItem value="PENDING">Pendentes</SelectItem>
                <SelectItem value="OVERDUE">Vencidos</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="Buscar por aluno..." 
              className="max-w-sm"
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="grid gap-4">
        {filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum pagamento encontrado</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{payment.student.name}</h3>
                      <p className="text-sm text-muted-foreground">{payment.description || "Mensalidade"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Vencimento: {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      {payment.paidDate && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-sm text-green-600">
                            Pago em: {new Date(payment.paidDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      )}
                      {payment.method && (
                        <p className="text-sm text-muted-foreground">
                          Método: {getMethodText(payment.method)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        R$ {payment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusIcon(payment.status)}
                        <Badge variant={getStatusColor(payment.status)}>
                          {getStatusText(payment.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {payment.status === "PENDING" && (
                        <Button size="sm" onClick={() => openRegisterModal(payment)}>
                          Registrar Pagamento
                        </Button>
                      )}
                      {payment.status === "OVERDUE" && (
                        <Button size="sm" variant="destructive" onClick={() => handleSendReminder(payment)}>
                          Cobrar
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openDetailsModal(payment)}>
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Pagamento</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Informações do Aluno</h4>
                  <p><strong>Nome:</strong> {selectedPayment.student.name}</p>
                  <p><strong>Email:</strong> {selectedPayment.student.email}</p>
                  {selectedPayment.student.phone && (
                    <p><strong>Telefone:</strong> {selectedPayment.student.phone}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Informações do Pagamento</h4>
                  <p><strong>Valor:</strong> R$ {selectedPayment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <p><strong>Status:</strong> {getStatusText(selectedPayment.status)}</p>
                  <p><strong>Vencimento:</strong> {new Date(selectedPayment.dueDate).toLocaleDateString("pt-BR")}</p>
                  {selectedPayment.paidDate && (
                    <p><strong>Data do Pagamento:</strong> {new Date(selectedPayment.paidDate).toLocaleDateString("pt-BR")}</p>
                  )}
                  {selectedPayment.method && (
                    <p><strong>Método:</strong> {getMethodText(selectedPayment.method)}</p>
                  )}
                </div>
              </div>
              {selectedPayment.description && (
                <div>
                  <h4 className="font-semibold mb-2">Descrição</h4>
                  <p>{selectedPayment.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Registro de Pagamento */}
      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Confirme o recebimento do pagamento de {selectedPayment?.student.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p><strong>Valor:</strong> R$ {selectedPayment?.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p><strong>Vencimento:</strong> {selectedPayment ? new Date(selectedPayment.dueDate).toLocaleDateString("pt-BR") : ""}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Método de Pagamento</Label>
              <Select value={registerFormData.method} onValueChange={(value: any) => setRegisterFormData({ ...registerFormData, method: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                  <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Transferência Bancária</SelectItem>
                  <SelectItem value="CASH">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={registerFormData.notes}
                onChange={(e) => setRegisterFormData({ ...registerFormData, notes: e.target.value })}
                placeholder="Observações sobre o pagamento..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsRegisterModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegisterPayment} disabled={isRegistering}>
              {isRegistering ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Confirmar Pagamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
