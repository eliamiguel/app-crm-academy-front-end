"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Mail, Shield, Users, BookOpen, Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useGetInstructors, useCreateInstructor, useUpdateInstructor, useDeleteInstructor, CreateInstructorData, UpdateInstructorData, Instructor } from "@/lib/instructorService"
import { getAuthState } from "@/lib/auth"


export default function InstructorsSection() {
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const authState = getAuthState()
  const isAdmin = authState.user?.role === "ADMIN"
  
  const { data: instructors, isLoading, error } = useGetInstructors()
  const createInstructor = useCreateInstructor()
  const updateInstructor = useUpdateInstructor()
  const deleteInstructor = useDeleteInstructor()

  const filteredInstructors = instructors?.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
  )
console.log("instr",instructors)
  const handleCreateInstructor = async (data: CreateInstructorData) => {
    try {
      await createInstructor.mutateAsync(data)
      setOpenCreateDialog(false)
    } catch (error) {
      console.error("Erro ao criar instrutor:", error)
    }
  }

  const handleUpdateInstructor = async (data: UpdateInstructorData) => {
    if (selectedInstructor) {
      try {
        await updateInstructor.mutateAsync({ id: selectedInstructor.id, data })
        setOpenEditDialog(false)
        setSelectedInstructor(null)
      } catch (error) {
        console.error("Erro ao atualizar instrutor:", error)
      }
    }
  }

  const handleDeleteInstructor = async (id: string) => {
    await deleteInstructor.mutateAsync(id)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800"
      case "MANAGER":
        return "bg-blue-100 text-blue-800"
      case "INSTRUCTOR":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-3 w-3" />
      case "MANAGER":
        return <Users className="h-3 w-3" />
      case "INSTRUCTOR":
        return <BookOpen className="h-3 w-3" />
      default:
        return <Users className="h-3 w-3" />
    }
  }

  const getAvatarUrl = (avatar?: string) => {
    if (!avatar) return null
    // Se já é uma URL completa, retorna como está
    if (avatar.startsWith('http')) return avatar
    // Se é um caminho relativo, adiciona a base URL do backend
    return `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') || 'http://localhost:8000'}/uploads/${avatar}`
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Instrutores</h2>
            <p className="text-muted-foreground">Erro ao carregar instrutores</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
              <p className="text-muted-foreground mb-4">
                Erro: {error?.message || 'Erro desconhecido'}
              </p>
              <p className="text-sm text-muted-foreground">
                Verifique se você está logado e tente novamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Instrutores</h2>
          <p className="text-muted-foreground">Gerencie os instrutores da academia</p>
        </div>
        {isAdmin ? (
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Instrutor/Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Instrutor/usuario</DialogTitle>
              </DialogHeader>
              <InstructorForm onSubmit={handleCreateInstructor as (data: CreateInstructorData | UpdateInstructorData) => Promise<void>} />
            </DialogContent>
          </Dialog>
        ) : (
          <div className="text-sm text-muted-foreground">
            Apenas administradores podem criar instrutores
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar instrutores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Instrutores</CardTitle>
          <CardDescription>
            {filteredInstructors?.length || 0} instruto{filteredInstructors?.length === 1 ? 'r' : 'res'} encontrado{filteredInstructors?.length === 1 ? '' : 's'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instrutor</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              
              {filteredInstructors?.map((instructor) => (
                <TableRow key={instructor.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={instructor?.avatar ? `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') || 'http://localhost:8000'}/uploads/${instructor.avatar}` : undefined} alt={instructor.name} />
                        <AvatarFallback>
                          {instructor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{instructor.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{instructor.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(instructor.role)}>
                      {getRoleIcon(instructor.role)}
                      <span className="ml-1">{instructor.role}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInstructor(instructor)
                            setOpenEditDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover {instructor.name}? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteInstructor(instructor.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Apenas administradores</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Instrutor</DialogTitle>
          </DialogHeader>
          {selectedInstructor && (
            <InstructorForm
              instructor={selectedInstructor}
              onSubmit={handleUpdateInstructor}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface InstructorFormProps {
  instructor?: Instructor
  onSubmit: (data: CreateInstructorData | UpdateInstructorData) => Promise<void>
  isEditing?: boolean
}

function InstructorForm({ instructor, onSubmit, isEditing = false }: InstructorFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: instructor?.name || "",
    email: instructor?.email || "",
    password: "",
    role: instructor?.role || "INSTRUCTOR",
    avatar: instructor?.avatar || ""
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Configurar preview inicial se estiver editando
  useEffect(() => {
    if (instructor?.avatar) {
      const avatarUrl = instructor.avatar.startsWith('http') 
        ? instructor.avatar 
        : `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') || 'http://localhost:8000'}/uploads/${instructor.avatar}`
      setAvatarPreview(avatarUrl)
    }
  }, [instructor?.avatar])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione apenas arquivos de imagem")
        return
      }
      
      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("O arquivo deve ter no máximo 5MB")
        return
      }

      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      console.log("Iniciando upload do arquivo:", file.name)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') || 'http://localhost:8000'}/api/upload/single`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      console.log("Resposta do upload:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Erro na resposta:", errorText)
        throw new Error("Erro no upload")
      }

      const data = await response.json()
      console.log("Dados do upload:", data)
      
      if (!data.success) {
        throw new Error(data.message || "Erro no upload")
      }

      console.log("Upload bem-sucedido, caminho:", data.file.path)
      return data.file.path // Retorna o caminho relativo do arquivo
    } catch (error) {
      console.error("Erro no upload:", error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let avatarPath = formData.avatar

      // Se há um novo arquivo de avatar, fazer upload
      if (avatarFile) {
        setIsUploading(true)
        console.log("Fazendo upload do avatar...")
        avatarPath = await uploadAvatar(avatarFile)
        console.log("Avatar enviado com sucesso:", avatarPath)
        setIsUploading(false)
      }

      if (isEditing) {
        const updateData: UpdateInstructorData = {
          name: formData.name,
          email: formData.email,
          role: formData.role as "ADMIN" | "MANAGER" | "INSTRUCTOR",
          avatar: avatarPath,
        }
        
        // Só incluir senha se foi fornecida
        if (formData.password.trim()) {
          updateData.password = formData.password
        }
        
        console.log("Dados de atualização:", updateData)
        await onSubmit(updateData)
      } else {
        const createData: CreateInstructorData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role as "ADMIN" | "MANAGER" | "INSTRUCTOR",
          avatar: avatarPath,
        }
        
        console.log("Dados de criação:", createData)
        await onSubmit(createData)
      }

      // Limpar formulário após sucesso
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "INSTRUCTOR",
        avatar: ""
      })
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (error) {
      console.error("Erro ao salvar instrutor:", error)
      toast.error("Erro ao salvar instrutor")
    } finally {
      setIsLoading(false)
      setIsUploading(false)
    }
  }

  const getAvatarUrl = (avatar?: string) => {
    if (!avatar) return null
    if (avatar.startsWith('http')) return avatar
    return `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '') || 'http://localhost:8000'}/uploads/${avatar}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Avatar Upload */}
      <div className="space-y-2">
        <Label>Foto de Perfil</Label>
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarPreview || getAvatarUrl(formData.avatar) || undefined} alt="Avatar" />
            <AvatarFallback>
              {formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase() : <User className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isUploading}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, GIF até 5MB
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          {isEditing ? "Nova Senha (opcional)" : "Senha"}
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required={!isEditing}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Função</Label>
        <Select 
          value={formData.role} 
          onValueChange={(value) => setFormData({ ...formData, role: value as "ADMIN" | "MANAGER" | "INSTRUCTOR" })}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INSTRUCTOR">Instrutor</SelectItem>
            <SelectItem value="MANAGER">Gerente</SelectItem>
            <SelectItem value="ADMIN">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || isUploading}>
        {isUploading ? (
          <>
            <Upload className="h-4 w-4 mr-2 animate-spin" />
            Enviando imagem...
          </>
        ) : isLoading ? (
          "Salvando..."
        ) : (
          `${isEditing ? "Atualizar" : "Criar"} Instrutor`
        )}
      </Button>
    </form>
  )
}