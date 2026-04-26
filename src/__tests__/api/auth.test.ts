import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('../../api/apiClient', () => ({
  fetchWithAuth: vi.fn(),
}))

import { fetchWithAuth } from '../../api/apiClient'
import {
  login,
  registerCreator,
  registerVenue,
  uploadImage,
  updateCreatorProfile,
  updateVenueProfile,
  fetchVenueProfile,
  fetchCreatorProfile,
  fetchUserProfile,
  refreshAccessToken,
  addVenuePhoto,
  addCreatorPhoto,
  deleteCreatorPhoto,
  fetchVenues,
  fetchCreators,
  fetchPublicVenues,
  fetchPublicCreators,
  fetchPublicVenueProfile,
  fetchPublicCreatorProfile,
  fetchFavoriteVenues,
  addFavoriteVenue,
  removeFavoriteVenue,
  subscribeNewsletter,
  apiLogout,
  fetchImageUrl,
} from '../../api/auth'

const mockFetchWithAuth = vi.mocked(fetchWithAuth)

let mockFetch: Mock

beforeEach(() => {
  mockFetch = vi.fn()
  vi.stubGlobal('fetch', mockFetch)
  mockFetchWithAuth.mockReset()
})
afterEach(() => vi.unstubAllGlobals())

function ok(body: unknown, status = 200) {
  return Promise.resolve({ ok: true, status, json: () => Promise.resolve(body), headers: new Headers() })
}
function bad(status = 400, body: unknown = {}) {
  return Promise.resolve({ ok: false, status, json: () => Promise.resolve(body), headers: new Headers() })
}

describe('login', () => {
  it('POST /user/auth/login с credentials', async () => {
    const resp = { access_token: 'tok', refresh_token: 'r', expires_in: 3600, token_type: 'Bearer', user: {} }
    mockFetch.mockReturnValue(ok(resp))
    const result = await login({ email: 'a@b.com', password: 'pass' })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/user/auth/login'),
      expect.objectContaining({ method: 'POST' }),
    )
    expect(result.access_token).toBe('tok')
  })

  it('бросает при неверных credentials', async () => {
    mockFetch.mockReturnValue(bad(401, { errors: [{ code: 'INVALID_CREDENTIALS' }] }))
    await expect(login({ email: 'x@x.com', password: 'wrong' })).rejects.toThrow()
  })
})

describe('registerCreator', () => {
  it('POST /user/auth/register/creator', async () => {
    mockFetch.mockReturnValue(ok({ access_token: 'tok', refresh_token: 'r', expires_in: 3600, token_type: 'Bearer', user: {} }))
    const result = await registerCreator({ name: 'N', email: 'e@e.com', password: '12345678' })
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('register/creator'), expect.any(Object))
    expect(result.access_token).toBe('tok')
  })

  it('бросает при дублирующемся email', async () => {
    mockFetch.mockReturnValue(bad(409, { errors: [{ code: 'EMAIL_ALREADY_EXISTS' }] }))
    await expect(registerCreator({ name: 'N', email: 'dup@e.com', password: 'pass' })).rejects.toThrow()
  })
})

describe('registerVenue', () => {
  it('POST /user/auth/register/venue', async () => {
    mockFetch.mockReturnValue(ok({ access_token: 'v', refresh_token: 'r', expires_in: 3600, token_type: 'Bearer', user: {} }))
    await registerVenue({ name: 'Venue', email: 'v@v.com', password: 'pass1234' })
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('register/venue'), expect.any(Object))
  })
})

describe('uploadImage', () => {
  it('POST /user/users/upload с FormData', async () => {
    const imgResp = { id: 'img-1', file_path: 'path', bucket_name: 'b', file_name: 'f', file_type: 'image/png', image_type: 'avatar', created_at: '' }
    mockFetch.mockReturnValue(ok(imgResp))
    const file = new File([''], 'photo.png', { type: 'image/png' })
    const result = await uploadImage(file, 'avatar', 'tok')
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/users/upload'), expect.any(Object))
    expect(result.id).toBe('img-1')
  })
})

describe('updateCreatorProfile', () => {
  it('PUT /user/users/creators/{userId}', async () => {
    const profile = { id: 1, user_id: 10, name: 'New', description: '', phone: '', work_email: '', photo_id: '', tg_personal_link: '', tg_channel_link: '', vk_link: '', tiktok_link: '', youtube_link: '', dzen_link: '', created_at: '', updated_at: '' }
    mockFetch.mockReturnValue(ok(profile))
    const result = await updateCreatorProfile(10, { name: 'New' }, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/creators/10'), expect.objectContaining({ method: 'PUT' }))
    expect(result.name).toBe('New')
  })
})

describe('updateVenueProfile', () => {
  it('PUT /user/users/venues/{userId}', async () => {
    const venue = { id: 1, user_id: 20, name: 'V', description: '', address: '', phone: '', work_email: '', logo_id: '', cover_photo_id: '', tg_personal_link: '', tg_channel_link: '', vk_link: '', tiktok_link: '', youtube_link: '', dzen_link: '', created_at: '', updated_at: '' }
    mockFetch.mockReturnValue(ok(venue))
    await updateVenueProfile(20, { name: 'V' }, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/venues/20'), expect.objectContaining({ method: 'PUT' }))
  })
})

describe('fetchVenueProfile', () => {
  it('GET /user/users/venues/{userId} с токеном', async () => {
    const venue = { id: 1, user_id: 2, name: 'V', created_at: '', updated_at: '' }
    mockFetch.mockReturnValue(ok(venue))
    const result = await fetchVenueProfile(2, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/venues/2'), expect.any(Object))
    expect(result.name).toBe('V')
  })
})

describe('fetchCreatorProfile', () => {
  it('GET /user/users/creators/{userId}', async () => {
    const creator = { id: 1, user_id: 3, name: 'C', created_at: '', updated_at: '' }
    mockFetch.mockReturnValue(ok(creator))
    const result = await fetchCreatorProfile(3, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/creators/3'), expect.any(Object))
    expect(result.name).toBe('C')
  })
})

describe('fetchUserProfile', () => {
  it('GET /user/users/me', async () => {
    const me = { user_id: 5, email: 'me@me.com', role: 'creator' }
    mockFetch.mockReturnValue(ok(me))
    const result = await fetchUserProfile('tok')
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/users/me'), expect.any(Object))
    expect(result.email).toBe('me@me.com')
  })
})

describe('refreshAccessToken', () => {
  it('POST /user/auth/refresh с refresh_token', async () => {
    const resp = { access_token: 'new-tok', expires_in: 3600, token_type: 'Bearer' }
    mockFetch.mockReturnValue(ok(resp))
    const result = await refreshAccessToken('old-refresh')
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('auth/refresh'), expect.any(Object))
    expect(result.access_token).toBe('new-tok')
  })

  it('бросает при невалидном refresh token', async () => {
    mockFetch.mockReturnValue(bad(401))
    await expect(refreshAccessToken('invalid')).rejects.toThrow()
  })
})

describe('addVenuePhoto', () => {
  it('POST /user/users/venues/photos', async () => {
    const photo = { id: 1, venue_id: 1, image_id: 'img', image: { id: 'img', file_path: '', bucket_name: '' } }
    mockFetch.mockReturnValue(ok(photo))
    const result = await addVenuePhoto('img-id', 'tok')
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('venues/photos'), expect.objectContaining({ method: 'POST' }))
    expect(result.image_id).toBe('img')
  })
})

describe('addCreatorPhoto', () => {
  it('POST /user/users/creators/photos', async () => {
    const photo = { id: 2, creator_id: 1, image_id: 'img2', image: { id: 'img2', file_path: '', bucket_name: '' } }
    mockFetch.mockReturnValue(ok(photo))
    const result = await addCreatorPhoto('img2', 'tok')
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('creators/photos'), expect.objectContaining({ method: 'POST' }))
    expect(result.image_id).toBe('img2')
  })
})

describe('deleteCreatorPhoto', () => {
  it('DELETE /user/users/creators/photos/{id}', async () => {
    mockFetch.mockReturnValue(Promise.resolve({ ok: true, status: 204 }))
    await deleteCreatorPhoto(5, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/creators/photos/5'), expect.objectContaining({ method: 'DELETE' }))
  })
})

describe('fetchVenues', () => {
  const venue = { id: 1, user_id: 10, name: 'V', created_at: '', updated_at: '' }

  it('нормализует { data: [] }', async () => {
    mockFetch.mockReturnValue(ok({ data: [venue], total: 1 }))
    const result = await fetchVenues(null)
    expect(result.data[0].name).toBe('V')
    expect(result.total).toBe(1)
  })

  it('нормализует массив-ответ', async () => {
    mockFetch.mockReturnValue(ok([venue]))
    expect((await fetchVenues(null)).data).toHaveLength(1)
  })

  it('добавляет Authorization header с токеном', async () => {
    mockFetch.mockReturnValue(ok({ data: [], total: 0 }))
    await fetchVenues('my-token')
    const headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer my-token')
  })

  it('не добавляет Authorization без токена', async () => {
    mockFetch.mockReturnValue(ok({ data: [], total: 0 }))
    await fetchVenues(null)
    const headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>
    expect(headers['Authorization']).toBeUndefined()
  })

  it('передаёт limit и offset в URL', async () => {
    mockFetch.mockReturnValue(ok({ data: [], total: 0 }))
    await fetchVenues(null, 5, 15)
    expect(mockFetch.mock.calls[0][0]).toContain('limit=5')
    expect(mockFetch.mock.calls[0][0]).toContain('offset=15')
  })
})

describe('fetchCreators', () => {
  const creator = { id: 2, user_id: 20, name: 'C', created_at: '', updated_at: '' }

  it('нормализует { data: [] }', async () => {
    mockFetch.mockReturnValue(ok({ data: [creator], total: 3 }))
    const result = await fetchCreators(null)
    expect(result.data[0].name).toBe('C')
    expect(result.total).toBe(3)
  })

  it('нормализует { creators: [] }', async () => {
    mockFetch.mockReturnValue(ok({ creators: [creator], total: 5 }))
    expect((await fetchCreators(null)).data).toHaveLength(1)
  })

  it('fallback: total = длина массива', async () => {
    mockFetch.mockReturnValue(ok({ data: [creator, creator] }))
    expect((await fetchCreators(null)).total).toBe(2)
  })
})

describe('fetchPublicVenues', () => {
  it('обращается к public/venues', async () => {
    mockFetch.mockReturnValue(ok({ data: [], total: 0 }))
    await fetchPublicVenues()
    expect(mockFetch.mock.calls[0][0]).toContain('public/venues')
  })
})

describe('fetchPublicCreators', () => {
  it('обращается к public/creators', async () => {
    mockFetch.mockReturnValue(ok({ data: [], total: 0 }))
    await fetchPublicCreators()
    expect(mockFetch.mock.calls[0][0]).toContain('public/creators')
  })
})

describe('fetchPublicVenueProfile', () => {
  it('GET public/venues/{id} без авторизации', async () => {
    const v = { id: 1, user_id: 2, name: 'PV', created_at: '', updated_at: '' }
    mockFetch.mockReturnValue(ok(v))
    const result = await fetchPublicVenueProfile(2)
    expect(mockFetch.mock.calls[0][0]).toContain('public/venues/2')
    expect(result.name).toBe('PV')
  })
})

describe('fetchPublicCreatorProfile', () => {
  it('GET public/creators/{id} без авторизации', async () => {
    const c = { id: 1, user_id: 3, name: 'PC', created_at: '', updated_at: '' }
    mockFetch.mockReturnValue(ok(c))
    const result = await fetchPublicCreatorProfile(3)
    expect(mockFetch.mock.calls[0][0]).toContain('public/creators/3')
    expect(result.name).toBe('PC')
  })
})

describe('fetchFavoriteVenues', () => {
  it('возвращает список избранных площадок', async () => {
    const venues = [{ id: 1, user_id: 1, name: 'FV', created_at: '', updated_at: '' }]
    mockFetch.mockReturnValue(ok(venues))
    const result = await fetchFavoriteVenues('tok')
    expect(result).toEqual(venues)
  })

  it('возвращает [] при ошибке', async () => {
    mockFetch.mockReturnValue(bad(500))
    expect(await fetchFavoriteVenues('tok')).toEqual([])
  })
})

describe('addFavoriteVenue', () => {
  it('PUT /me/favorites/venues/{userId}', async () => {
    mockFetch.mockReturnValue(ok({}))
    await addFavoriteVenue(7, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/favorites/venues/7'),
      expect.objectContaining({ method: 'PUT' }),
    )
  })
})

describe('removeFavoriteVenue', () => {
  it('DELETE /me/favorites/venues/{userId}', async () => {
    mockFetch.mockReturnValue(ok({}))
    await removeFavoriteVenue(7, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/favorites/venues/7'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})

describe('subscribeNewsletter', () => {
  it('POST /user/newsletter/subscribe с email', async () => {
    mockFetch.mockReturnValue(ok({}))
    await subscribeNewsletter('user@mail.com')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('newsletter/subscribe'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'user@mail.com' }) }),
    )
  })
})

describe('apiLogout', () => {
  it('POST /user/auth/logout с refresh_token', async () => {
    mockFetch.mockReturnValue(ok({}))
    await apiLogout('refresh-tok')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('auth/logout'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('не бросает ошибку при сетевой проблеме', async () => {
    mockFetch.mockRejectedValue(new Error('Network'))
    await expect(apiLogout('tok')).resolves.toBeUndefined()
  })
})

describe('fetchImageUrl', () => {
  it('возвращает blob URL при успешном ответе', async () => {
    const fakeBlob = new Blob(['img-data'], { type: 'image/png' })
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      headers: { get: () => 'image/png' },
      blob: () => Promise.resolve(fakeBlob),
    } as unknown as Response)
    const url = await fetchImageUrl('img-123')
    expect(mockFetchWithAuth).toHaveBeenCalledWith(expect.stringContaining('img-123'), expect.any(Object))
    expect(url).toBe('blob:mock-url')
  })

  it('бросает при не-ok ответе', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: { get: () => null },
    } as unknown as Response)
    await expect(fetchImageUrl('missing')).rejects.toThrow('Image load failed')
  })
})
