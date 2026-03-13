import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchEvents, fetchCategories } from '../../api/events'
import { fetchImageUrl } from '../../api/auth'
import type { Event, Category } from '../../api/events'
import { Footer } from '../../components/layout/Footer'
import './EventsCatalogPage.css'

import heroBanner from '../../assets/icons/event_catalog/Frame 2131328070.png'
import midBannerBg from '../../assets/icons/event_catalog/Frame 2131328266.png'
import iconFire from '../../assets/icons/event_catalog/A_Button(small).png'

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
        <Link to={`/events/${event.id}`} className="myEventCard__titleLink">
          <p className="myEventCard__title">{event.title}</p>
        </Link>
        {cat && <span className="myEventCard__tag">{cat.name}</span>}
        {creatorName && (
          <Link to={`/creator/profile/${event.creator_id}`} className="myEventCard__creator">
            <div className="myEventCard__creatorAvatar">
              {creatorAvatarUrl
                ? <img src={creatorAvatarUrl} alt="" className="myEventCard__creatorImg" />
                : <div className="myEventCard__creatorPlaceholder" />}
            </div>
            <span className="myEventCard__creatorName">{creatorName}</span>
          </Link>
        )}
      </div>
    </div>
  )
}

function CatalogEventCard({ event, token, categories, isVenue }: {
  event: Event
  token: string | null
  categories: Category[]
  isVenue: boolean
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
        <Link to={`/events/${event.id}`} className="catalogCard__titleLink">
          <h3 className="catalogCard__title">{event.title}</h3>
        </Link>
        {cat && <span className="catalogCard__tag">{cat.name}</span>}
        {event.description && (
          <p className="catalogCard__desc">{event.description}</p>
        )}
        {creatorName && (
          <Link to={`/creator/profile/${event.creator_id}`} className="catalogCard__creator">
            <div className="catalogCard__creatorAvatar">
              {creatorAvatarUrl
                ? <img src={creatorAvatarUrl} alt="" className="catalogCard__creatorImg" />
                : <div className="catalogCard__creatorPlaceholder" />}
            </div>
            <span className="catalogCard__creatorName">{creatorName}</span>
          </Link>
        )}
        {isVenue && (
          <div className="catalogCard__actions">
            <button type="button" className="catalogCard__saveBtn">Сохранить</button>
            <button type="button" className="catalogCard__proposeBtn">Предложить мероприятие</button>
          </div>
        )}
      </div>
    </div>
  )
}

function FeaturedEventCard({ event, token, categories }: {
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
    <div className="featuredCard">
      <div className="featuredCard__cover">
        {coverUrl
          ? <img src={coverUrl} alt={event.title} className="featuredCard__coverImg" />
          : <div className="featuredCard__coverPlaceholder" />}
      </div>
      <div className="featuredCard__body">
        <Link to={`/events/${event.id}`} className="featuredCard__titleLink">
          <h3 className="featuredCard__title">{event.title}</h3>
        </Link>
        {cat && <span className="featuredCard__tag">{cat.name}</span>}
        {event.description && (
          <p className="featuredCard__desc">{event.description}</p>
        )}
        {creatorName && (
          <Link to={`/creator/profile/${event.creator_id}`} className="featuredCard__creator">
            <div className="featuredCard__creatorAvatar">
              {creatorAvatarUrl
                ? <img src={creatorAvatarUrl} alt="" className="featuredCard__creatorImg" />
                : <div className="featuredCard__creatorPlaceholder" />}
            </div>
            <span className="featuredCard__creatorName">{creatorName}</span>
          </Link>
        )}
      </div>
    </div>
  )
}

function MidBannerRow({ event, token, categories }: {
  event: Event | null
  token: string | null
  categories: Category[]
}) {
  return (
    <div className="eventsMidBanner">
      <img src={midBannerBg} alt="" className="eventsMidBanner__bg" />

      <div className="eventsMidBanner__left">
        <p className="eventsMidBanner__text">Тут надо заменить<br />текст на другой</p>
        <button type="button" className="eventsMidBanner__btn">Перейти →</button>
      </div>

      <div className="eventsMidBanner__right">
        <img src={iconFire} alt="" className="eventsMidBanner__icon" />
        {event && (
          <div className="eventsMidBanner__card">
            <FeaturedEventCard event={event} token={token} categories={categories} />
          </div>
        )}
      </div>
    </div>
  )
}

const PAGE_SIZE = 4

export function EventsCatalogPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const isCreator = user?.role === 'creator'
  const isVenue = user?.role === 'venue'

  const [categories, setCategories] = useState<Category[]>([])
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isLoading, setIsLoading] = useState(true)

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
    setVisibleCount(PAGE_SIZE)
    fetchEvents({ status: 'published' }, token)
      .then(events => setAllEvents(events))
      .catch(() => setAllEvents([]))
      .finally(() => setIsLoading(false))
  }, [token])

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -260, behavior: 'smooth' })
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 260, behavior: 'smooth' })

  const hasMore = visibleCount + 1 < allEvents.length

  return (
    <div className="eventsCatalog">
      <div className="eventsCatalog__content">

        <img
          src={heroBanner}
          alt="Мероприятия под любой вайб и цели"
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
                <MyEventCard key={event.id} event={event} token={token!} categories={categories} />
              ))}
            </div>
          </section>
        )}

        <section className="eventsCatalog__catalog">
          {isLoading ? (
            <div className="eventsCatalog__loading">Загрузка...</div>
          ) : allEvents.length === 0 ? (
            <div className="eventsCatalog__empty">Мероприятия не найдены</div>
          ) : (
            <>
              <MidBannerRow event={allEvents[0] ?? null} token={token} categories={categories} />

              <div className="eventsCatalog__grid">
                {allEvents.slice(1, visibleCount + 1).map(event => (
                  <CatalogEventCard
                    key={event.id}
                    event={event}
                    token={token}
                    categories={categories}
                    isVenue={isVenue}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="eventsCatalog__loadMore">
                  <button
                    type="button"
                    className="eventsCatalog__loadMoreBtn"
                    onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  >
                    Загрузить ещё
                  </button>
                </div>
              )}
            </>
          )}
        </section>

      </div>
      <Footer />
    </div>
  )
}
