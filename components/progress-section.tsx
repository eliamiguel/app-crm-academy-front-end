"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TrendingUp, TrendingDown, Camera, Scale, Ruler, Plus, Edit, Eye, BarChart3, Upload, X, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  useGetProgressRecords, 
  useCreateProgressRecord, 
  useUpdateProgressRecord, 
  useDeleteProgressRecord,
  type ProgressRecord 
} from "@/lib/progressService"
import { useGetStudents } from "@/lib/studentsService"

export function ProgressSection() {
  const [selectedStudent, setSelectedStudent] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false)
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<ProgressRecord | null>(null)
  const [compareRecord1, setCompareRecord1] = useState<ProgressRecord | null>(null)
  const [compareRecord2, setCompareRecord2] = useState<ProgressRecord | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    studentId: "",
    weight: "",
    bodyFat: "",
    muscleMass: "",
    chest: "",
    waist: "",
    hip: "",
    arm: "",
    thigh: "",
    notes: "",
    photos: [] as string[],
  })

  // Hooks para dados do backend
  const { data: progressData, isLoading: progressLoading, error: progressError } = useGetProgressRecords()
  const { data: studentsData, isLoading: studentsLoading } = useGetStudents()
  const createProgressMutation = useCreateProgressRecord()
  const updateProgressMutation = useUpdateProgressRecord()
  const deleteProgressMutation = useDeleteProgressRecord()

  if (progressLoading || studentsLoading) return <div className="flex justify-center items-center h-64">Carregando...</div>
  if (progressError) return <div className="flex justify-center items-center h-64">Erro ao carregar dados</div>

  const progressRecords = progressData?.progressRecords || []
  const students = studentsData || []

  const filteredRecords = progressRecords.filter(
    (record: ProgressRecord) => selectedStudent === "all" || record.studentId === selectedStudent,
  )

  // Calcular estatísticas reais
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const recordsThisMonth = progressRecords.filter((record: ProgressRecord) => {
    const recordDate = new Date(record.recordDate)
    return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
  })

  const uniqueStudentsThisMonth = Array.from(new Set(recordsThisMonth.map((r: ProgressRecord) => r.studentId)))
  
  // Calcular média de progresso baseada na evolução de peso
  const calculateProgressRate = () => {
    const studentsWithMultipleRecords = students.filter((student: any) => {
      const studentRecords = progressRecords.filter((r: ProgressRecord) => r.studentId === student.id)
      return studentRecords.length >= 2
    })
    
    if (studentsWithMultipleRecords.length === 0) return 0
    
    const studentsWithProgress = studentsWithMultipleRecords.filter((student: any) => {
      const studentRecords = progressRecords
        .filter((r: ProgressRecord) => r.studentId === student.id)
        .sort((a: ProgressRecord, b: ProgressRecord) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime())
      
      if (studentRecords.length < 2) return false
      
      const firstRecord = studentRecords[0]
      const lastRecord = studentRecords[studentRecords.length - 1]
      
      // Considerar progresso positivo se houve perda de peso OU ganho de massa muscular
      const weightLoss = (firstRecord.weight || 0) > (lastRecord.weight || 0)
      const muscleGain = (firstRecord.muscleMass || 0) < (lastRecord.muscleMass || 0)
      
      return weightLoss || muscleGain
    })
    
    return Math.round((studentsWithProgress.length / studentsWithMultipleRecords.length) * 100)
  }

  const getWeightTrend = (studentId: string, currentWeight: number) => {
    const studentRecords = progressRecords
      .filter((r: ProgressRecord) => r.studentId === studentId)
      .sort((a: ProgressRecord, b: ProgressRecord) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime())
    
    if (studentRecords.length < 2) return { trend: "neutral", difference: 0 }
    
    const previousRecord = studentRecords[studentRecords.length - 2]
    const difference = currentWeight - (previousRecord.weight || 0)
    
    return {
      trend: difference > 0 ? "up" : difference < 0 ? "down" : "neutral",
      difference: Math.abs(difference)
    }
  }

  const handleCreateRecord = async () => {
    if (!formData.studentId || !formData.weight) {
      toast.error("Selecione um aluno e informe o peso")
      return
    }

    const data = {
      studentId: formData.studentId,
      weight: parseFloat(formData.weight),
      bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
      muscleMass: formData.muscleMass ? parseFloat(formData.muscleMass) : undefined,
      chest: formData.chest ? parseFloat(formData.chest) : undefined,
      waist: formData.waist ? parseFloat(formData.waist) : undefined,
      hip: formData.hip ? parseFloat(formData.hip) : undefined,
      arm: formData.arm ? parseFloat(formData.arm) : undefined,
      thigh: formData.thigh ? parseFloat(formData.thigh) : undefined,
      notes: formData.notes || undefined,
      photos: formData.photos,
    }

    try {
      setIsCreating(true)
      setIsEditing(true)
      await createProgressMutation.mutateAsync(data)
      toast.success("Registro criado com sucesso!")
      setIsCreateModalOpen(false)
      resetForm()
      setIsCreating(false)
      setIsEditing(false)
      } catch (error) {
      toast.error("Erro ao criar registro")
      setIsCreating(false)
    }
  }

  const handleEditRecord = async () => {
    if (!selectedRecord || !formData.weight) {
      toast.error("Informe o peso")
      return
    }

    const data = {
      weight: parseFloat(formData.weight),
      bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
      muscleMass: formData.muscleMass ? parseFloat(formData.muscleMass) : undefined,
      chest: formData.chest ? parseFloat(formData.chest) : undefined,
      waist: formData.waist ? parseFloat(formData.waist) : undefined,
      hip: formData.hip ? parseFloat(formData.hip) : undefined,
      arm: formData.arm ? parseFloat(formData.arm) : undefined,
      thigh: formData.thigh ? parseFloat(formData.thigh) : undefined,
      notes: formData.notes || undefined,
      photos: formData.photos,
    }

    try {
      await updateProgressMutation.mutateAsync({ id: selectedRecord.id, data })
      toast.success("Registro atualizado com sucesso!")
      setIsEditModalOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Erro ao atualizar registro")
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) {
      return
    }

    try {
      await deleteProgressMutation.mutateAsync(recordId)
      toast.success("Registro excluído com sucesso!")
    } catch (error) {
      toast.error("Erro ao excluir registro")
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: "",
      weight: "",
      bodyFat: "",
      muscleMass: "",
      chest: "",
      waist: "",
      hip: "",
      arm: "",
      thigh: "",
      notes: "",
      photos: [],
    })
    setSelectedRecord(null)
  }

  const openEditModal = (record: ProgressRecord) => {
    setSelectedRecord(record)
    setFormData({
      studentId: record.studentId,
      weight: record.weight?.toString() || "",
      bodyFat: record.bodyFat?.toString() || "",
      muscleMass: record.muscleMass?.toString() || "",
      chest: record.chest?.toString() || "",
      waist: record.waist?.toString() || "",
      hip: record.hip?.toString() || "",
      arm: record.arm?.toString() || "",
      thigh: record.thigh?.toString() || "",
      notes: record.notes || "",
      photos: record.photos || [],
    })
    setIsEditModalOpen(true)
  }

  const openPhotosModal = (record: ProgressRecord) => {
    setSelectedRecord(record)
    setIsPhotosModalOpen(true)
  }

  const openCompareModal = (record: ProgressRecord) => {
    setCompareRecord1(record)
    // Buscar registro anterior do mesmo aluno
    const studentRecords = progressRecords
      .filter((r: ProgressRecord) => r.studentId === record.studentId && r.id !== record.id)
      .sort((a: ProgressRecord, b: ProgressRecord) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())
    
    if (studentRecords.length > 0) {
      setCompareRecord2(studentRecords[0])
    }
    setIsCompareModalOpen(true)
  }

  const addPhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files) {
        const fileArray = Array.from(files)
        
        // Validar tamanho máximo de 5MB por arquivo
        const maxSize = 5 * 1024 * 1024
        const invalidFiles = fileArray.filter(file => file.size > maxSize)
        
        if (invalidFiles.length > 0) {
          toast.error(`${invalidFiles.length} arquivo(s) muito grande(s). Tamanho máximo: 5MB`)
          return
        }
        
        // Validar tipos de arquivo
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        const invalidTypes = fileArray.filter(file => !validTypes.includes(file.type))
        
        if (invalidTypes.length > 0) {
          toast.error(`${invalidTypes.length} arquivo(s) com formato inválido. Use: JPEG, PNG, GIF ou WebP`)
          return
        }
        
        // Validar limite máximo de fotos (10 fotos no total)
        const maxPhotos = 10
        const currentPhotosCount = formData.photos.length
        const newPhotosCount = fileArray.length
        
        if (currentPhotosCount + newPhotosCount > maxPhotos) {
          toast.error(`Limite máximo de ${maxPhotos} fotos. Você tem ${currentPhotosCount} e está tentando adicionar ${newPhotosCount}`)
          return
        }
        
        // Processar arquivos válidos
        let processedCount = 0
        const totalFiles = fileArray.length
        
        fileArray.forEach(async (file) => {
          try {
            const resizedImage = await resizeImage(file)
            setFormData(prev => ({
              ...prev,
              photos: [...prev.photos, resizedImage]
            }))
            
            processedCount++
            
            if (processedCount === totalFiles) {
              toast.success(`${totalFiles} foto(s) adicionada(s) e otimizada(s) com sucesso!`)
            }
          } catch (error) {
            toast.error(`Erro ao processar arquivo: ${file.name}`)
          }
        })
      }
    }
    
    input.click()
  }

  const removePhoto = (index: number) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index)
    })
    toast.success("Foto removida com sucesso!")
  }

  const resizeImage = (file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Converter para base64
        const resizedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(resizedBase64)
      }
      
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Evolução Física</h1>
          <p className="text-muted-foreground">Acompanhe o progresso dos alunos</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Evolução
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Registro de Evolução</DialogTitle>
              <DialogDescription>
                Registre as medidas e progresso do aluno
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Aluno</Label>
                  <Select value={formData.studentId} onValueChange={(value) => setFormData({ ...formData, studentId: value })}>
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
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bodyFat">Gordura Corporal (%)</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    value={formData.bodyFat}
                    onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="muscleMass">Massa Muscular (kg)</Label>
                  <Input
                    id="muscleMass"
                    type="number"
                    step="0.1"
                    value={formData.muscleMass}
                    onChange={(e) => setFormData({ ...formData, muscleMass: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Medidas (cm)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chest">Peitoral</Label>
                    <Input
                      id="chest"
                      type="number"
                      step="0.1"
                      value={formData.chest}
                      onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waist">Cintura</Label>
                    <Input
                      id="waist"
                      type="number"
                      step="0.1"
                      value={formData.waist}
                      onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hip">Quadril</Label>
                    <Input
                      id="hip"
                      type="number"
                      step="0.1"
                      value={formData.hip}
                      onChange={(e) => setFormData({ ...formData, hip: e.target.value })}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arm">Braço</Label>
                    <Input
                      id="arm"
                      type="number"
                      step="0.1"
                      value={formData.arm}
                      onChange={(e) => setFormData({ ...formData, arm: e.target.value })}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thigh">Coxa</Label>
                    <Input
                      id="thigh"
                      type="number"
                      step="0.1"
                      value={formData.thigh}
                      onChange={(e) => setFormData({ ...formData, thigh: e.target.value })}
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fotos da Evolução</Label>
                <div className="grid grid-cols-4 gap-2">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="h-20 w-full"
                    onClick={addPhoto}
                    disabled={formData.photos.length >= 10}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {formData.photos.length >= 10 ? 'Limite atingido' : 'Selecionar Fotos'}
                  </Button>
                </div>
                {formData.photos.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma foto selecionada. Clique em "Selecionar Fotos" para adicionar até 10 fotos.
                  </p>
                )}
                {formData.photos.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {formData.photos.length} de 10 fotos selecionadas.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações sobre o progresso, dificuldades, metas alcançadas..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateRecord} disabled={!formData.studentId || !formData.weight}>
                {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <></>}
                Salvar Registro
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registros Este Mês</CardTitle>
            <Scale className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recordsThisMonth.length}</div>
            <p className="text-xs text-muted-foreground">Avaliações realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Avaliados</CardTitle>
            <Ruler className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueStudentsThisMonth.length}</div>
            <p className="text-xs text-muted-foreground">Alunos únicos este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Progresso</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateProgressRate()}%</div>
            <p className="text-xs text-muted-foreground">Alunos com evolução positiva</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filtrar por aluno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os alunos</SelectItem>
                {students.map((student: any) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Progress Records */}
      <div className="grid gap-6">
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {selectedStudent === "all" 
                    ? "Nenhum registro de evolução encontrado" 
                    : "Nenhum registro encontrado para este aluno"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record: ProgressRecord) => {
            const trend = getWeightTrend(record.studentId, record.weight || 0)
            return (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{record.student.name}</CardTitle>
                      <CardDescription>
                        Avaliação de {new Date(record.recordDate).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {record.photos && record.photos.length > 0 && (
                        <Button variant="outline" size="sm" onClick={() => openPhotosModal(record)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Fotos ({record.photos.length})
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openCompareModal(record)}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Comparar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditModal(record)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Body Composition */}
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        Composição Corporal
                      </h4>
                      <div className="grid gap-2">
                        <div className="flex justify-between items-center">
                          <span>Peso:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{record.weight} kg</span>
                            {trend.difference > 0 && (
                              <Badge variant={trend.trend === "down" ? "success" : "destructive"}>
                                {trend.trend === "down" ? (
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                ) : (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                )}
                                {trend.difference}kg
                              </Badge>
                            )}
                          </div>
                        </div>
                        {record.bodyFat && (
                          <div className="flex justify-between">
                            <span>Gordura Corporal:</span>
                            <span className="font-semibold">{record.bodyFat}%</span>
                          </div>
                        )}
                        {record.muscleMass && (
                          <div className="flex justify-between">
                            <span>Massa Muscular:</span>
                            <span className="font-semibold">{record.muscleMass} kg</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Measurements */}
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Medidas
                      </h4>
                      <div className="grid gap-2">
                        {record.chest && (
                          <div className="flex justify-between">
                            <span>Peitoral:</span>
                            <span className="font-semibold">{record.chest} cm</span>
                          </div>
                        )}
                        {record.waist && (
                          <div className="flex justify-between">
                            <span>Cintura:</span>
                            <span className="font-semibold">{record.waist} cm</span>
                          </div>
                        )}
                        {record.hip && (
                          <div className="flex justify-between">
                            <span>Quadril:</span>
                            <span className="font-semibold">{record.hip} cm</span>
                          </div>
                        )}
                        {record.arm && (
                          <div className="flex justify-between">
                            <span>Braço:</span>
                            <span className="font-semibold">{record.arm} cm</span>
                          </div>
                        )}
                        {record.thigh && (
                          <div className="flex justify-between">
                            <span>Coxa:</span>
                            <span className="font-semibold">{record.thigh} cm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <h5 className="font-medium mb-2">Observações:</h5>
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Modal de Fotos */}
      <Dialog open={isPhotosModalOpen} onOpenChange={setIsPhotosModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Fotos da Evolução - {selectedRecord?.student.name}</DialogTitle>
            <DialogDescription>
              Evolução de {selectedRecord ? new Date(selectedRecord.recordDate).toLocaleDateString("pt-BR") : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            {selectedRecord?.photos?.map((photo, index) => (
              <div key={index} className="space-y-2">
                <img
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-64 object-cover rounded border"
                />
                <p className="text-sm text-center text-muted-foreground">Foto {index + 1}</p>
              </div>
            )) || <p className="text-muted-foreground col-span-3 text-center py-8">Nenhuma foto disponível</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Registro de Evolução</DialogTitle>
            <DialogDescription>
              Atualize as informações do registro
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editWeight">Peso (kg)</Label>
                <Input
                  id="editWeight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="0.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editBodyFat">Gordura Corporal (%)</Label>
                <Input
                  id="editBodyFat"
                  type="number"
                  step="0.1"
                  value={formData.bodyFat}
                  onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                  placeholder="0.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMuscleMass">Massa Muscular (kg)</Label>
                <Input
                  id="editMuscleMass"
                  type="number"
                  step="0.1"
                  value={formData.muscleMass}
                  onChange={(e) => setFormData({ ...formData, muscleMass: e.target.value })}
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Medidas (cm)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editChest">Peitoral</Label>
                  <Input
                    id="editChest"
                    type="number"
                    step="0.1"
                    value={formData.chest}
                    onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editWaist">Cintura</Label>
                  <Input
                    id="editWaist"
                    type="number"
                    step="0.1"
                    value={formData.waist}
                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editHip">Quadril</Label>
                  <Input
                    id="editHip"
                    type="number"
                    step="0.1"
                    value={formData.hip}
                    onChange={(e) => setFormData({ ...formData, hip: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editArm">Braço</Label>
                  <Input
                    id="editArm"
                    type="number"
                    step="0.1"
                    value={formData.arm}
                    onChange={(e) => setFormData({ ...formData, arm: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editThigh">Coxa</Label>
                  <Input
                    id="editThigh"
                    type="number"
                    step="0.1"
                    value={formData.thigh}
                    onChange={(e) => setFormData({ ...formData, thigh: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fotos da Evolução</Label>
              <div className="grid grid-cols-4 gap-2">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="h-20 w-full"
                  onClick={addPhoto}
                  disabled={formData.photos.length >= 10}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {formData.photos.length >= 10 ? 'Limite atingido' : 'Selecionar Fotos'}
                </Button>
              </div>
              {formData.photos.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma foto selecionada. Clique em "Selecionar Fotos" para adicionar até 10 fotos.
                </p>
              )}
              {formData.photos.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {formData.photos.length} de 10 fotos selecionadas.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="editNotes">Observações</Label>
              <Textarea
                id="editNotes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações sobre o progresso, dificuldades, metas alcançadas..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditRecord} disabled={!formData.weight}>
              {isEditing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <></>}
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Comparação */}
      <Dialog open={isCompareModalOpen} onOpenChange={setIsCompareModalOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Comparação de Evolução - {compareRecord1?.student.name}</DialogTitle>
            <DialogDescription>
              Compare os registros de evolução do aluno.
              Só é possivel cisualisar a compração caso o aluno tenha dois refirto de evolução no sistema.
            </DialogDescription>
          </DialogHeader>
          {compareRecord1 && compareRecord2 && (
            <div className="grid grid-cols-2 gap-6 py-4">
              {/* Registro 1 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Registro Atual</CardTitle>
                  <CardDescription>{new Date(compareRecord1.recordDate).toLocaleDateString("pt-BR")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span>Peso:</span>
                      <span className="font-semibold">{compareRecord1.weight} kg</span>
                    </div>
                    {compareRecord1.bodyFat && (
                      <div className="flex justify-between">
                        <span>Gordura Corporal:</span>
                        <span className="font-semibold">{compareRecord1.bodyFat}%</span>
                      </div>
                    )}
                    {compareRecord1.muscleMass && (
                      <div className="flex justify-between">
                        <span>Massa Muscular:</span>
                        <span className="font-semibold">{compareRecord1.muscleMass} kg</span>
                      </div>
                    )}
                    {compareRecord1.chest && (
                      <div className="flex justify-between">
                        <span>Peitoral:</span>
                        <span className="font-semibold">{compareRecord1.chest} cm</span>
                      </div>
                    )}
                    {compareRecord1.waist && (
                      <div className="flex justify-between">
                        <span>Cintura:</span>
                        <span className="font-semibold">{compareRecord1.waist} cm</span>
                      </div>
                    )}
                    {compareRecord1.hip && (
                      <div className="flex justify-between">
                        <span>Quadril:</span>
                        <span className="font-semibold">{compareRecord1.hip} cm</span>
                      </div>
                    )}
                    {compareRecord1.arm && (
                      <div className="flex justify-between">
                        <span>Braço:</span>
                        <span className="font-semibold">{compareRecord1.arm} cm</span>
                      </div>
                    )}
                    {compareRecord1.thigh && (
                      <div className="flex justify-between">
                        <span>Coxa:</span>
                        <span className="font-semibold">{compareRecord1.thigh} cm</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Registro 2 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Registro Anterior</CardTitle>
                  <CardDescription>{new Date(compareRecord2.recordDate).toLocaleDateString("pt-BR")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span>Peso:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{compareRecord2.weight} kg</span>
                        {compareRecord1.weight && compareRecord2.weight && (
                          <Badge variant={compareRecord1.weight < compareRecord2.weight ? "success" : "destructive"}>
                            {compareRecord1.weight < compareRecord2.weight ? "-" : "+"}
                            {Math.abs(compareRecord1.weight - compareRecord2.weight).toFixed(1)} kg
                          </Badge>
                        )}
                      </div>
                    </div>
                    {compareRecord2.bodyFat && (
                      <div className="flex justify-between">
                        <span>Gordura Corporal:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{compareRecord2.bodyFat}%</span>
                          {compareRecord1.bodyFat && compareRecord2.bodyFat && (
                            <Badge variant={compareRecord1.bodyFat < compareRecord2.bodyFat ? "success" : "destructive"}>
                              {compareRecord1.bodyFat < compareRecord2.bodyFat ? "-" : "+"}
                              {Math.abs(compareRecord1.bodyFat - compareRecord2.bodyFat).toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {compareRecord2.muscleMass && (
                      <div className="flex justify-between">
                        <span>Massa Muscular:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{compareRecord2.muscleMass} kg</span>
                          {compareRecord1.muscleMass && compareRecord2.muscleMass && (
                            <Badge variant={compareRecord1.muscleMass > compareRecord2.muscleMass ? "success" : "destructive"}>
                              {compareRecord1.muscleMass > compareRecord2.muscleMass ? "+" : "-"}
                              {Math.abs(compareRecord1.muscleMass - compareRecord2.muscleMass).toFixed(1)} kg
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {compareRecord2.chest && (
                      <div className="flex justify-between">
                        <span>Peitoral:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{compareRecord2.chest} cm</span>
                          {compareRecord1.chest && compareRecord2.chest && (
                            <Badge variant={compareRecord1.chest < compareRecord2.chest ? "success" : "destructive"}>
                              {compareRecord1.chest < compareRecord2.chest ? "-" : "+"}
                              {Math.abs(compareRecord1.chest - compareRecord2.chest).toFixed(1)} cm
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {compareRecord2.waist && (
                      <div className="flex justify-between">
                        <span>Cintura:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{compareRecord2.waist} cm</span>
                          {compareRecord1.waist && compareRecord2.waist && (
                            <Badge variant={compareRecord1.waist < compareRecord2.waist ? "success" : "destructive"}>
                              {compareRecord1.waist < compareRecord2.waist ? "-" : "+"}
                              {Math.abs(compareRecord1.waist - compareRecord2.waist).toFixed(1)} cm
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {compareRecord2.hip && (
                      <div className="flex justify-between">
                        <span>Quadril:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{compareRecord2.hip} cm</span>
                          {compareRecord1.hip && compareRecord2.hip && (
                            <Badge variant={compareRecord1.hip < compareRecord2.hip ? "success" : "destructive"}>
                              {compareRecord1.hip < compareRecord2.hip ? "-" : "+"}
                              {Math.abs(compareRecord1.hip - compareRecord2.hip).toFixed(1)} cm
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {compareRecord2.arm && (
                      <div className="flex justify-between">
                        <span>Braço:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{compareRecord2.arm} cm</span>
                          {compareRecord1.arm && compareRecord2.arm && (
                            <Badge variant={compareRecord1.arm > compareRecord2.arm ? "success" : "destructive"}>
                              {compareRecord1.arm > compareRecord2.arm ? "+" : "-"}
                              {Math.abs(compareRecord1.arm - compareRecord2.arm).toFixed(1)} cm
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {compareRecord2.thigh && (
                      <div className="flex justify-between">
                        <span>Coxa:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{compareRecord2.thigh} cm</span>
                          {compareRecord1.thigh && compareRecord2.thigh && (
                            <Badge variant={compareRecord1.thigh > compareRecord2.thigh ? "success" : "destructive"}>
                              {compareRecord1.thigh > compareRecord2.thigh ? "+" : "-"}
                              {Math.abs(compareRecord1.thigh - compareRecord2.thigh).toFixed(1)} cm
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

