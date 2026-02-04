export const API_BASE_URL = 'http://localhost:8080/api'

export async function fetchImageUrl(imageId: number, token: string): Promise<string> {
  const url = `${API_BASE_URL}/user/users/images/${imageId}`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'image/*,*/*',
    },
  })
  if (!response.ok) {
    throw new Error(`Image load failed: ${response.status} ${response.statusText}`)
  }
  const contentType = response.headers.get('content-type') || ''
  const blob = await response.blob()
  if (!contentType.startsWith('image/') && blob.type && !blob.type.startsWith('image/')) {
    throw new Error('Response is not an image')
  }
  return URL.createObjectURL(blob)
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: number
    email: string
    role: string
    avatar?: string
    avatar_id?: number
    created_at: string
    updated_at: string
    creator?: {
      id: number
      name: string
      description: string
      phone: string
      work_email: string
      photo_id?: number
      photo?: {
        id: number
        file_path: string
      }
    }
    venue?: {
      id: number
      name: string
    }
  }
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  console.log('=== Login Request ===')
  console.log('URL:', `${API_BASE_URL}/user/auth/login`)
  console.log('Email:', data.email)
  
  const response = await fetch(`${API_BASE_URL}/user/auth/login`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const responseData = await response.json().catch(() => ({}))
  
  console.log('=== Login Response ===')
  console.log('Status:', response.status)
  console.log('Data:', responseData)

  if (!response.ok) {
    throw new Error(JSON.stringify(responseData))
  }

  return responseData
}

export interface RegisterCreatorRequest {
  name: string
  email: string
  password: string
}

export interface RegisterCreatorResponse {
  token: string
  user: {
    id: number
    email: string
    role: string
    created_at: string
    updated_at: string
  }
}

export async function registerCreator(data: RegisterCreatorRequest): Promise<RegisterCreatorResponse> {
  console.log('=== Register Creator Request ===')
  console.log('URL:', `${API_BASE_URL}/user/auth/register/creator`)
  console.log('Data:', data)
  
  const response = await fetch(`${API_BASE_URL}/user/auth/register/creator`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const responseData = await response.json().catch(() => ({}))
  
  console.log('=== Register Creator Response ===')
  console.log('Status:', response.status)
  console.log('Data:', responseData)

  if (!response.ok) {
    throw new Error(JSON.stringify(responseData))
  }

  return responseData
}

export interface UploadImageResponse {
  bucket_name: string
  created_at: string
  file_name: string
  file_path: string
  file_type: string
  id: number
  image_type: string
}

export type ImageType = 'avatar' | 'venue-logo' | 'venue-cover' | 'venue-photo' | 'event-cover'

export async function uploadImage(file: File, type: ImageType, token: string): Promise<UploadImageResponse> {
  console.log('=== Upload Image Request ===')
  console.log('File:', file.name, file.type, file.size)
  console.log('Type:', type)
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  
  const response = await fetch(`${API_BASE_URL}/user/users/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })

  const responseData = await response.json().catch(() => ({}))
  
  console.log('=== Upload Image Response ===')
  console.log('Status:', response.status)
  console.log('Data:', responseData)

  if (!response.ok) {
    throw new Error(JSON.stringify(responseData))
  }

  return responseData
}

export interface UpdateCreatorRequest {
  name?: string
  description?: string
  phone?: string
  work_email?: string
  photo_id?: number
  tg_personal_link?: string
  tg_channel_link?: string
  vk_link?: string
  tiktok_link?: string
  youtube_link?: string
  dzen_link?: string
}

export interface UpdateCreatorResponse {
  id: number
  user_id: number
  name: string
  description: string
  phone: string
  work_email: string
  photo_id: number
  tg_personal_link: string
  tg_channel_link: string
  vk_link: string
  tiktok_link: string
  youtube_link: string
  dzen_link: string
  created_at: string
  updated_at: string
}

export async function updateCreatorProfile(
  userId: number, 
  data: UpdateCreatorRequest, 
  token: string
): Promise<UpdateCreatorResponse> {
  console.log('=== Update Creator Profile Request ===')
  console.log('URL:', `${API_BASE_URL}/user/users/creators/${userId}`)
  console.log('Data:', data)
  
  const response = await fetch(`${API_BASE_URL}/user/users/creators/${userId}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  const responseData = await response.json().catch(() => ({}))
  
  console.log('=== Update Creator Profile Response ===')
  console.log('Status:', response.status)
  console.log('Data:', responseData)

  if (!response.ok) {
    throw new Error(JSON.stringify(responseData))
  }

  return responseData
}
