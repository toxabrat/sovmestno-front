import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

vi.mock('../../api/apiClient', () => ({
  fetchWithAuth: vi.fn(),
}))

import { fetchWithAuth } from '../../api/apiClient'
import {
  fetchCategories,
  fetchEvents,
  fetchEventById,
  fetchEventsBatch,
  createEvent,
  updateEvent,
  deleteEvent,
  archiveEvent,
  publishEvent,
  fetchPublicEvents,
  fetchFavoriteEvents,
  addFavoriteEvent,
  removeFavoriteEvent,
} from '../../api/events'
import type { Event } from '../../api/events'

const mockFetch = vi.mocked(fetchWithAuth)

function ok(body: unknown): Promise<Response> {
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as unknown as Response)
}
function err(status = 400, body: unknown = {}): Promise<Response> {
  return Promise.resolve({ ok: false, status, json: () => Promise.resolve(body) } as unknown as Response)
}

function event(overrides: Partial<Event> = {}): Event {
  return {
    id: 1, creator_id: 10, title: 'T', description: 'D',
    is_active: true, is_completed: false,
    created_at: '', updated_at: '', ...overrides,
  }
}

beforeEach(() => mockFetch.mockReset())
afterEach(() => vi.clearAllMocks())

describe('fetchCategories', () => {
  it('возвращает массив категорий напрямую', async () => {
    const cats = [{ id: 1, name: 'Музыка', created_at: '' }]
    mockFetch.mockReturnValue(ok(cats))
    expect(await fetchCategories()).toEqual(cats)
  })

  it('извлекает поле categories из объекта', async () => {
    const cats = [{ id: 2, name: 'Арт', created_at: '' }]
    mockFetch.mockReturnValue(ok({ categories: cats }))
    expect(await fetchCategories()).toEqual(cats)
  })

  it('извлекает поле data из объекта', async () => {
    const cats = [{ id: 3, name: 'Кино', created_at: '' }]
    mockFetch.mockReturnValue(ok({ data: cats }))
    expect(await fetchCategories()).toEqual(cats)
  })
})

describe('fetchEventsBatch', () => {
  it('возвращает [] без запроса когда ids пустой', async () => {
    expect(await fetchEventsBatch([])).toEqual([])
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('строит URL с ids через запятую', async () => {
    mockFetch.mockReturnValue(ok([]))
    await fetchEventsBatch([1, 2, 3])
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('ids=1,2,3'), expect.any(Object))
  })

  it('нормализует массив-ответ', async () => {
    const ev = [event({ id: 5 })]
    mockFetch.mockReturnValue(ok(ev))
    expect(await fetchEventsBatch([5])).toEqual(ev)
  })

  it('нормализует { events: [...] }', async () => {
    const ev = [event({ id: 6 })]
    mockFetch.mockReturnValue(ok({ events: ev }))
    expect(await fetchEventsBatch([6])).toEqual(ev)
  })

  it('нормализует { data: [...] }', async () => {
    const ev = [event({ id: 7 })]
    mockFetch.mockReturnValue(ok({ data: ev }))
    expect(await fetchEventsBatch([7])).toEqual(ev)
  })
})

describe('fetchEvents', () => {
  it('без параметров — URL заканчивается на /events', async () => {
    mockFetch.mockReturnValue(ok([]))
    await fetchEvents()
    expect(mockFetch.mock.calls[0][0]).toMatch(/\/events$/)
  })

  it('добавляет creator_id', async () => {
    mockFetch.mockReturnValue(ok([]))
    await fetchEvents({ creator_id: 42 })
    expect(mockFetch.mock.calls[0][0]).toContain('creator_id=42')
  })

  it('добавляет is_active и is_completed', async () => {
    mockFetch.mockReturnValue(ok([]))
    await fetchEvents({ is_active: true, is_completed: false })
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('is_active=true')
    expect(url).toContain('is_completed=false')
  })

  it('добавляет limit и offset', async () => {
    mockFetch.mockReturnValue(ok([]))
    await fetchEvents({ limit: 10, offset: 20 })
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('limit=10')
    expect(url).toContain('offset=20')
  })

  it('нормализует { events: [...] }', async () => {
    const ev = [event()]
    mockFetch.mockReturnValue(ok({ events: ev }))
    expect(await fetchEvents()).toEqual(ev)
  })

  it('бросает ошибку при 404', async () => {
    mockFetch.mockReturnValue(err(404))
    await expect(fetchEvents()).rejects.toThrow()
  })
})

describe('fetchEventById', () => {
  it('вызывает /events/{id}', async () => {
    const ev = event({ id: 10 })
    mockFetch.mockReturnValue(ok(ev))
    const result = await fetchEventById(10)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/events/10'), expect.any(Object))
    expect(result).toEqual(ev)
  })

  it('бросает при ошибке', async () => {
    mockFetch.mockReturnValue(err(404))
    await expect(fetchEventById(999)).rejects.toThrow()
  })
})

describe('createEvent', () => {
  it('POST /events с JSON телом', async () => {
    const ev = event({ id: 20, title: 'New' })
    mockFetch.mockReturnValue(ok(ev))
    const result = await createEvent({ title: 'New', description: 'Desc' }, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/events'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ title: 'New', description: 'Desc' }) }),
    )
    expect(result).toEqual(ev)
  })
})

describe('updateEvent', () => {
  it('PUT /events/{id} с данными', async () => {
    const ev = event({ id: 5, title: 'Updated' })
    mockFetch.mockReturnValue(ok(ev))
    const result = await updateEvent(5, { title: 'Updated' }, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/events/5'),
      expect.objectContaining({ method: 'PUT' }),
    )
    expect(result.title).toBe('Updated')
  })
})

describe('deleteEvent', () => {
  it('DELETE /events/{id}', async () => {
    mockFetch.mockReturnValue(ok(null))
    await deleteEvent(3, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/events/3'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})

describe('archiveEvent', () => {
  it('PATCH /events/{id}/archive', async () => {
    mockFetch.mockReturnValue(ok(null))
    await archiveEvent(4, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/events/4/archive'),
      expect.objectContaining({ method: 'PATCH' }),
    )
  })
})

describe('publishEvent', () => {
  it('PATCH /events/{id}/publish', async () => {
    mockFetch.mockReturnValue(ok(null))
    await publishEvent(4, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/events/4/publish'),
      expect.objectContaining({ method: 'PATCH' }),
    )
  })
})

describe('fetchPublicEvents', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('обращается к public/events эндпоинту без авторизации', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve([]),
    }))
    await fetchPublicEvents()
    expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
      expect.stringContaining('public/events'),
      expect.any(Object),
    )
  })

  it('нормализует массив-ответ', async () => {
    const ev = [event({ id: 99 })]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve(ev),
    }))
    expect(await fetchPublicEvents()).toEqual(ev)
  })
})

describe('fetchFavoriteEvents', () => {
  it('GET /events/favorites', async () => {
    const ev = [event({ id: 50 })]
    mockFetch.mockReturnValue(ok(ev))
    const result = await fetchFavoriteEvents('tok')
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('favorites'), expect.any(Object))
    expect(result).toEqual(ev)
  })

  it('возвращает [] при ошибке', async () => {
    mockFetch.mockReturnValue(err(500))
    expect(await fetchFavoriteEvents('tok')).toEqual([])
  })
})

describe('addFavoriteEvent', () => {
  it('PUT /events/favorites/{id}', async () => {
    mockFetch.mockReturnValue(ok(null))
    await addFavoriteEvent(7, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/favorites/7'),
      expect.objectContaining({ method: 'PUT' }),
    )
  })
})

describe('removeFavoriteEvent', () => {
  it('DELETE /events/favorites/{id}', async () => {
    mockFetch.mockReturnValue(ok(null))
    await removeFavoriteEvent(7, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/favorites/7'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})
