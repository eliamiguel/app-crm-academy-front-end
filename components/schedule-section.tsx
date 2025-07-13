"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Eye, CheckCircle, XCircle, Calendar as CalendarIcon } from "lucide-react"
import { format, addDays, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useGetAppointments, useGetAllAppointments, useCreateAppointment, useUpdateAppointment } from "@/lib/appointmentService"
import { useGetStudents } from "@/lib/studentsService"
import { useGetInstructors } from "@/lib/userService"
import { Appointment, IInstructor, IStudent } from "@/styles/styles"

export function ScheduleSection() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [formData, setFormData] = useState({
    title: "",
    studentId: "",
    instructorId: "",
    type: "PERSONAL_TRAINING" as "PERSONAL_TRAINING" | "GROUP_CLASS" | "EVALUATION" | "CONSULTATION",
    startTime: "",
    endTime: "",
    notes: "",
  })

  // Buscar agendamentos da semana inteira (3 dias antes e 3 dias depois da data selecionada)
  const startDate = subDays(selectedDate, 3)
  const endDate = addDays(selectedDate, 3)

  const { data: appointmentsData, isLoading } = useGetAppointments({
    startDate: format(startDate, "yyyy-MM-dd"),
    endDate: format(endDate, "yyyy-MM-dd"),
  })
  
  // Buscar todos os agendamentos como fallback
  const { data: allAppointmentsData, isLoading: isLoadingAll } = useGetAllAppointments()
  const { data: students } = useGetStudents()
  const { data: instructors } = useGetInstructors()
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()

  const handleOpenDialog = (appointment?: Appointment) => {
    if (appointment) {
      setSelectedAppointment(appointment)
      setFormData({
        title: appointment.title,
        studentId: appointment.student.id,
        instructorId: appointment.instructor.id,
        type: appointment.type,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        notes: appointment.notes || "",
      })
    } else {
      setSelectedAppointment(null)
      setFormData({
        title: "",
        studentId: "",
        instructorId: "",
        type: "PERSONAL_TRAINING",
        startTime: "",
        endTime: "",
        notes: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleOpenDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailsDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      // Validação dos campos obrigatórios
      if (!formData.title.trim()) {
        throw new Error("O título é obrigatório")
      }
      if (!formData.studentId) {
        throw new Error("Selecione um aluno")
      }
      if (!formData.instructorId) {
        throw new Error("Selecione um instrutor")
      }
      if (!formData.startTime) {
        throw new Error("Selecione o horário de início")
      }
      if (!formData.endTime) {
        throw new Error("Selecione o horário de fim")
      }

      // Validação das datas
      const startTime = new Date(formData.startTime)
      const endTime = new Date(formData.endTime)

      if (isNaN(startTime.getTime())) {
        throw new Error("Data de início inválida")
      }
      if (isNaN(endTime.getTime())) {
        throw new Error("Data de fim inválida")
      }
      if (endTime <= startTime) {
        throw new Error("O horário de fim deve ser maior que o horário de início")
      }

      console.log("Dados do formulário:", formData) // Debug

      if (selectedAppointment) {
        await updateAppointment.mutateAsync({
          id: selectedAppointment.id,
          ...formData,
        })
      } else {
        await createAppointment.mutateAsync(formData)
      }
      setIsDialogOpen(false)
      setFormData({
        title: "",
        studentId: "",
        instructorId: "",
        type: "PERSONAL_TRAINING",
        startTime: "",
        endTime: "",
        notes: "",
      })
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error)
      // Exibe o erro para o usuário
      alert(error instanceof Error ? error.message : "Erro ao salvar agendamento")
    }
  }

  const handleMarkStatus = async (appointmentId: string, status: "COMPLETED" | "NO_SHOW") => {
    try {
      await updateAppointment.mutateAsync({
        id: appointmentId,
        status,
      })
      setIsDetailsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "warning"
      case "COMPLETED":
        return "success"
      case "CANCELLED":
        return "destructive"
      case "NO_SHOW":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "Agendado"
      case "COMPLETED":
        return "Concluído"
      case "CANCELLED":
        return "Cancelado"
      case "NO_SHOW":
        return "Não Compareceu"
      default:
        return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "PERSONAL_TRAINING":
        return "Personal Training"
      case "GROUP_CLASS":
        return "Aula em Grupo"
      case "EVALUATION":
        return "Avaliação"
      case "CONSULTATION":
        return "Consulta"
      default:
        return type
    }
  }

  // Usar dados filtrados por data ou todos os agendamentos se não houver filtrados
  const rawAppointments = appointmentsData?.appointments?.length > 0 
    ? appointmentsData.appointments 
    : allAppointmentsData?.appointments || []

  const filteredAppointments = rawAppointments.filter(
    (appointment: Appointment) =>
      appointment.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading && isLoadingAll) {
    return <div>Carregando agendamentos...</div>
  }
  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie os agendamentos da academia ({filteredAppointments.length} encontrados)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedAppointment ? "Editar Agendamento" : "Novo Agendamento"}
              </DialogTitle>
              <DialogDescription>
                {selectedAppointment
                  ? "Atualize as informações do agendamento"
                  : "Preencha as informações para criar um novo agendamento"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Treino de Força"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "PERSONAL_TRAINING" | "GROUP_CLASS" | "EVALUATION" | "CONSULTATION") =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERSONAL_TRAINING">Personal Training</SelectItem>
                      <SelectItem value="GROUP_CLASS">Aula em Grupo</SelectItem>
                      <SelectItem value="EVALUATION">Avaliação</SelectItem>
                      <SelectItem value="CONSULTATION">Consulta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Horário Início</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Horário Fim</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Aluno</Label>
                  <Select
                    value={formData.studentId}
                    onValueChange={(value) => setFormData({ ...formData, studentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {students?.map((student: IStudent) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instrutor</Label>
                  <Select
                    value={formData.instructorId}
                    onValueChange={(value) => setFormData({ ...formData, instructorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o instrutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors?.map((instructor: IInstructor) => (
                        <SelectItem key={instructor.id} value={instructor.id}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Adicione observações importantes"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={
                  (selectedAppointment ? updateAppointment.isPending : createAppointment.isPending) ||
                  !formData.title ||
                  !formData.studentId ||
                  !formData.instructorId ||
                  !formData.startTime ||
                  !formData.endTime
                }
              >
                {selectedAppointment 
                  ? (updateAppointment.isPending ? "Salvando..." : "Salvar Alterações")
                  : (createAppointment.isPending ? "Criando..." : "Criar Agendamento")
                }
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar agendamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Período: {format(startDate, "dd/MM/yyyy")} a {format(endDate, "dd/MM/yyyy")}</p>
                <p>Total de agendamentos: {rawAppointments.length}</p>
                <p>Agendamentos exibidos: {filteredAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              locale={ptBR}
            />
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <div className="grid gap-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? `Não há agendamentos que correspondam à busca "${searchTerm}"`
                    : "Não há agendamentos para o período selecionado"}
                </p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Agendamento
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment: Appointment) => (
            <Card key={appointment.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <CalendarIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{appointment.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(appointment.startTime), "PPp", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Aluno: {appointment.student.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge variant={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getTypeText(appointment.type)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Instrutor: {appointment.instructor.name}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetails(appointment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(appointment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Título</h4>
                  <p>{selectedAppointment.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Status</h4>
                  <Badge variant={getStatusColor(selectedAppointment.status)}>
                    {getStatusText(selectedAppointment.status)}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Aluno</h4>
                  <p>{selectedAppointment.student.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.student.email}</p>
                  {selectedAppointment.student.phone && (
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.student.phone}
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">Instrutor</h4>
                  <p>{selectedAppointment.instructor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.instructor.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Início</h4>
                  <p>
                    {format(new Date(selectedAppointment.startTime), "PPp", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Fim</h4>
                  <p>
                    {format(new Date(selectedAppointment.endTime), "PPp", { locale: ptBR })}
                  </p>
                </div>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <h4 className="font-semibold">Observações</h4>
                  <p>{selectedAppointment.notes}</p>
                </div>
              )}
              {selectedAppointment.status === "SCHEDULED" && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleMarkStatus(selectedAppointment.id, "NO_SHOW")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Não Compareceu
                  </Button>
                  <Button onClick={() => handleMarkStatus(selectedAppointment.id, "COMPLETED")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar Presença
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
