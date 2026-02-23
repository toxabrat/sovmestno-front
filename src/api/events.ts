const EVENT_API_BASE = `${import.meta.env.VITE_API_URL ?? ''}/api/event`

export interface Category {
  id: number
  name: string
  created_at: string
}

export interface Event {
  id: number
  creator_id: number
  title: string
  description: string
  cover_photo_id?: number
  category_ids?: number[]
  status: 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface CreateEventRequest {
  title: string
  description?: string
  cover_photo_id?: number
  category_ids?: number[]
}

export interface UpdateEventRequest {
  title?: string
  description?: string
  cover_photo_id?: number
  category_ids?: number[]
}


async function request<T>(
  url: string,
  options: RequestInit,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(url, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(JSON.stringify(data))
  }
  return data as T
}

export async function fetchCategories(token?: string | null): Promise<Category[]> {
  const raw = await request<Category[] | { categories?: Category[]; data?: Category[] }>(
    `${EVENT_API_BASE}/categories`,
    { method: 'GET' },
    token,
  )
  if (Array.isArray(raw)) return raw
  return (raw as { categories?: Category[] }).categories ??
    (raw as { data?: Category[] }).data ??
    []
}

export interface FetchEventsParams {
  creator_id?: number
  status?: 'published' | 'archived'
  category_id?: number
}

export async function fetchEvents(
  params?: FetchEventsParams,
  token?: string | null,
): Promise<Event[]> {
  const query = new URLSearchParams()
  if (params?.creator_id) query.set('creator_id', String(params.creator_id))
  if (params?.status) query.set('status', params.status)
  if (params?.category_id) query.set('category_id', String(params.category_id))

  const url = `${EVENT_API_BASE}/events${query.toString() ? `?${query}` : ''}`

  const raw = await request<Event[] | { events?: Event[]; data?: Event[] }>(
    url,
    { method: 'GET' },
    token,
  )

  if (Array.isArray(raw)) return raw
  return (raw as { events?: Event[]; data?: Event[] }).events ??
    (raw as { data?: Event[] }).data ??
    []
}

export async function fetchEventById(id: number, token?: string | null): Promise<Event> {
  return request<Event>(
    `${EVENT_API_BASE}/events/${id}`,
    { method: 'GET' },
    token,
  )
}

export async function createEvent(
  data: CreateEventRequest,
  token: string,
): Promise<Event> {
  return request<Event>(
    `${EVENT_API_BASE}/events`,
    { method: 'POST', body: JSON.stringify(data) },
    token,
  )
}

export async function updateEvent(
  id: number,
  data: UpdateEventRequest,
  token: string,
): Promise<Event> {
  return request<Event>(
    `${EVENT_API_BASE}/events/${id}`,
    { method: 'PUT', body: JSON.stringify(data) },
    token,
  )
}

export async function deleteEvent(id: number, token: string): Promise<void> {
  await request<unknown>(
    `${EVENT_API_BASE}/events/${id}`,
    { method: 'DELETE' },
    token,
  )
}

export async function archiveEvent(id: number, token: string): Promise<void> {
  await request<unknown>(
    `${EVENT_API_BASE}/events/${id}/archive`,
    { method: 'PATCH' },
    token,
  )
}

export async function publishEvent(id: number, token: string): Promise<void> {
  await request<unknown>(
    `${EVENT_API_BASE}/events/${id}/publish`,
    { method: 'PATCH' },
    token,
  )
}
