import { API_BASE_URL, refreshAccessToken, apiLogout } from './auth'

type LogoutFn = () => void
type UpdateTokenFn = (token: string) => void
type GetAuthFn = () => { token: string | null; refreshToken: string | null }

let getAuth: GetAuthFn = () => ({ token: null, refreshToken: null })
let onUpdateToken: UpdateTokenFn = () => {}
let onLogout: LogoutFn = () => {}

export function initApiClient(
  authGetter: GetAuthFn,
  tokenUpdater: UpdateTokenFn,
  logoutHandler: LogoutFn,
) {
  getAuth = authGetter
  onUpdateToken = tokenUpdater
  onLogout = logoutHandler
}

let refreshPromise: Promise<string> | null = null

async function getValidToken(): Promise<string | null> {
  const { token } = getAuth()
  if (!token) return null

  return token
}

async function doRefresh(): Promise<string> {
  const { refreshToken } = getAuth()
  if (!refreshToken) throw new Error('No refresh token')

  const data = await refreshAccessToken(refreshToken)
  onUpdateToken(data.access_token)
  return data.access_token
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getValidToken()

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined ?? {}),
  }

  let response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
    try {
      if (!refreshPromise) {
        refreshPromise = doRefresh().finally(() => { refreshPromise = null })
      }
      const newToken = await refreshPromise

      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      }
      response = await fetch(url, { ...options, headers: retryHeaders })

      if (response.status === 401) {
        const { refreshToken } = getAuth()
        if (refreshToken) await apiLogout(refreshToken)
        onLogout()
      }
    } catch {
      const { refreshToken } = getAuth()
      if (refreshToken) await apiLogout(refreshToken).catch(() => {})
      onLogout()
    }
  }

  return response
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
  const response = await fetchWithAuth(url, options)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(JSON.stringify(data))
  return data as T
}
