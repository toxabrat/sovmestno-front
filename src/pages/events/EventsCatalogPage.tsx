import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchEvents, fetchCategories } from '../../api/events'
import { fetchImageUrl } from '../../api/auth'
import type { Event, Category } from '../../api/events'
import './EventsCatalogPage.css'

import heroBanner from '../../assets/events_list/Frame 2131327750(1).png'


const creatorCache: Record<number, { name: string; avatarId?: number }> = {}

async function getCreatorInfo(
  creatorId: number,
  token: string,
): Promise<{ name: string; avatarId?: number }> {
  if (creatorCache[creatorId]) return creatorCache[creatorId]
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/user/users/creators/${creatorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error()
    const data = await res.json()
    const info = { name: data.name ?? 'Креатор', avatarId: data.photo_id ?? undefined }
    creatorCache[creatorId] = info
    return info
  } catch {
    return { name: 'Креатор' }
  }
}


function MyEventCard({ event, token, categories }: {
  event: Event
  token: string
  categories: Category[]
}) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [creatorName, setCreatorName] = useState<string>('')
  const [creatorAvatarUrl, setCreatorAvatarUrl] = useState<string | null>(null)
  const cat = categories.find(c => event.category_ids?.includes(c.id))

  useEffect(() => {
    let cancelled = false

    if (event.cover_photo_id) {
      fetchImageUrl(event.cover_photo_id, token)
        .then(url => { if (!cancelled) setCoverUrl(url) })
        .catch(() => {})
    }

    getCreatorInfo(event.creator_id, token).then(info => {
      if (cancelled) return
      setCreatorName(info.name)
      if (info.avatarId) {
        fetchImageUrl(info.avatarId, token)
          .then(url => { if (!cancelled) setCreatorAvatarUrl(url) })
          .catch(() => {})
      }
    })

    return () => { cancelled = true }
  }, [event.cover_photo_id, event.creator_id, token])

  return (
    <div className="myEventCard">
      <div className="myEventCard__cover">
        {coverUrl
          ? <img src={coverUrl} alt={event.title} className="myEventCard__coverImg" />
          : <div className="myEventCard__coverPlaceholder" />}
      </div>
      <div className="myEventCard__body">
        <p className="myEventCard__title">{event.title}</p>
        {cat && <span className="myEventCard__tag">{cat.name}</span>}
        {creatorName && (
          <div className="myEventCard__creator">
            <div className="myEventCard__creatorAvatar">
              {creatorAvatarUrl
                ? <img src={creatorAvatarUrl} alt="" className="myEventCard__creatorImg" />
                : <div className="myEventCard__creatorPlaceholder" />}
            </div>
            <span className="myEventCard__creatorName">{creatorName}</span>
          </div>
        )}
      </div>
    </div>
  )
}


function CatalogEventCard({ event, token, categories }: {
  event: Event
  token: string | null
  categories: Category[]
}) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [creatorName, setCreatorName] = useState<string>('')
  const [creatorAvatarUrl, setCreatorAvatarUrl] = useState<string | null>(null)

  const cat = categories.find(c => event.category_ids?.includes(c.id))

  useEffect(() => {
    if (!token) return
    let cancelled = false

    if (event.cover_photo_id) {
      fetchImageUrl(event.cover_photo_id, token)
        .then(url => { if (!cancelled) setCoverUrl(url) })
        .catch(() => {})
    }

    getCreatorInfo(event.creator_id, token).then(info => {
      if (cancelled) return
      setCreatorName(info.name)
      if (info.avatarId) {
        fetchImageUrl(info.avatarId, token)
          .then(url => { if (!cancelled) setCreatorAvatarUrl(url) })
          .catch(() => {})
      }
    })

    return () => { cancelled = true }
  }, [event.cover_photo_id, event.creator_id, token])

  return (
    <div className="catalogCard">
      <div className="catalogCard__cover">
        {coverUrl
          ? <img src={coverUrl} alt={event.title} className="catalogCard__coverImg" />
          : <div className="catalogCard__coverPlaceholder" />}
      </div>
      <div className="catalogCard__body">
        <h3 className="catalogCard__title">{event.title}</h3>
        {cat && <span className="catalogCard__tag">{cat.name}</span>}
        {event.description && (
          <p className="catalogCard__desc">{event.description}</p>
        )}
        {creatorName && (
          <div className="catalogCard__creator">
            <div className="catalogCard__creatorAvatar">
              {creatorAvatarUrl
                ? <img src={creatorAvatarUrl} alt="" className="catalogCard__creatorImg" />
                : <div className="catalogCard__creatorPlaceholder" />}
            </div>
            <span className="catalogCard__creatorName">{creatorName}</span>
          </div>
        )}
      </div>
    </div>
  )
}


const PAGE_SIZE = 6

export function EventsCatalogPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const isCreator = user?.role === 'creator'

  const [categories, setCategories] = useState<Category[]>([])
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [catalogEvents, setCatalogEvents] = useState<Event[]>([])
  const [allCatalogEvents, setAllCatalogEvents] = useState<Event[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCategories(token)
      .then(setCategories)
      .catch(err => console.error('Failed to fetch categories:', err))
  }, [token])

  useEffect(() => {
    if (!isCreator || !user?.id || !token) return
    fetchEvents({ creator_id: user.id }, token)
      .then(setMyEvents)
      .catch(err => console.error('Failed to fetch my events:', err))
  }, [isCreator, user?.id, token])

  useEffect(() => {
    setIsLoading(true)
    setPage(1)
    fetchEvents(
      {
        status: 'published',
        ...(activeCategory ? { category_id: activeCategory } : {}),
      },
      token,
    )
      .then(events => {
        setAllCatalogEvents(events)
        setCatalogEvents(events.slice(0, PAGE_SIZE))
      })
      .catch(err => {
        console.error('Failed to fetch events:', err)
        setCatalogEvents([])
        setAllCatalogEvents([])
      })
      .finally(() => setIsLoading(false))
  }, [token, activeCategory])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    setCatalogEvents(allCatalogEvents.slice(0, nextPage * PAGE_SIZE))
  }

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' })
  }
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })
  }

  const hasMore = catalogEvents.length < allCatalogEvents.length

  return (
    <div className="eventsCatalog">
      <div className="eventsCatalog__content">

        <img
          src={heroBanner}
          alt="Мероприятия под любой вайб заведения"
          className="eventsCatalog__heroBanner"
        />

        {isCreator && (
          <section className="eventsCatalog__mySection">
            <div className="eventsCatalog__myHeader">
              <h2 className="eventsCatalog__myTitle">Мои мероприятия</h2>
              <div className="eventsCatalog__myArrows">
                <button type="button" className="eventsCatalog__arrowBtn" onClick={scrollLeft} aria-label="Назад">‹</button>
                <button type="button" className="eventsCatalog__arrowBtn" onClick={scrollRight} aria-label="Вперёд">›</button>
              </div>
            </div>

            <div className="eventsCatalog__myScroll" ref={scrollRef}>
              <button
                type="button"
                className="myEventCard myEventCard--create"
                onClick={() => navigate('/events/create')}
              >
                <span className="myEventCard__plusIcon">+</span>
                <span className="myEventCard__createText">Создать<br />мероприятие</span>
              </button>

              {myEvents.map(event => (
                <MyEventCard
                  key={event.id}
                  event={event}
                  token={token!}
                  categories={categories}
                />
              ))}
            </div>
          </section>
        )}

        <section className="eventsCatalog__catalog">
          <h2 className="eventsCatalog__catalogTitle">Каталог мероприятий</h2>

          {categories.length > 0 && (
            <div className="eventsCatalog__filters">
              {categories.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`eventsCatalog__filterTag ${activeCategory === c.id ? 'eventsCatalog__filterTag--active' : ''}`}
                  onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="eventsCatalog__loading">Загрузка...</div>
          ) : catalogEvents.length === 0 ? (
            <div className="eventsCatalog__empty">Мероприятия не найдены</div>
          ) : (
            <>
              <div className="eventsCatalog__grid">
                {catalogEvents.map(event => (
                  <CatalogEventCard
                    key={event.id}
                    event={event}
                    token={token}
                    categories={categories}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="eventsCatalog__loadMore">
                  <button type="button" className="eventsCatalog__loadMoreBtn" onClick={handleLoadMore}>
                    Загрузить ещё
                  </button>
                </div>
              )}
            </>
          )}
        </section>

      </div>
    </div>
  )
}
