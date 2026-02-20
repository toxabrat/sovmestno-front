export const API_BASE_URL = '/api'

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


export interface RegisterVenueRequest {
  name: string
  email: string
  password: string
  description?: string
  street_address?: string
  capacity?: number
  opening_hours?: string
  phone?: string
  work_email?: string
  tg_personal_link?: string
  tg_channel_link?: string
  vk_link?: string
  tiktok_link?: string
  youtube_link?: string
  dzen_link?: string
  logo_id?: number
  cover_photo_id?: number
  category_ids?: number[]
}

export interface RegisterVenueResponse {
  token: string
  user: {
    id: number
    email: string
    role: string
    created_at: string
    updated_at: string
    venue?: {
      id: number
      name: string
      logo?: { id: number; file_path: string }
      logo_id?: number
    }
  }
}

export async function registerVenue(data: RegisterVenueRequest): Promise<RegisterVenueResponse> {
  console.log('=== Register Venue Request ===')
  console.log('URL:', `${API_BASE_URL}/user/auth/register/venue`)
  console.log('Data:', data)

  const response = await fetch(`${API_BASE_URL}/user/auth/register/venue`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const responseData = await response.json().catch(() => ({}))

  console.log('=== Register Venue Response ===')
  console.log('Status:', response.status)
  console.log('Data:', responseData)

  if (!response.ok) {
    throw new Error(JSON.stringify(responseData))
  }

  return responseData
}

export interface UpdateVenueRequest {
  name?: string
  description?: string
  street_address?: string
  capacity?: number
  opening_hours?: string
  phone?: string
  work_email?: string
  tg_personal_link?: string
  tg_channel_link?: string
  vk_link?: string
  tiktok_link?: string
  youtube_link?: string
  dzen_link?: string
  logo_id?: number
  cover_photo_id?: number
  category_ids?: number[]
}

export interface UpdateVenueResponse {
  id: number
  user_id: number
  name: string
  description: string
  address: string
  phone: string
  work_email: string
  logo_id: number
  cover_photo_id: number
  tg_personal_link: string
  tg_channel_link: string
  vk_link: string
  tiktok_link: string
  youtube_link: string
  dzen_link: string
  created_at: string
  updated_at: string
}

export interface VenueListItem {
  id: number
  user_id: number
  name: string
  description?: string
  address?: string
  street_address?: string
  phone?: string
  work_email?: string
  logo_id?: number
  cover_photo_id?: number
  logo?: { id: number; file_path: string }
  cover_photo?: { id: number; file_path: string }
  tg_personal_link?: string
  tg_channel_link?: string
  vk_link?: string
  tiktok_link?: string
  youtube_link?: string
  dzen_link?: string
  created_at: string
  updated_at: string
}

export interface VenueListResponse {
  data: VenueListItem[]
  total: number
  limit: number
  offset: number
}

export async function fetchVenues(
  token?: string | null,
  limit = 20,
  offset = 0,
): Promise<VenueListResponse> {
  const url = `${API_BASE_URL}/user/users/venues?limit=${limit}&offset=${offset}`
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const response = await fetch(url, { headers })
  const raw = await response.json().catch(() => ({}))

  console.log('=== Fetch Venues Response ===')
  console.log('Status:', response.status)
  console.log('Raw data:', raw)

  if (!response.ok) {
    throw new Error(JSON.stringify(raw))
  }

  const items: VenueListItem[] =
    raw.data ?? raw.venues ?? raw.items ?? (Array.isArray(raw) ? raw : [])
  const total: number =
    raw.total ?? raw.count ?? raw.total_count ?? items.length

  return { data: items, total, limit, offset }
}

export interface VenuePhoto {
  id: number
  venue_id: number
  image_id: number
  image: {
    id: number
    file_path: string
    bucket_name: string
  }
}

export interface VenueProfile {
  id: number
  user_id: number
  name: string
  description?: string
  street_address?: string
  address?: string
  phone?: string
  work_email?: string
  tg_personal_link?: string
  tg_channel_link?: string
  vk_link?: string
  tiktok_link?: string
  youtube_link?: string
  dzen_link?: string
  logo_id?: number
  cover_photo_id?: number
  logo?: { id: number; file_path: string; bucket_name: string }
  cover_photo?: { id: number; file_path: string; bucket_name: string }
  photos?: VenuePhoto[]
  created_at: string
  updated_at: string
}

export interface CreatorProfile {
  id: number
  user_id: number
  name: string
  description?: string
  phone?: string
  work_email?: string
  photo_id?: number
  photo?: { id: number; file_path: string; bucket_name: string }
  tg_personal_link?: string
  tg_channel_link?: string
  vk_link?: string
  tiktok_link?: string
  youtube_link?: string
  dzen_link?: string
  created_at: string
  updated_at: string
}

export async function fetchCreatorProfile(userId: number, token: string): Promise<CreatorProfile> {
  const response = await fetch(`${API_BASE_URL}/user/users/creators/${userId}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(JSON.stringify(data))
  return data
}

export async function fetchVenueProfile(userId: number, token: string): Promise<VenueProfile> {
  const response = await fetch(`${API_BASE_URL}/user/users/venues/${userId}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(JSON.stringify(data))
  return data
}

export async function updateVenueProfile(
  userId: number,
  data: UpdateVenueRequest,
  token: string,
): Promise<UpdateVenueResponse> {
  console.log('=== Update Venue Profile Request ===')
  console.log('URL:', `${API_BASE_URL}/user/users/venues/${userId}`)
  console.log('Data:', data)

  const response = await fetch(`${API_BASE_URL}/user/users/venues/${userId}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  const responseData = await response.json().catch(() => ({}))

  console.log('=== Update Venue Profile Response ===')
  console.log('Status:', response.status)
  console.log('Data:', responseData)

  if (!response.ok) {
    throw new Error(JSON.stringify(responseData))
  }

  return responseData
}
