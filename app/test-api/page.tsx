"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/axios"

export default function TestApiPage() {
  const [token, setToken] = useState<string>("")
  const [email, setEmail] = useState("admin@gymcrm.com")
  const [password, setPassword] = useState("admin123")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const response = await api.post("/auth/login", { email, password })
      setResult(response.data)
      setToken(response.data.token)
      localStorage.setItem("token", response.data.token)
    } catch (error: any) {
      setResult({ error: error.response?.data || error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleTestInstructors = async () => {
    setLoading(true)
    try {
      const response = await api.get("/users/instructors")
      setResult(response.data)
    } catch (error: any) {
      setResult({ error: error.response?.data || error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleTestStats = async () => {
    if (!token) {
      setResult({ error: "Faça login primeiro" })
      return
    }
    
    setLoading(true)
    try {
      const response = await api.get("/users/cmd1sqrpk0001nb7rcxa2hi2r/stats")
      setResult(response.data)
    } catch (error: any) {
      setResult({ error: error.response?.data || error.message })
    } finally {
      setLoading(false)
    }
  }

  const checkCurrentToken = () => {
    const currentToken = localStorage.getItem("token")
    setResult({ currentToken })
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teste da API</h1>
        <p className="text-muted-foreground">Teste das funcionalidades da API</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Faça login para testar a API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleLogin} disabled={loading}>
            {loading ? "Carregando..." : "Fazer Login"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Testes</CardTitle>
          <CardDescription>Teste as diferentes funcionalidades</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={checkCurrentToken} variant="outline">
              Verificar Token Atual
            </Button>
            <Button onClick={handleTestInstructors} disabled={loading}>
              Testar Instrutores
            </Button>
            <Button onClick={handleTestStats} disabled={loading}>
              Testar Estatísticas
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
          <CardDescription>Resultado da última operação</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
} 