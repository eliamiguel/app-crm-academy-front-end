"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Mail, Shield, Users, BookOpen, Calendar, ChevronRight, Eye } from "lucide-react"
import Link from "next/link"
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
import { useGetInstructors, useCreateInstructor, useUpdateInstructor, useDeleteInstructor, CreateInstructorData, UpdateInstructorData, Instructor } from "@/lib/instructorService"

export default function InstructorsSection() {
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const { data: instructors, isLoading, error } = useGetInstructors()
  const createInstructor = useCreateInstructor()
  const updateInstructor = useUpdateInstructor()
  const deleteInstructor = useDeleteInstructor()

  // Debug: Vamos mostrar os dados no console
  console.log("Dados dos instrutores:", instructors, "Loading:", isLoading, "Error:", error)

  const filteredInstructors = instructors?.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateInstructor = async (data: CreateInstructorData) => {
    await createInstructor.mutateAsync(data)
    setOpenCreateDialog(false)
  }

  const handleUpdateInstructor = async (data: UpdateInstructorData) => {
    if (selectedInstructor) {
      await updateInstructor.mutateAsync({ id: selectedInstructor.id, data })
      setOpenEditDialog(false)
      setSelectedInstructor(null)
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
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Instrutor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Instrutor</DialogTitle>
            </DialogHeader>
            <InstructorForm onSubmit={handleCreateInstructor as any} />
          </DialogContent>
        </Dialog>
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
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstructors?.map((instructor) => (
                <TableRow key={instructor.id}>
                  <TableCell className="font-medium">{instructor.name}</TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
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
  onSubmit: (data: CreateInstructorData | UpdateInstructorData) => void
  isEditing?: boolean
}

function InstructorForm({ instructor, onSubmit, isEditing = false }: InstructorFormProps) {
  const [formData, setFormData] = useState({
    name: instructor?.name || "",
    email: instructor?.email || "",
    password: "",
    role: instructor?.role || "INSTRUCTOR"
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isEditing) {
      const updateData: UpdateInstructorData = {
        name: formData.name,
        email: formData.email,
        role: formData.role as "ADMIN" | "MANAGER" | "INSTRUCTOR"
      }
      
      if (formData.password) {
        updateData.password = formData.password
      }
      
      onSubmit(updateData)
    } else {
      const createData: CreateInstructorData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as "ADMIN" | "MANAGER" | "INSTRUCTOR"
      }
      
      onSubmit(createData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Função</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as "ADMIN" | "MANAGER" | "INSTRUCTOR" })}>
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

      <Button type="submit" className="w-full">
        {isEditing ? "Atualizar" : "Criar"} Instrutor
      </Button>
    </form>
  )
} 