"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IStudent } from "@/styles/styles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"

interface StudentDetailsProps {
  student: IStudent
}

export function StudentDetails({ student }: StudentDetailsProps) {
  console.log("student details", student)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default"
      case "INACTIVE":
        return "secondary"
      case "SUSPENDED":
        return "destructive"
      case "PENDING":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Ativo"
      case "INACTIVE":
        return "Inativo"
      case "SUSPENDED":
        return "Suspenso"
      case "PENDING":
        return "Pendente"
      default:
        return status
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  return (
    <div className="space-y-6 bg-white shadow rounded-md p-4">
      {/* Cabeçalho com informações principais */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-2xl font-semibold">
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{student.name}</h2>
                  <p className="text-muted-foreground">{student.email}</p>
                </div>
                <Badge variant={getStatusColor(student.status)}>{getStatusText(student.status)}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abas com diferentes seções de informações */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="medical">Informações Médicas</TabsTrigger>
          <TabsTrigger value="training">Treino</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Telefone</Label>
                  <p className="text-muted-foreground">{student.phone || "Não informado"}</p>
                </div>
                <div>
                  <Label>Data de Nascimento</Label>
                  <p className="text-muted-foreground">
                    {student.dateOfBirth ? formatDate(student.dateOfBirth) : "Não informada"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Gênero</Label>
                  <p className="text-muted-foreground">
                    {student.gender === "MALE"
                      ? "Masculino"
                      : student.gender === "FEMALE"
                      ? "Feminino"
                      : student.gender === "OTHER"
                      ? "Outro"
                      : "Não informado"}
                  </p>
                </div>
                <div>
                  <Label>Endereço</Label>
                  <p className="text-muted-foreground">{student.address || "Não informado"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contato de Emergência</Label>
                  <p className="text-muted-foreground">{student.emergencyContact || "Não informado"}</p>
                </div>
                <div>
                  <Label>Telefone de Emergência</Label>
                  <p className="text-muted-foreground">{student.emergencyPhone || "Não informado"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Médicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Restrições Médicas</Label>
                <p className="text-muted-foreground mt-1">
                  {student.medicalRestrictions || "Nenhuma restrição informada"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Objetivos e Treino</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Objetivos</Label>
                  <p className="text-muted-foreground mt-1">{student.objectives || "Não informados"}</p>
                </div>
                {/* Aqui podemos adicionar mais informações relacionadas ao treino quando disponíveis */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Data de Registro</Label>
                  <p className="text-muted-foreground mt-1">
                    {formatDate(student.registrationDate || student.createdAt)}
                  </p>
                </div>
                {/* Aqui podemos adicionar mais informações de histórico quando disponíveis */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 