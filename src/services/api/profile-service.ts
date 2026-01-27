import { User } from '@/types/auth/user'

export interface ProfileUpdateData {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  address?: string
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
}

class ProfileService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
  
  async getProfile(): Promise<User> {
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${this.baseUrl}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }

    return response.json()
  }

  async updateProfile(data: ProfileUpdateData): Promise<User> {
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${this.baseUrl}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update profile')
    }

    return response.json()
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = localStorage.getItem('accessToken')
    
    const response = await fetch(`${this.baseUrl}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to change password')
    }
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const token = localStorage.getItem('accessToken')
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await fetch(`${this.baseUrl}/auth/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload avatar')
    }

    return response.json()
  }
}

export const profileService = new ProfileService()