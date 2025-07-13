export interface IStudent {
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

  export interface Appointment {
    id: string
    title: string
    startTime: string
    endTime: string
    type: "PERSONAL_TRAINING" | "GROUP_CLASS" | "EVALUATION" | "CONSULTATION"
    status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
    notes?: string
    student: {
      id: string
      name: string
      email: string
      phone?: string
    }
    instructor: {
      id: string
      name: string
      email: string
    }
  }
  
  export interface IStudent {
    id: string
    name: string
    email: string
    phone?: string
  }
  
  export interface IInstructor {
    id: string
    name: string
    email: string
    role: "ADMIN" | "MANAGER" | "INSTRUCTOR"
  }