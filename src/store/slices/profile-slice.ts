import { create } from 'zustand'
import { profileService } from '@/services/api/profile-service'
import type { User, ProfileUpdateData, UserProfile } from '@/types/auth/user'

interface ProfileState {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  fetchProfile: () => Promise<void>
  updateProfile: (data: ProfileUpdateData) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
  clearProfile: () => void
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const user = await profileService.getProfile()
      // Store the profile data (not the entire user object)
      set({ profile: user.profile as UserProfile || user as unknown as UserProfile, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateProfile: async (data: ProfileUpdateData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedUser = await profileService.updateProfile(data)
      set({ profile: updatedUser.profile as UserProfile || updatedUser as unknown as UserProfile, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    set({ isLoading: true, error: null })
    try {
      await profileService.changePassword(currentPassword, newPassword)
      set({ isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  uploadAvatar: async (file: File) => {
    set({ isLoading: true, error: null })
    try {
      const { avatarUrl } = await profileService.uploadAvatar(file)
      const { profile } = get()
      if (profile) {
        set({ 
          profile: { ...profile, avatar: avatarUrl },
          isLoading: false 
        })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  clearProfile: () => set({ profile: null, error: null }),
}))