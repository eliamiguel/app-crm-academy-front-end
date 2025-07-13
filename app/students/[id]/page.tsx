"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StudentDetails } from "@/components/student-details"
import { useGetStudent } from "@/lib/studentsService"
import { ArrowLeft } from "lucide-react"

export default function StudentPage() {
  const params = useParams()
  const router = useRouter()
  const { data: student, isLoading, isError } = useGetStudent(params.id as string)

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div>Carregando...</div>
      </div>
    )
  }

  if (isError || !student) {
    return (
      <div>
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div>Erro ao carregar informações do aluno</div>
      </div>
    )
  }

  return (
    <div className="border-rounded-md">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
      <StudentDetails student={student} />
    </div>
  )
} 