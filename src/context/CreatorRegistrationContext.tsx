import { createContext, useContext, useState, ReactNode } from 'react'

interface CreatorRegistrationData {
  token: string | null
  userId: number | null
  name: string
  email: string
  password: string
  description: string
  city: string
  phone: string
  workEmail: string
  telegramPersonal: string
  photoFile: File | null
  photoPreview: string | null
  photoId: number | null
  telegramChannel: string
  vkLink: string
  tiktokLink: string
  youtubeLink: string
  dzenLink: string
}

interface CreatorRegistrationContextType {
  data: CreatorRegistrationData
  updateData: (newData: Partial<CreatorRegistrationData>) => void
  resetData: () => void
}

const initialData: CreatorRegistrationData = {
  token: null,
  userId: null,
  name: '',
  email: '',
  password: '',
  description: '',
  city: 'Москва',
  phone: '',
  workEmail: '',
  telegramPersonal: '',
  photoFile: null,
  photoPreview: null,
  photoId: null,
  telegramChannel: '',
  vkLink: '',
  tiktokLink: '',
  youtubeLink: '',
  dzenLink: '',
}

const CreatorRegistrationContext = createContext<CreatorRegistrationContextType | undefined>(undefined)

export function CreatorRegistrationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CreatorRegistrationData>(initialData)

  const updateData = (newData: Partial<CreatorRegistrationData>) => {
    setData(prev => ({ ...prev, ...newData }))
  }

  const resetData = () => {
    setData(initialData)
  }

  return (
    <CreatorRegistrationContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </CreatorRegistrationContext.Provider>
  )
}

export function useCreatorRegistration() {
  const context = useContext(CreatorRegistrationContext)
  if (!context) {
    throw new Error('useCreatorRegistration must be used within CreatorRegistrationProvider')
  }
  return context
}
