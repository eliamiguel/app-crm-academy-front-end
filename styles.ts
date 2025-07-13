export interface Student {
    id: string
    name: string
    email: string
    phone?: string
    dateOfBirth?: string
    gender?: "MALE" | "FEMALE" | "OTHER"
    address?: string
    emergencyContact?: string
    emergencyPhone?: string
    medicalRestrictions?: string
    objectives?: string
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING"
    registrationDate: string
    createdAt: string
    updatedAt: string
    instructorId: string
  }