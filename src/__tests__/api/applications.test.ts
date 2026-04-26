import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

vi.mock('../../api/apiClient', () => ({
  fetchWithAuth: vi.fn(),
}))

import { fetchWithAuth } from '../../api/apiClient'
import {
  fetchApplications,
  fetchApplicationById,
  createApplication,
  acceptApplication,
  rejectApplication,
  deleteApplication,
  fetchCollaborations,
  fetchCollaborationById,
  completeCollaboration,
  cancelCollaboration,
  fetchCollaborationPartners,
  fetchCompletedEventIds,
} from '../../api/applications'
import type { Application, Collaboration } from '../../api/applications'

const mockFetch = vi.mocked(fetchWithAuth)

function ok(body: unknown, status = 200): Promise<Response> {
  return Promise.resolve({ ok: true, status, json: () => Promise.resolve(body) } as unknown as Response)
}
function err(status = 400, body: unknown = {}): Promise<Response> {
  return Promise.resolve({ ok: false, status, json: () => Promise.resolve(body) } as unknown as Response)
}
function noContent(): Promise<Response> {
  return Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve(undefined) } as unknown as Response)
}

function app(o: Partial<Application> = {}): Application {
  return {
    id: 1, sender_id: 10, sender_type: 'creator',
    receiver_id: 20, receiver_type: 'venue',
    event_id: 5, message: '', status: 'pending',
    created_at: '', updated_at: '', ...o,
  }
}
function collab(o: Partial<Collaboration> = {}): Collaboration {
  return {
    id: 1, application_id: 1, event_id: 5,
    creator_user_id: 10, venue_user_id: 20, status: 'pending',
    created_at: '', updated_at: '', ...o,
  }
}

beforeEach(() => mockFetch.mockReset())
afterEach(() => vi.clearAllMocks())

describe('fetchApplications', () => {
  it('URL без query когда params пустой', async () => {
    mockFetch.mockReturnValue(ok([]))
    await fetchApplications({}, 'tok')
    expect(mockFetch.mock.calls[0][0]).toMatch(/\/applications$/)
  })

  it('добавляет role в query', async () => {
    mockFetch.mockReturnValue(ok([]))
    await fetchApplications({ role: 'receiver' }, 'tok')
    expect(mockFetch.mock.calls[0][0]).toContain('role=receiver')
  })

  it('добавляет status в query', async () => {
    mockFetch.mockReturnValue(ok([]))
    await fetchApplications({ status: 'accepted' }, 'tok')
    expect(mockFetch.mock.calls[0][0]).toContain('status=accepted')
  })

  it('добавляет limit и offset', async () => {
    mockFetch.mockReturnValue(ok([]))
    await fetchApplications({ limit: 5, offset: 10 }, 'tok')
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('limit=5')
    expect(url).toContain('offset=10')
  })

  it('нормализует массив-ответ', async () => {
    const apps = [app({ id: 1 }), app({ id: 2 })]
    mockFetch.mockReturnValue(ok(apps))
    expect(await fetchApplications({}, 'tok')).toEqual(apps)
  })

  it('нормализует { data: [...] }', async () => {
    const apps = [app({ id: 3 })]
    mockFetch.mockReturnValue(ok({ data: apps }))
    expect(await fetchApplications({}, 'tok')).toEqual(apps)
  })

  it('бросает при 403', async () => {
    mockFetch.mockReturnValue(err(403))
    await expect(fetchApplications({}, 'tok')).rejects.toThrow()
  })
})

describe('fetchApplicationById', () => {
  it('GET /applications/{id}', async () => {
    const a = app({ id: 7 })
    mockFetch.mockReturnValue(ok(a))
    const result = await fetchApplicationById(7, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/applications/7'), expect.any(Object))
    expect(result).toEqual(a)
  })
})

describe('createApplication', () => {
  it('POST /applications с телом', async () => {
    const a = app({ id: 10 })
    mockFetch.mockReturnValue(ok(a))
    const result = await createApplication(
      { receiver_id: 20, receiver_type: 'venue', event_id: 5, message: 'Hi' },
      'tok',
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/applications'),
      expect.objectContaining({ method: 'POST' }),
    )
    expect(result).toEqual(a)
  })
})

describe('acceptApplication', () => {
  it('PATCH /applications/{id}/accept', async () => {
    mockFetch.mockReturnValue(ok(app({ id: 3, status: 'accepted' })))
    const result = await acceptApplication(3, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/applications/3/accept'),
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(result.status).toBe('accepted')
  })
})

describe('rejectApplication', () => {
  it('PATCH /applications/{id}/reject', async () => {
    mockFetch.mockReturnValue(ok(app({ id: 4, status: 'rejected' })))
    await rejectApplication(4, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/applications/4/reject'),
      expect.objectContaining({ method: 'PATCH' }),
    )
  })
})

describe('deleteApplication', () => {
  it('DELETE /applications/{id}', async () => {
    mockFetch.mockReturnValue(noContent())
    await deleteApplication(5, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/applications/5'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})

describe('fetchCollaborations', () => {
  it('URL без query когда params пустой', async () => {
    mockFetch.mockReturnValue(ok([]))
    await fetchCollaborations({}, 'tok')
    expect(mockFetch.mock.calls[0][0]).toMatch(/\/collaborations$/)
  })

  it('добавляет status=completed', async () => {
    mockFetch.mockReturnValue(ok([]))
    await fetchCollaborations({ status: 'completed' }, 'tok')
    expect(mockFetch.mock.calls[0][0]).toContain('status=completed')
  })

  it('нормализует массив-ответ', async () => {
    const collabs = [collab({ id: 10 })]
    mockFetch.mockReturnValue(ok(collabs))
    expect(await fetchCollaborations({}, 'tok')).toEqual(collabs)
  })

  it('нормализует { data: [...] }', async () => {
    const collabs = [collab({ id: 11 })]
    mockFetch.mockReturnValue(ok({ data: collabs }))
    expect(await fetchCollaborations({}, 'tok')).toEqual(collabs)
  })
})

describe('fetchCollaborationById', () => {
  it('GET /collaborations/{id}', async () => {
    const c = collab({ id: 5 })
    mockFetch.mockReturnValue(ok(c))
    const result = await fetchCollaborationById(5, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/collaborations/5'), expect.any(Object))
    expect(result).toEqual(c)
  })
})

describe('completeCollaboration', () => {
  it('PATCH /collaborations/{id}/complete', async () => {
    mockFetch.mockReturnValue(ok(collab({ id: 6, status: 'completed' })))
    const result = await completeCollaboration(6, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/collaborations/6/complete'),
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(result.status).toBe('completed')
  })
})

describe('cancelCollaboration', () => {
  it('PATCH /collaborations/{id}/cancel', async () => {
    mockFetch.mockReturnValue(noContent())
    await cancelCollaboration(7, 'tok')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/collaborations/7/cancel'),
      expect.objectContaining({ method: 'PATCH' }),
    )
  })
})

describe('fetchCollaborationPartners', () => {
  it('возвращает массив id партнёров', async () => {
    mockFetch.mockReturnValue(ok([1, 2, 3]))
    expect(await fetchCollaborationPartners('tok')).toEqual([1, 2, 3])
  })

  it('нормализует { data: [...] }', async () => {
    mockFetch.mockReturnValue(ok({ data: [4, 5] }))
    expect(await fetchCollaborationPartners('tok')).toEqual([4, 5])
  })
})

describe('fetchCompletedEventIds', () => {
  it('возвращает ids из первого ключа Record', async () => {
    mockFetch.mockReturnValue(ok({ creator: [1, 2, 3] }))
    expect(await fetchCompletedEventIds(5, 'tok')).toEqual([1, 2, 3])
  })

  it('возвращает [] для пустого Record', async () => {
    mockFetch.mockReturnValue(ok({}))
    expect(await fetchCompletedEventIds(5, 'tok')).toEqual([])
  })

  it('URL содержит user_id', async () => {
    mockFetch.mockReturnValue(ok({}))
    await fetchCompletedEventIds(42, 'tok')
    expect(mockFetch.mock.calls[0][0]).toContain('user_id=42')
  })

  it('URL содержит completed-events', async () => {
    mockFetch.mockReturnValue(ok({}))
    await fetchCompletedEventIds(1, 'tok')
    expect(mockFetch.mock.calls[0][0]).toContain('completed-events')
  })
})
