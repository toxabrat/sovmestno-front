import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

vi.mock('../../api/auth', () => ({
  API_BASE_URL: '/api',
  refreshAccessToken: vi.fn(),
  apiLogout: vi.fn().mockResolvedValue(undefined),
}))

import { fetchWithAuth, apiFetch, initApiClient } from '../../api/apiClient'
import { refreshAccessToken, apiLogout } from '../../api/auth'

const mockRefreshAccessToken = vi.mocked(refreshAccessToken)
const mockApiLogout = vi.mocked(apiLogout)

function stubFetch(...responses: Array<{ ok: boolean; status: number; body?: unknown }>) {
  let call = 0
  vi.stubGlobal('fetch', vi.fn(() => {
    const r = responses[Math.min(call++, responses.length - 1)]
    return Promise.resolve({
      ok: r.ok,
      status: r.status,
      json: () => Promise.resolve(r.body ?? {}),
    })
  }))
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('fetchWithAuth', () => {
  const mockLogout = vi.fn()
  const mockUpdateToken = vi.fn()
  let tokenValue = 'access-tok'
  let refreshTokenValue: string | null = 'refresh-tok'

  beforeEach(() => {
    tokenValue = 'access-tok'
    refreshTokenValue = 'refresh-tok'
    mockLogout.mockReset()
    mockUpdateToken.mockReset()
    initApiClient(
      () => ({ token: tokenValue, refreshToken: refreshTokenValue }),
      mockUpdateToken,
      mockLogout,
    )
  })

  it('добавляет Authorization header когда есть токен', async () => {
    stubFetch({ ok: true, status: 200, body: {} })
    await fetchWithAuth('/api/test')
    const mockFetch = vi.mocked(global.fetch)
    const headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer access-tok')
  })

  it('добавляет Accept: application/json', async () => {
    stubFetch({ ok: true, status: 200 })
    await fetchWithAuth('/api/test')
    const mockFetch = vi.mocked(global.fetch)
    const headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>
    expect(headers['Accept']).toBe('application/json')
  })

  it('добавляет Content-Type для JSON body', async () => {
    stubFetch({ ok: true, status: 200 })
    await fetchWithAuth('/api/test', { method: 'POST', body: '{"x":1}' })
    const mockFetch = vi.mocked(global.fetch)
    const headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('не добавляет Content-Type для FormData body', async () => {
    stubFetch({ ok: true, status: 200 })
    await fetchWithAuth('/api/test', { method: 'POST', body: new FormData() })
    const mockFetch = vi.mocked(global.fetch)
    const headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>
    expect(headers['Content-Type']).toBeUndefined()
  })

  it('при 401 выполняет refresh и повторяет запрос', async () => {
    mockRefreshAccessToken.mockResolvedValueOnce({
      access_token: 'new-tok',
      expires_in: 3600,
      token_type: 'Bearer',
    })
    stubFetch(
      { ok: false, status: 401 },
      { ok: true, status: 200, body: { ok: true } },
    )
    await fetchWithAuth('/api/protected')
    expect(mockRefreshAccessToken).toHaveBeenCalledWith('refresh-tok')
    expect(mockUpdateToken).toHaveBeenCalledWith('new-tok')
    expect(vi.mocked(global.fetch)).toHaveBeenCalledTimes(2)
  })

  it('при 401 после refresh вызывает apiLogout и logout', async () => {
    mockRefreshAccessToken.mockResolvedValueOnce({
      access_token: 'new-tok',
      expires_in: 3600,
      token_type: 'Bearer',
    })
    stubFetch(
      { ok: false, status: 401 },
      { ok: false, status: 401 },
    )
    await fetchWithAuth('/api/protected')
    expect(mockApiLogout).toHaveBeenCalled()
    expect(mockLogout).toHaveBeenCalled()
  })

  it('при ошибке refresh вызывает logout', async () => {
    mockRefreshAccessToken.mockRejectedValueOnce(new Error('network error'))
    stubFetch({ ok: false, status: 401 })
    await fetchWithAuth('/api/protected')
    expect(mockLogout).toHaveBeenCalled()
  })

  it('возвращает Response как есть при успешном ответе', async () => {
    stubFetch({ ok: true, status: 200, body: { data: 42 } })
    const res = await fetchWithAuth('/api/test')
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
  })
})

describe('apiFetch', () => {
  beforeEach(() => {
    initApiClient(
      () => ({ token: null, refreshToken: null }),
      vi.fn(),
      vi.fn(),
    )
  })

  it('возвращает распарсенный JSON', async () => {
    stubFetch({ ok: true, status: 200, body: { value: 'hello' } })
    const data = await apiFetch<{ value: string }>('/test')
    expect(data.value).toBe('hello')
  })

  it('добавляет API_BASE_URL к относительным путям', async () => {
    stubFetch({ ok: true, status: 200, body: {} })
    await apiFetch('/some/path')
    const mockFetch = vi.mocked(global.fetch)
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toBe('/api/some/path')
  })

  it('использует URL как есть когда он начинается с http', async () => {
    stubFetch({ ok: true, status: 200, body: {} })
    await apiFetch('https://external.api/data')
    const mockFetch = vi.mocked(global.fetch)
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toBe('https://external.api/data')
  })

  it('бросает ошибку при не-ok ответе', async () => {
    stubFetch({ ok: false, status: 500, body: { message: 'Server error' } })
    await expect(apiFetch('/fail')).rejects.toThrow()
  })
})
