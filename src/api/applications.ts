import { fetchWithAuth } from './apiClient'

const APP_API_BASE = `${import.meta.env.VITE_API_URL ?? ''}/api/application`

export interface Application {
  id: number
  sender_id: number
  sender_type: 'creator' | 'venue'
  receiver_id: number
  receiver_type: 'creator' | 'venue'
  event_id: number
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Collaboration {
  id: number
  application_id: number
  event_id: number
  creator_user_id: number
  venue_user_id: number
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface CreateApplicationRequest {
  receiver_id: number
  receiver_type: 'creator' | 'venue'
  event_id: number
  message?: string
}

async function request<T>(
  url: string,
  options: RequestInit,
  _token?: string | null,
): Promise<T> {
  const res = await fetchWithAuth(url, options)

  if (res.status === 204) return undefined as T

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(JSON.stringify(data))
  return data as T
}


export interface FetchApplicationsParams {
  role?: 'sender' | 'receiver' | 'any'
  status?: 'pending' | 'accepted' | 'rejected'
  limit?: number
  offset?: number
}

export async function fetchApplications(
  params: FetchApplicationsParams,
  token: string,
): Promise<Application[]> {
  const query = new URLSearchParams()
  if (params.role) query.set('role', params.role)
  if (params.status) query.set('status', params.status)
  if (params.limit) query.set('limit', String(params.limit))
  if (params.offset) query.set('offset', String(params.offset))

  const url = `${APP_API_BASE}/applications${query.toString() ? `?${query}` : ''}`
  const raw = await request<Application[] | { data?: Application[] }>(url, { method: 'GET' }, token)
  if (Array.isArray(raw)) return raw
  return (raw as { data?: Application[] }).data ?? []
}

export async function fetchApplicationById(
  id: number,
  token: string,
): Promise<Application> {
  return request<Application>(
    `${APP_API_BASE}/applications/${id}`,
    { method: 'GET' },
    token,
  )
}

export async function createApplication(
  data: CreateApplicationRequest,
  token: string,
): Promise<Application> {
  return request<Application>(
    `${APP_API_BASE}/applications`,
    { method: 'POST', body: JSON.stringify(data) },
    token,
  )
}

export async function acceptApplication(
  id: number,
  token: string,
): Promise<Application> {
  return request<Application>(
    `${APP_API_BASE}/applications/${id}/accept`,
    { method: 'PATCH' },
    token,
  )
}

export async function rejectApplication(
  id: number,
  token: string,
): Promise<Application> {
  return request<Application>(
    `${APP_API_BASE}/applications/${id}/reject`,
    { method: 'PATCH' },
    token,
  )
}

export async function deleteApplication(
  id: number,
  token: string,
): Promise<void> {
  await request<unknown>(
    `${APP_API_BASE}/applications/${id}`,
    { method: 'DELETE' },
    token,
  )
}


export interface FetchCollaborationsParams {
  status?: 'pending' | 'completed' | 'cancelled'
  limit?: number
  offset?: number
}

export async function fetchCollaborations(
  params: FetchCollaborationsParams,
  token: string,
): Promise<Collaboration[]> {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.limit) query.set('limit', String(params.limit))
  if (params.offset) query.set('offset', String(params.offset))

  const url = `${APP_API_BASE}/collaborations${query.toString() ? `?${query}` : ''}`
  const raw = await request<Collaboration[] | { data?: Collaboration[] }>(url, { method: 'GET' }, token)
  if (Array.isArray(raw)) return raw
  return (raw as { data?: Collaboration[] }).data ?? []
}

export async function fetchCollaborationById(
  id: number,
  token: string,
): Promise<Collaboration> {
  return request<Collaboration>(
    `${APP_API_BASE}/collaborations/${id}`,
    { method: 'GET' },
    token,
  )
}

export async function completeCollaboration(
  id: number,
  token: string,
): Promise<Collaboration> {
  return request<Collaboration>(
    `${APP_API_BASE}/collaborations/${id}/complete`,
    { method: 'PATCH' },
    token,
  )
}

export async function cancelCollaboration(
  id: number,
  token: string,
): Promise<void> {
  await request<unknown>(
    `${APP_API_BASE}/collaborations/${id}/cancel`,
    { method: 'PATCH' },
    token,
  )
}

export async function fetchCollaborationPartners(
  token: string,
): Promise<number[]> {
  const raw = await request<number[] | { data?: number[] }>(
    `${APP_API_BASE}/collaborations/partners`,
    { method: 'GET' },
    token,
  )
  if (Array.isArray(raw)) return raw
  return (raw as { data?: number[] }).data ?? []
}
