import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchEvents, fetchCategories } from '../../api/events'
import { fetchImageUrl, fetchCreators } from '../../api/auth'
import type { Event, Category } from '../../api/events'
import type { CreatorListItem } from '../../api/auth'
import { createApplication, fetchApplications } from '../../api/applications'
import type { Application } from '../../api/applications'
import { Footer } from '../../components/layout/Footer'
import './EventsCatalogPage.css'

import heroBannerBg from '../../assets/icons/event_catalog/Frame 2131328071.png'
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


function CreatorHighlight({ creator, token, categories }: {
  creator: CreatorListItem
  token: string | null
  categories: Category[]
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!token || !creator.photo_id) return
    fetchImageUrl(creator.photo_id).then(setPhotoUrl).catch(() => {})
  }, [creator.photo_id, token])

  return (
    <Link to={`/creator/profile/${creator.user_id}`} className="creatorHighlight" style={{ textDecoration: 'none' }}>
      <div className="creatorHighlight__avatar">
        {photoUrl ? <img src={photoUrl} alt="" /> : <div className="creatorCircle__placeholder" />}
      </div>
      <div className="creatorHighlight__info">
        <span className="creatorHighlight__name">{creator.name}</span>
        <div className="creatorHighlight__tags">
          {categories.slice(0, 2).map(c => (
            <span key={c.id} className="creatorHighlight__tag">◇ {c.name}</span>
          ))}
        </div>
      </div>
    </Link>
  )
}

function getSavedEvents(): number[] {
  try { return JSON.parse(localStorage.getItem('savedEvents') || '[]') } catch { return [] }
}
function toggleSavedEvent(id: number) {
  const saved = getSavedEvents()
  const next = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id]
  localStorage.setItem('savedEvents', JSON.stringify(next))
  return next.includes(id)
}

function CatalogEventCard({ event, token, categories, isVenue, initialInviteSent, onInviteSent, onClick }: {
  event: Event
  token: string | null
  categories: Category[]
  isVenue: boolean
  initialInviteSent?: boolean
  onInviteSent?: () => void
  onClick: () => void
}) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [creatorName, setCreatorName] = useState<string>('')
  const [creatorAvatarUrl, setCreatorAvatarUrl] = useState<string | null>(null)
  const [saved, setSaved] = useState(() => getSavedEvents().includes(event.id))
  const [inviteSent, setInviteSent] = useState(initialInviteSent ?? false)
  const [sending, setSending] = useState(false)
  const eventCats = categories.filter(c => event.category_ids?.includes(c.id))
  const visibleCats = eventCats.slice(0, 3)
  const hiddenCatCount = eventCats.length - visibleCats.length

  useEffect(() => {
    if (!token) return
    let cancelled = false
    if (event.cover_photo_id) {
      fetchImageUrl(event.cover_photo_id)
        .then(url => { if (!cancelled) setCoverUrl(url) })
        .catch(() => {})
    }
    getCreatorInfo(event.creator_id, token).then(info => {
      if (cancelled) return
      setCreatorName(info.name)
      if (info.avatarId) {
        fetchImageUrl(info.avatarId)
          .then(url => { if (!cancelled) setCreatorAvatarUrl(url) })
          .catch(() => {})
      }
    })
    return () => { cancelled = true }
  }, [event.cover_photo_id, event.creator_id, token])

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    const nowSaved = toggleSavedEvent(event.id)
    setSaved(nowSaved)
  }

  const handleInvite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!token || sending || inviteSent) return
    setSending(true)
    try {
      await createApplication({ receiver_id: event.creator_id, receiver_type: 'creator', event_id: event.id }, token)
      setInviteSent(true)
      onInviteSent?.()
    } catch (err) {
      console.error('Invite failed:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className={`catalogCard ${!isVenue ? 'catalogCard--noPointer' : ''}`}
      onClick={isVenue ? onClick : undefined}
      role={isVenue ? 'button' : undefined}
      tabIndex={isVenue ? 0 : undefined}
    >
      <div className="catalogCard__cover">
        {coverUrl
          ? <img src={coverUrl} alt={event.title} className="catalogCard__coverImg" />
          : <div className="catalogCard__coverPlaceholder" />}
      </div>
      <div className="catalogCard__body">
        <h3 className="catalogCard__title">{event.title}</h3>
        {visibleCats.length > 0 && (
          <div className="catalogCard__tags">
            {visibleCats.map(c => (
              <span key={c.id} className="catalogCard__tag">◇ {c.name}</span>
            ))}
            {hiddenCatCount > 0 && (
              <span className="catalogCard__tagMore">и ещё {hiddenCatCount}</span>
            )}
          </div>
        )}
        {event.description && (
          <p className="catalogCard__desc">{event.description}</p>
        )}
        {creatorName && (
          <Link
            to={`/creator/profile/${event.creator_id}`}
            className="catalogCard__creator"
            onClick={e => e.stopPropagation()}
          >
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
            <button
              type="button"
              className={`catalogCard__saveBtn ${saved ? 'catalogCard__saveBtn--saved' : ''}`}
              onClick={handleSave}
            >
              {saved ? 'Отменить сохранение' : 'Сохранить'}
            </button>
            {inviteSent ? (
              <span className="catalogCard__sentLabel">Заявка отправлена!</span>
            ) : (
              <button type="button" className="catalogCard__proposeBtn" disabled={sending} onClick={handleInvite}>
                {sending ? 'Отправка...' : 'Пригласить провести'}
              </button>
            )}
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
      fetchImageUrl(event.cover_photo_id)
        .then(url => { if (!cancelled) setCoverUrl(url) })
        .catch(() => {})
    }
    getCreatorInfo(event.creator_id, token).then(info => {
      if (cancelled) return
      setCreatorName(info.name)
      if (info.avatarId) {
        fetchImageUrl(info.avatarId)
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
        <h3 className="featuredCard__title">{event.title}</h3>
        {cat && <span className="featuredCard__tag">◇ {cat.name}</span>}
        {event.description && <p className="featuredCard__desc">{event.description}</p>}
        {creatorName && (
          <div className="featuredCard__creator">
            <div className="featuredCard__creatorAvatar">
              {creatorAvatarUrl
                ? <img src={creatorAvatarUrl} alt="" className="featuredCard__creatorImg" />
                : <div className="featuredCard__creatorPlaceholder" />}
            </div>
            <span className="featuredCard__creatorName">{creatorName}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function MidBannerRow({ event, token, categories, onScrollToCatalog }: {
  event: Event | null
  token: string | null
  categories: Category[]
  onScrollToCatalog?: () => void
}) {
  return (
    <div className="eventsMidBanner">
      <img src={midBannerBg} alt="" className="eventsMidBanner__bg" />
      <div className="eventsMidBanner__left">
        <p className="eventsMidBanner__text">Мероприятия, которые<br />ищут пространство</p>
        <button type="button" className="eventsMidBanner__btn" onClick={onScrollToCatalog}>Перейти →</button>
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

function EventModal({ event, token, categories, initialInviteSent, onClose }: {
  event: Event
  token: string | null
  categories: Category[]
  initialInviteSent?: boolean
  onClose: () => void
}) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [creatorName, setCreatorName] = useState('')
  const [creatorAvatarUrl, setCreatorAvatarUrl] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(initialInviteSent ?? false)
  const [saved, setSaved] = useState(() => getSavedEvents().includes(event.id))
  const modalCats = categories.filter(c => event.category_ids?.includes(c.id))

  useEffect(() => {
    if (!token) return
    let cancelled = false
    if (event.cover_photo_id) {
      fetchImageUrl(event.cover_photo_id).then(url => { if (!cancelled) setCoverUrl(url) }).catch(() => {})
    }
    getCreatorInfo(event.creator_id, token).then(info => {
      if (cancelled) return
      setCreatorName(info.name)
      if (info.avatarId) fetchImageUrl(info.avatarId).then(url => { if (!cancelled) setCreatorAvatarUrl(url) }).catch(() => {})
    })
    return () => { cancelled = true }
  }, [event, token])

  const handleInvite = async () => {
    if (!token) return
    setSending(true)
    try {
      await createApplication({
        receiver_id: event.creator_id,
        receiver_type: 'creator',
        event_id: event.id,
      }, token)
      setSent(true)
    } catch (err) {
      console.error('Invite failed:', err)
    } finally {
      setSending(false)
    }
  }

  const handleSave = () => {
    const nowSaved = toggleSavedEvent(event.id)
    setSaved(nowSaved)
  }

  return (
    <div className="eventModalOverlay" onClick={onClose}>
      <div className="eventModal" onClick={e => e.stopPropagation()}>
        <button type="button" className="eventModal__close" onClick={onClose}>✕</button>
        <div className="eventModal__inner">
          <div className="eventModal__cover">
            {coverUrl ? <img src={coverUrl} alt="" /> : <div className="eventModal__coverPlaceholder" />}
          </div>
          <div className="eventModal__body">
            <h2 className="eventModal__title">{event.title}</h2>
            {modalCats.length > 0 && (
              <div className="catalogCard__tags">
                {modalCats.slice(0, 3).map(c => (
                  <span key={c.id} className="eventModal__tag">◇ {c.name}</span>
                ))}
                {modalCats.length > 3 && (
                  <span className="catalogCard__tagMore">и ещё {modalCats.length - 3}</span>
                )}
              </div>
            )}
            {event.description && <p className="eventModal__desc">{event.description}</p>}
            {creatorName && (
              <Link to={`/creator/profile/${event.creator_id}`} className="eventModal__creator" onClick={onClose}>
                <div className="eventModal__creatorAvatar">
                  {creatorAvatarUrl ? <img src={creatorAvatarUrl} alt="" /> : <div className="catalogCard__creatorPlaceholder" />}
                </div>
                <span>{creatorName}</span>
              </Link>
            )}
            {sent ? (
              <p className="eventModal__sent">Заявка отправлена!</p>
            ) : (
              <div className="eventModal__actions">
                <button
                  type="button"
                  className={`catalogCard__saveBtn ${saved ? 'catalogCard__saveBtn--saved' : ''}`}
                  onClick={handleSave}
                >
                  {saved ? 'Отменить сохранение' : 'Сохранить'}
                </button>
                <button type="button" className="catalogCard__proposeBtn" disabled={sending} onClick={handleInvite}>
                  {sending ? 'Отправка...' : 'Пригласить провести'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const FILTER_ALL = 'all'
const PAGE_SIZE = 6

export function EventsCatalogPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const isVenue = user?.role === 'venue'

  const [categories, setCategories] = useState<Category[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCat, setSelectedCat] = useState<string>(FILTER_ALL)

  const [creators, setCreators] = useState<CreatorListItem[]>([])
  const [, setHighlightedCreator] = useState<CreatorListItem | null>(null)
  const [sentApplications, setSentApplications] = useState<Application[]>([])

  const [modalEvent, setModalEvent] = useState<Event | null>(null)
  const catalogRef = useRef<HTMLElement>(null)

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchCategories(token)
      .then(setCategories)
      .catch(() => {})
  }, [token])

  useEffect(() => {
    setIsLoading(true)
    setVisibleCount(PAGE_SIZE)
    fetchEvents({ is_active: true, limit: 100 }, token)
      .then(events => setAllEvents(events))
      .catch(() => setAllEvents([]))
      .finally(() => setIsLoading(false))
  }, [token])

  useEffect(() => {
    fetchCreators(token, 100, 0)
      .then(res => {
        setCreators(res.data)
        if (res.data.length > 0) setHighlightedCreator(res.data[0])
      })
      .catch(() => {})
  }, [token])

  useEffect(() => {
    if (!isVenue || !token) return
    fetchApplications({ role: 'sender', limit: 100 }, token)
      .then(setSentApplications)
      .catch(() => {})
  }, [isVenue, token])

  const filtered = selectedCat === FILTER_ALL
    ? allEvents
    : allEvents.filter(ev => ev.category_ids?.includes(Number(selectedCat)))

  const hasMore = visibleCount < filtered.length

  return (
    <div className="eventsCatalog">
      <div className="eventsCatalog__content">

        <div className="eventsCatalog__heroBannerWrap">
          <img src={heroBannerBg} alt="" className="eventsCatalog__heroBannerImg" />
          <div className="eventsCatalog__heroBannerText">
            <h1 className="eventsCatalog__heroBannerTitle">Мероприятия под<br/>любой вайб и цели</h1>
            <p className="eventsCatalog__heroBannerSub">Каталог готовых идей<br/>и желающих их реализовать</p>
          </div>
        </div>

        {creators.length > 0 && (
          <section className="eventsCatalog__creatorsSection">
            <div className="eventsCatalog__creatorsHeader">
              <div>
                <h2 className="eventsCatalog__creatorsTitle">Собрали самых творческих людей</h2>
                <p className="eventsCatalog__creatorsDesc">
                  Креаторы — люди, которые хотят провести мероприятия. Ищите инициативы
                  в каталоге или в личных профилях креаторов.
                </p>
              </div>
              <button
                type="button"
                className="eventsCatalog__allCreatorsBtn"
                onClick={() => navigate('/creators')}
              >
                Все аккаунты
              </button>
            </div>
            <div className="eventsCatalog__creatorsRow">
              {creators.map(c => (
                <CreatorHighlight key={c.id} creator={c} token={token} categories={categories} />
              ))}
            </div>
          </section>
        )}

        {allEvents.length > 0 && (
          <MidBannerRow event={allEvents[0]} token={token} categories={categories} onScrollToCatalog={scrollToCatalog} />
        )}

        <div className="eventsCatalog__filters">
          <button
            type="button"
            className={`eventsCatalog__filterChip ${selectedCat === FILTER_ALL ? 'eventsCatalog__filterChip--active' : ''}`}
            onClick={() => { setSelectedCat(FILTER_ALL); setVisibleCount(PAGE_SIZE) }}
          >
            Все
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              type="button"
              className={`eventsCatalog__filterChip ${selectedCat === String(c.id) ? 'eventsCatalog__filterChip--active' : ''}`}
              onClick={() => { setSelectedCat(String(c.id)); setVisibleCount(PAGE_SIZE) }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <section className="eventsCatalog__catalog" ref={catalogRef}>
          {isLoading ? (
            <div className="eventsCatalog__loading">Загрузка...</div>
          ) : filtered.length === 0 ? (
            <div className="eventsCatalog__empty">
              {!token ? 'Войдите в аккаунт, чтобы увидеть доступные мероприятия' : 'Мероприятия не найдены'}
            </div>
          ) : (
            <>
              <div className="eventsCatalog__grid">
                {filtered.slice(0, visibleCount).map(event => (
                  <CatalogEventCard
                    key={event.id}
                    event={event}
                    token={token}
                    categories={categories}
                    isVenue={isVenue}
                    initialInviteSent={sentApplications.some(a => a.event_id === event.id && a.receiver_id === event.creator_id && a.receiver_type === 'creator')}
                    onInviteSent={() => setSentApplications(prev => [...prev, { event_id: event.id, receiver_id: event.creator_id, receiver_type: 'creator' } as Application])}
                    onClick={() => setModalEvent(event)}
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

      {modalEvent && isVenue && (
        <EventModal
          event={modalEvent}
          token={token}
          categories={categories}
          initialInviteSent={sentApplications.some(a => a.event_id === modalEvent.id && a.receiver_id === modalEvent.creator_id && a.receiver_type === 'creator')}
          onClose={() => setModalEvent(null)}
        />
      )}

      <Footer />
    </div>
  )
}
