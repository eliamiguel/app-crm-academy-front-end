"use client"

import { useParams } from "next/navigation"
import { ArrowLeft, User, Mail, Shield, Users, Calendar, BookOpen, TrendingUp, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetInstructor, useGetInstructorStats } from "@/lib/instructorService"
import Link from "next/link"

export default function InstructorDetailsPage() {
  const { id } = useParams()
  
  // Debug: Vamos mostrar o ID na página
  console.log("ID do instrutor:", id)
  
  const { data: instructor, isLoading: isLoadingInstructor, error: errorInstructor } = useGetInstructor(id as string)
  const { data: stats, isLoading: isLoadingStats, error: errorStats } = useGetInstructorStats(id as string)

  // Debug: Vamos mostrar os dados no console
  console.log("Dados do instrutor:", instructor, "Loading:", isLoadingInstructor, "Error:", errorInstructor)
  console.log("Dados das estatísticas:", stats, "Loading:", isLoadingStats, "Error:", errorStats)

  if (isLoadingInstructor || isLoadingStats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (errorInstructor || errorStats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Erro ao carregar instrutor</h2>
          <p className="text-muted-foreground mb-4">
            {errorInstructor ? `Erro instrutor: ${errorInstructor}` : ''}
            {errorStats ? `Erro stats: ${errorStats}` : ''}
          </p>
          <Button asChild>
            <Link href="/instructors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Instrutores
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!instructor) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Instrutor não encontrado</h2>
          <p className="text-muted-foreground mb-4">O instrutor solicitado não existe ou foi removido.</p>
          <Button asChild>
            <Link href="/instructors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Instrutores
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" asChild>
          <Link href="/instructors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{instructor.name}</h1>
          <p className="text-muted-foreground">ID: {instructor.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Instrutor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Nome:</strong> {instructor.name}
          </div>
          <div>
            <strong>Email:</strong> {instructor.email}
          </div>
          <div>
            <strong>Função:</strong> {instructor.role}
          </div>
          {stats && (
            <div>
              <strong>Estatísticas:</strong>
              <ul className="mt-2 space-y-1">
                <li>• Alunos: {stats.studentsCount}</li>
                <li>• Agendamentos: {stats.appointmentsCount}</li>
                <li>• Planos de Treino: {stats.workoutPlansCount}</li>
                <li>• Pagamentos Ativos: {stats.studentsWithActivePayments}</li>
                <li>• Pagamentos em Atraso: {stats.overduePayments}</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug: Mostrar dados brutos */}
      <Card>
        <CardHeader>
          <CardTitle>Debug - Dados Brutos</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify({ instructor, stats }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
} 