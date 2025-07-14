"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Dumbbell, Plus, Clock, Target, User, Edit, Eye, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { 
  useGetWorkoutPlans, 
  useCreateWorkoutPlan, 
  useUpdateWorkoutPlan, 
  useDeleteWorkoutPlan,
  useToggleWorkoutPlan,
  type IWorkoutPlan,
  type ICreateWorkoutPlanData,
  type IUpdateWorkoutPlanData
} from "@/lib/workoutPlanService"
import { useGetStudents } from "@/lib/studentsService"
import { useGetInstructors } from "@/lib/userService"

export function WorkoutPlansSection() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<IWorkoutPlan | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [createFormData, setCreateFormData] = useState<ICreateWorkoutPlanData>({
    name: "",
    description: "",
    studentId: "",
    instructorId: "",
    exercises: [],
  })
  const [editFormData, setEditFormData] = useState<IUpdateWorkoutPlanData & { exercises: NonNullable<IUpdateWorkoutPlanData['exercises']> }>({
    name: "",
    description: "",
    exercises: [],
  })

  // Hooks para dados do backend
  const { data: workoutPlansData, isLoading: workoutPlansLoading } = useGetWorkoutPlans()
  const { data: studentsData, isLoading: studentsLoading } = useGetStudents()
  const { data: instructorsData, isLoading: instructorsLoading } = useGetInstructors()
  const createWorkoutPlan = useCreateWorkoutPlan()
  const updateWorkoutPlan = useUpdateWorkoutPlan()
  const deleteWorkoutPlan = useDeleteWorkoutPlan()
  const toggleWorkoutPlan = useToggleWorkoutPlan()

  if (workoutPlansLoading || studentsLoading || instructorsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const workoutPlans = workoutPlansData?.workoutPlans || []
  const students = studentsData || []
  const instructors = instructorsData || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default"
      case "COMPLETED":
        return "success"
      case "PAUSED":
        return "outline"
      case "CANCELLED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Ativo"
      case "COMPLETED":
        return "Concluído"
      case "PAUSED":
        return "Pausado"
      case "CANCELLED":
        return "Cancelado"
      default:
        return status
    }
  }

  const handleCreatePlan = async () => {
    // Validar campos obrigatórios
    if (!createFormData.name || createFormData.name.trim().length < 2) {
      toast.error("O nome do plano deve ter pelo menos 2 caracteres")
      return
    }

    if (!createFormData.studentId) {
      toast.error("Selecione um aluno")
      return
    }

    if (!createFormData.instructorId) {
      toast.error("Selecione um instrutor")
      return
    }

    // Validar exercícios
    if (!createFormData.exercises || createFormData.exercises.length === 0) {
      toast.error("Adicione pelo menos um exercício")
      return
    }

    for (const exercise of createFormData.exercises) {
      if (!exercise.name || exercise.name.trim() === "") {
        toast.error("Todos os exercícios devem ter um nome")
        return
      }
      if (!exercise.sets || exercise.sets <= 0) {
        toast.error("Todos os exercícios devem ter pelo menos 1 série")
        return
      }
      if (!exercise.reps || exercise.reps.trim() === "") {
        toast.error("Todos os exercícios devem ter repetições definidas")
        return
      }
    }

    try {
      setIsCreating(true)
      await createWorkoutPlan.mutateAsync(createFormData)
      setIsCreateModalOpen(false)
      setCreateFormData({
        name: "",
        description: "",
        studentId: "",
        instructorId: "",
        exercises: [],
      })
    } catch (error) {
      console.error("Erro ao criar plano:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return

    // Validar campos obrigatórios
    if (!editFormData.name || editFormData.name.trim().length < 2) {
      toast.error("O nome do plano deve ter pelo menos 2 caracteres")
      return
    }

    // Validar exercícios
    for (const exercise of editFormData.exercises) {
      if (!exercise.name || exercise.name.trim() === "") {
        toast.error("Todos os exercícios devem ter um nome")
        return
      }
      if (!exercise.sets || exercise.sets <= 0) {
        toast.error("Todos os exercícios devem ter pelo menos 1 série")
        return
      }
      if (!exercise.reps || exercise.reps.trim() === "") {
        toast.error("Todos os exercícios devem ter repetições definidas")
        return
      }
    }

    try {
      setIsEditing(true)
      await updateWorkoutPlan.mutateAsync({
        id: selectedPlan.id,
        data: editFormData,
      })
      setIsDetailsModalOpen(false)
      setSelectedPlan(null)
      setEditFormData({
        name: "",
        description: "",
        exercises: [],
      })
    } catch (error) {
      console.error("Erro ao atualizar plano:", error)
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeletePlan = async (id: string) => {
    try {
      await deleteWorkoutPlan.mutateAsync(id)
    } catch (error) {
      console.error("Erro ao excluir plano:", error)
    }
  }

  const handleTogglePlan = async (id: string) => {
    try {
      setIsLoading(true)
      await toggleWorkoutPlan.mutateAsync(id)
    } catch (error) {
      console.error("Erro ao alterar status do plano:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const activePlans = workoutPlans.filter((plan) => plan.status === "ACTIVE").length
  const totalExercises = workoutPlans.reduce((sum, plan) => sum + plan.exercises.length, 0)
  const studentsWithPlan = new Set(workoutPlans.map((plan) => plan.student.id)).size

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Planos de Treino</h1>
          <p className="text-muted-foreground">Gerencie os treinos dos seus alunos</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
            <Dumbbell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePlans}</div>
            <p className="text-xs text-muted-foreground">Treinos em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Exercícios</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExercises}</div>
            <p className="text-xs text-muted-foreground">Exercícios cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos com Treino</CardTitle>
            <User className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsWithPlan}</div>
            <p className="text-xs text-muted-foreground">Alunos atendidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Workout Plans List */}
      <div className="grid gap-6">
        {workoutPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {plan.student.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {plan.description || "Sem descrição"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(plan.startDate).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(plan.status)}>{getStatusText(plan.status)}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <span className="text-sm font-medium">Instrutor:</span>
                    <span className="text-sm text-muted-foreground ml-2">{plan.instructor.name}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Exercícios:</span>
                    <span className="text-sm text-muted-foreground ml-2">{plan.exercises.length}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Criado em:</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {new Date(plan.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Última atualização:</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {new Date(plan.updatedAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                {/* Exercises Preview */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-3">Exercícios do Treino</h4>
                  <div className="space-y-2">
                    {plan.exercises.slice(0, 3).map((exercise) => (
                      <div key={exercise.id} className="flex justify-between items-center text-sm">
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-muted-foreground">
                          {exercise.sets} séries × {exercise.reps} reps
                        </span>
                      </div>
                    ))}
                    {plan.exercises.length > 3 && (
                      <div className="text-sm text-muted-foreground text-center pt-2">
                        +{plan.exercises.length - 3} exercícios adicionais
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedPlan(plan)
                    setEditFormData({
                      name: plan.name,
                      description: plan.description,
                      exercises: plan.exercises.map(e => ({
                        name: e.name,
                        sets: e.sets,
                        reps: e.reps,
                        weight: e.weight || "",
                        restTime: e.restTime?.toString() || "",
                        notes: e.instructions || "",
                      })),
                    })
                    setIsDetailsModalOpen(true)
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleTogglePlan(plan.id)}>
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : plan.status === "ACTIVE" ? "Pausar" : "Ativar"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeletePlan(plan.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Criar Novo Plano de Treino</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Plano</Label>
              <Input
                id="name"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                placeholder="Ex: Treino de Hipertrofia - Membros Superiores"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={createFormData.description}
                onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                placeholder="Descreva o objetivo e características do treino"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Aluno</Label>
                <Select value={createFormData.studentId} onValueChange={(value) => setCreateFormData({ ...createFormData, studentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructorId">Instrutor</Label>
                <Select value={createFormData.instructorId} onValueChange={(value) => setCreateFormData({ ...createFormData, instructorId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um instrutor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors.map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {instructor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Exercícios</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {createFormData.exercises.length} exercício(s)
                  </span>
                  {createFormData.exercises.length > 5 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Muitos exercícios
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {createFormData.exercises.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum exercício adicionado ainda.</p>
                    <p className="text-sm">Clique em "Adicionar Exercício" para começar.</p>
                  </div>
                )}
                {createFormData.exercises.map((exercise, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50/50 relative">
                    <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <div className="space-y-2">
                      <Label>Nome do Exercício</Label>
                      <Input
                        value={exercise.name}
                        onChange={(e) => {
                          const newExercises = [...createFormData.exercises]
                          newExercises[index].name = e.target.value
                          setCreateFormData({ ...createFormData, exercises: newExercises })
                        }}
                        placeholder="Ex: Supino Reto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Séries</Label>
                      <Input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => {
                          const newExercises = [...createFormData.exercises]
                          newExercises[index].sets = Number(e.target.value)
                          setCreateFormData({ ...createFormData, exercises: newExercises })
                        }}
                        placeholder="Ex: 4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Repetições</Label>
                      <Input
                        value={exercise.reps}
                        onChange={(e) => {
                          const newExercises = [...createFormData.exercises]
                          newExercises[index].reps = e.target.value
                          setCreateFormData({ ...createFormData, exercises: newExercises })
                        }}
                        placeholder="Ex: 8-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Peso (opcional)</Label>
                      <Input
                        value={exercise.weight}
                        onChange={(e) => {
                          const newExercises = [...createFormData.exercises]
                          newExercises[index].weight = e.target.value
                          setCreateFormData({ ...createFormData, exercises: newExercises })
                        }}
                        placeholder="Ex: 80kg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descanso (segundos)</Label>
                      <Input
                        value={exercise.restTime}
                        onChange={(e) => {
                          const newExercises = [...createFormData.exercises]
                          newExercises[index].restTime = e.target.value
                          setCreateFormData({ ...createFormData, exercises: newExercises })
                        }}
                        placeholder="Ex: 90"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Observações</Label>
                      <Input
                        value={exercise.notes}
                        onChange={(e) => {
                          const newExercises = [...createFormData.exercises]
                          newExercises[index].notes = e.target.value
                          setCreateFormData({ ...createFormData, exercises: newExercises })
                        }}
                        placeholder="Ex: Controlar a descida"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          const newExercises = createFormData.exercises.filter((_, i) => i !== index)
                          setCreateFormData({ ...createFormData, exercises: newExercises })
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    className="w-full max-w-md"
                    onClick={() => {
                      setCreateFormData({
                        ...createFormData,
                        exercises: [
                          ...createFormData.exercises,
                          {
                            name: "",
                            sets: 0,
                            reps: "",
                            weight: "",
                            restTime: "",
                            notes: "",
                          },
                        ],
                      })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Exercício
                  </Button>
                </div>
              </div>
            </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 flex-shrink-0 pt-4 border-t bg-background">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePlan} disabled={isCreating}>
              {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Criar Plano
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details/Edit Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Detalhes do Plano de Treino</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Plano</Label>
              <Input
                id="name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Exercícios</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {editFormData.exercises.length} exercício(s)
                  </span>
                  {editFormData.exercises.length > 5 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Muitos exercícios
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {editFormData.exercises.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum exercício adicionado ainda.</p>
                    <p className="text-sm">Clique em "Adicionar Exercício" para começar.</p>
                  </div>
                )}
                {editFormData.exercises.map((exercise, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50/50 relative">
                    <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <div className="space-y-2">
                      <Label>Nome do Exercício</Label>
                      <Input
                        value={exercise.name}
                        onChange={(e) => {
                          const newExercises = [...editFormData.exercises]
                          newExercises[index].name = e.target.value
                          setEditFormData({ ...editFormData, exercises: newExercises })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Séries</Label>
                      <Input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => {
                          const newExercises = [...editFormData.exercises]
                          newExercises[index].sets = Number(e.target.value)
                          setEditFormData({ ...editFormData, exercises: newExercises })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Repetições</Label>
                      <Input
                        value={exercise.reps}
                        onChange={(e) => {
                          const newExercises = [...editFormData.exercises]
                          newExercises[index].reps = e.target.value
                          setEditFormData({ ...editFormData, exercises: newExercises })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Peso (opcional)</Label>
                      <Input
                        value={exercise.weight}
                        onChange={(e) => {
                          const newExercises = [...editFormData.exercises]
                          newExercises[index].weight = e.target.value
                          setEditFormData({ ...editFormData, exercises: newExercises })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descanso (segundos)</Label>
                      <Input
                        value={exercise.restTime}
                        onChange={(e) => {
                          const newExercises = [...editFormData.exercises]
                          newExercises[index].restTime = e.target.value
                          setEditFormData({ ...editFormData, exercises: newExercises })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Observações</Label>
                      <Input
                        value={exercise.notes}
                        onChange={(e) => {
                          const newExercises = [...editFormData.exercises]
                          newExercises[index].notes = e.target.value
                          setEditFormData({ ...editFormData, exercises: newExercises })
                        }}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          const newExercises = editFormData.exercises.filter((_, i) => i !== index)
                          setEditFormData({ ...editFormData, exercises: newExercises })
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    className="w-full max-w-md"
                    onClick={() => {
                      setEditFormData({
                        ...editFormData,
                        exercises: [
                          ...editFormData.exercises,
                          {
                            name: "",
                            sets: 0,
                            reps: "",
                            weight: "",
                            restTime: "",
                            notes: "",
                          },
                        ],
                      })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Exercício
                  </Button>
                </div>
              </div>
            </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 flex-shrink-0 pt-4 border-t bg-background">
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePlan} disabled={isEditing}>
              {isEditing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
