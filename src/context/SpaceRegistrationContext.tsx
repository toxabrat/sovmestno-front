import { createContext, useContext, useState, ReactNode } from 'react'

interface SpaceRegistrationData {
  token: string | null
  userId: number | null
  venueId: number | null
  name: string
  email: string
  password: string
  description: string
  city: string
  street: string
  phone: string
  workEmail: string
  telegramPersonal: string
  logoFile: File | null
  logoPreview: string | null
  logoId: number | null
  coverFile: File | null
  coverPreview: string | null
  coverId: number | null
  telegramChannel: string
  vkLink: string
  tiktokLink: string
  youtubeLink: string
  dzenLink: string
}

interface SpaceRegistrationContextType {
  data: SpaceRegistrationData
  updateData: (newData: Partial<SpaceRegistrationData>) => void
  resetData: () => void
}

const initialData: SpaceRegistrationData = {
  token: null,
  userId: null,
  venueId: null,
  name: '',
  email: '',
  password: '',
  description: '',
  city: 'Москва',
  street: '',
  phone: '',
  workEmail: '',
  telegramPersonal: '',
  logoFile: null,
  logoPreview: null,
  logoId: null,
  coverFile: null,
  coverPreview: null,
  coverId: null,
  telegramChannel: '',
  vkLink: '',
  tiktokLink: '',
  youtubeLink: '',
  dzenLink: '',
}

const SpaceRegistrationContext = createContext<SpaceRegistrationContextType | undefined>(undefined)

export function SpaceRegistrationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SpaceRegistrationData>(initialData)

  const updateData = (newData: Partial<SpaceRegistrationData>) => {
    setData(prev => ({ ...prev, ...newData }))
  }

  const resetData = () => {
    setData(initialData)
  }

  return (
    <SpaceRegistrationContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </SpaceRegistrationContext.Provider>
  )
}

export function useSpaceRegistration() {
  const context = useContext(SpaceRegistrationContext)
  if (!context) {
    throw new Error('useSpaceRegistration must be used within SpaceRegistrationProvider')
  }
  return context
}
