import { useState } from 'react'
import { toast } from 'sonner'

interface UploadResponse {
  success: boolean
  message: string
  file: {
    filename: string
    originalName: string
    mimetype: string
    size: number
    path: string
    uploadDate: string
  }
}

interface UseUploadOptions {
  maxSize?: number // em bytes
  allowedTypes?: string[]
  onSuccess?: (response: UploadResponse) => void
  onError?: (error: Error) => void
}

export function useUpload(options: UseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    onSuccess,
    onError
  } = options

  const validateFile = (file: File): boolean => {
    // Validar tipo
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`)
      return false
    }

    // Validar tamanho
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      toast.error(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`)
      return false
    }

    return true
  }

  const uploadFile = async (file: File): Promise<string> => {
    if (!validateFile(file)) {
      throw new Error('Arquivo inválido')
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = await fetch(`${baseUrl}/api/upload/single`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data: UploadResponse = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erro no upload')
      }

      onSuccess?.(data)
      return data.file.path
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no upload'
      toast.error(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
      throw error
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const uploadMultipleFiles = async (files: File[]): Promise<string[]> => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      
      // Validar todos os arquivos primeiro
      for (const file of files) {
        if (!validateFile(file)) {
          throw new Error('Um ou mais arquivos são inválidos')
        }
        formData.append('files', file)
      }

      const token = localStorage.getItem('token')
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = await fetch(`${baseUrl}/api/upload/multiple`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erro no upload')
      }

      return data.files.map((file: any) => file.path)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no upload'
      toast.error(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
      throw error
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const deleteFile = async (filename: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token')
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = await fetch(`${baseUrl}/api/upload/file/${filename}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erro ao deletar arquivo')
      }

      toast.success('Arquivo deletado com sucesso')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar arquivo'
      toast.error(errorMessage)
      throw error
    }
  }

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    isUploading,
    uploadProgress,
    validateFile,
  }
}

// Utility function para construir URLs de arquivos
export function getFileUrl(filePath?: string): string | null {
  if (!filePath) return null
  
  // Se já é uma URL completa, retorna como está
  if (filePath.startsWith('http')) return filePath
  
  // Se é um caminho relativo, adiciona a base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  return `${baseUrl}/uploads/${filePath}`
}

// Componente para preview de imagem
export function ImagePreview({ 
  src, 
  alt, 
  className = "h-20 w-20 rounded-full object-cover" 
}: { 
  src?: string | null
  alt: string
  className?: string 
}) {
  const imageUrl = getFileUrl(src || undefined)
  
  if (!imageUrl) return null
  
  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      className={className}
      onError={(e) => {
        console.error('Erro ao carregar imagem:', imageUrl)
        e.currentTarget.style.display = 'none'
      }}
    />
  )
}