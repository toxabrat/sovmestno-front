import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchVenues, fetchImageUrl } from '../../api/auth'
import type { VenueListItem } from '../../api/auth'
import { fetchEvents, fetchCategories } from '../../api/events'
import type { Event, Category } from '../../api/events'
import { createApplication, fetchApplications } from '../../api/applications'
import type { Application } from '../../api/applications'
import { Footer } from '../../components/layout/Footer'
import './SpacesCatalogPage.css'

import heroBg from '../../assets/icons/space_catalog_new/Frame 2131328255.png'
import categoryBanner from '../../assets/icons/space_catalog_new/Frame 2131328255(1).png'
import iconVenueTag from '../../assets/icons/space_catalog_new/Frame 2131328054.png'

function PinIcon() {
  return (
    <svg width="11" height="13" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5S5.17 3.5 6 3.5 7.5 4.17 7.5 5 6.83 6.5 6 6.5z" fill="currentColor"/>
    </svg>
  )
}

function ProposeModal({
  venue,
  myEvents,
  categories,
  token,
  onProposed,
  onClose,
}: {
  venue: VenueListItem
  myEvents: Event[]
  categories: Category[]
  token: string
  onProposed?: (eventId: number) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handlePropose = async () => {
    if (selected === null || !token) return
    setSending(true)
    try {
      await createApplication({
        receiver_id: venue.user_id,
        receiver_type: 'venue',
        event_id: selected,
      }, token)
      setSent(true)
      onProposed?.(selected)
    } catch (err) {
      console.error('Propose failed:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="proposeOverlay" onClick={onClose}>
      <div className="proposeModal" onClick={e => e.stopPropagation()}>
        <button type="button" className="proposeModal__close" onClick={onClose}>✕</button>

        <div className="proposeModal__header">
          <div className="proposeModal__venueAvatar">
            <div className="venueCard__logoPlaceholder" />
          </div>
          <div>
            <h2 className="proposeModal__venueName">{venue.name}</h2>
            {venue.description && (
              <p className="proposeModal__venueDesc">{venue.description}</p>
            )}
          </div>
        </div>

        {sent ? (
          <div className="proposeModal__success">
            <p>Заявка отправлена!</p>
          </div>
        ) : (
          <>
            <div className="proposeModal__list">
              {myEvents.map(ev => {
                const cat = categories.find(c => ev.category_ids?.includes(c.id))
                return (
                  <button
                    key={ev.id}
                    type="button"
                    className={`proposeModal__eventRow ${selected === ev.id ? 'proposeModal__eventRow--selected' : ''}`}
                    onClick={() => setSelected(ev.id)}
                  >
                    <EventThumb eventId={ev.cover_photo_id} />
                    <div className="proposeModal__eventInfo">
                      <span className="proposeModal__eventTitle">{ev.title}</span>
                      {cat && (
                        <span className="proposeModal__eventTag">
                          <span>◇</span> {cat.name}
                        </span>
                      )}
                    </div>
                    <span className={`proposeModal__radio ${selected === ev.id ? 'proposeModal__radio--on' : ''}`} />
                  </button>
                )
              })}
              {myEvents.length === 0 && (
                <p className="proposeModal__empty">У вас пока нет мероприятий</p>
              )}
            </div>

            <div className="proposeModal__actions">
              <button type="button" className="venueCard__saveBtn" onClick={onClose}>Сохранить</button>
              <button
                type="button"
                className="venueCard__proposeBtn"
                disabled={selected === null || sending}
                onClick={handlePropose}
              >
                {sending ? 'Отправка...' : 'Предложить мероприятие'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function EventThumb({ eventId }: { eventId?: number }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!eventId) return
    fetchImageUrl(eventId).then(setUrl).catch(() => {})
  }, [eventId])
  return (
    <div className="proposeModal__eventThumb">
      {url ? <img src={url} alt="" /> : <div className="proposeModal__eventThumbPlaceholder" />}
    </div>
  )
}

function getSavedVenues(): number[] {
  try { return JSON.parse(localStorage.getItem('savedVenues') || '[]') } catch { return [] }
}
function toggleSavedVenue(id: number) {
  const saved = getSavedVenues()
  const next = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id]
  localStorage.setItem('savedVenues', JSON.stringify(next))
  return next.includes(id)
}

function VenueCard({
  venue: initialVenue,
  token,
  isCreator,
  onPropose,
  onNavigate,
}: {
  venue: VenueListItem
  token: string | null
  isCreator: boolean
  onPropose?: (venue: VenueListItem) => void
  onNavigate?: (userId: number) => void
}) {
  const [venue, setVenue] = useState<VenueListItem>(initialVenue)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [saved, setSaved] = useState(() => getSavedVenues().includes(initialVenue.user_id))

  useEffect(() => {
    if (initialVenue.description && (initialVenue.street_address || initialVenue.address)) return
    let cancelled = false
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/user/users/venues/${initialVenue.user_id}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && !cancelled) setVenue(prev => ({ ...prev, ...data })) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [initialVenue.user_id, token, initialVenue.description, initialVenue.street_address, initialVenue.address])

  useEffect(() => {
    let cancelled = false
    const coverId = venue.cover_photo_id ?? (venue.cover_photo as { id?: number } | undefined)?.id
    const logoId = venue.logo_id ?? (venue.logo as { id?: number } | undefined)?.id
    if (coverId) fetchImageUrl(coverId).then(u => { if (!cancelled) setCoverUrl(u) }).catch(() => {})
    if (logoId) fetchImageUrl(logoId).then(u => { if (!cancelled) setLogoUrl(u) }).catch(() => {})
    return () => { cancelled = true }
  }, [venue.cover_photo_id, venue.logo_id, venue.cover_photo, venue.logo])

  const handleSave = () => {
    const nowSaved = toggleSavedVenue(venue.user_id)
    setSaved(nowSaved)
  }

  return (
    <div className="venueCard">
      <div className="venueCard__cover">
        {coverUrl
          ? <img src={coverUrl} alt={venue.name} className="venueCard__coverImg" />
          : <div className="venueCard__coverPlaceholder" />}
      </div>

      <div className="venueCard__body">
        <div className="venueCard__nameRow" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.(venue.user_id)}>
          <div className="venueCard__logo">
            {logoUrl
              ? <img src={logoUrl} alt="" className="venueCard__logoImg" />
              : <div className="venueCard__logoPlaceholder" />}
          </div>
          <span className="venueCard__name">{venue.name}</span>
        </div>

        {venue.description && (
          <p className="venueCard__desc">{venue.description}</p>
        )}

        {(venue.street_address || venue.address) && (
          <div className="venueCard__address">
            <PinIcon />
            <span>{venue.street_address ?? venue.address}</span>
          </div>
        )}

        {isCreator && (
          <div className="venueCard__actions">
            <button
              type="button"
              className={`venueCard__saveBtn ${saved ? 'venueCard__saveBtn--saved' : ''}`}
              onClick={handleSave}
            >
              {saved ? 'Отменить сохранение' : 'Сохранить'}
            </button>
            <button type="button" className="venueCard__proposeBtn" onClick={() => onPropose?.(venue)}>
              Предложить мероприятие
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryBannerRow({
  venue,
  token,
  isCreator,
  onPropose,
  onNavigate,
}: {
  venue: VenueListItem | null
  token: string | null
  isCreator: boolean
  onPropose?: (v: VenueListItem) => void
  onNavigate?: (userId: number) => void
}) {
  return (
    <div className="spacesCatalog__categoryRow">
      <div className="spacesCatalog__categoryBanner">
        <img src={categoryBanner} alt="Отмечаем лучшие места в каждой категории" className="spacesCatalog__categoryBannerImg" />
      </div>
      {venue && (
        <VenueCard venue={venue} token={token} isCreator={isCreator} onPropose={onPropose} onNavigate={onNavigate} />
      )}
    </div>
  )
}

function HeroBanner({ featuredVenue, onNavigate }: { featuredVenue: VenueListItem | null; onNavigate?: (userId: number) => void }) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!featuredVenue) return
    let cancelled = false
    const coverId = featuredVenue.cover_photo_id ?? (featuredVenue.cover_photo as { id?: number } | undefined)?.id
    if (coverId) fetchImageUrl(coverId).then(u => { if (!cancelled) setCoverUrl(u) }).catch(() => {})
    return () => { cancelled = true }
  }, [featuredVenue])

  return (
    <div className="heroBanner">
      <div className="heroBanner__left">
        <img src={heroBg} alt="" className="heroBanner__bgImg" />
      </div>

      <div className="heroBanner__right">
        {featuredVenue ? (
          <>
            {coverUrl
              ? <img src={coverUrl} alt={featuredVenue.name} className="heroBanner__coverImg" />
              : <div className="heroBanner__coverPlaceholder" />}
            <div className="heroBanner__overlay">
              <div className="heroBanner__venueIcon">
                <img src={iconVenueTag} alt="" className="heroBanner__tagIcon" />
              </div>
              <div className="heroBanner__bottom">
                <div className="heroBanner__textBlock">
                  <h2 className="heroBanner__title">{featuredVenue.name}</h2>
                  {featuredVenue.description && (
                    <p className="heroBanner__desc">{featuredVenue.description}</p>
                  )}
                </div>
                <button type="button" className="heroBanner__btn" onClick={() => featuredVenue && onNavigate?.(featuredVenue.user_id)}>Перейти →</button>
              </div>
            </div>
          </>
        ) : (
          <div className="heroBanner__coverPlaceholder" />
        )}
      </div>
    </div>
  )
}

const LIMIT = 50

export function SpacesCatalogPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const isCreator = user?.role === 'creator'

  const [venues, setVenues] = useState<VenueListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)

  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [sentApplications, setSentApplications] = useState<Application[]>([])
  const [proposeVenue, setProposeVenue] = useState<VenueListItem | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetchVenues(token, LIMIT, offset)
      .then(res => {
        setVenues(res.data ?? [])
        setTotal(res.total ?? 0)
      })
      .catch(() => setVenues([]))
      .finally(() => setIsLoading(false))
  }, [token, offset])

  useEffect(() => {
    if (!isCreator || !user?.id || !token) return
    fetchEvents({ creator_id: user.id, is_active: true }, token).then(setMyEvents).catch(() => {})
    fetchCategories(token).then(setCategories).catch(() => {})
    fetchApplications({ role: 'sender', limit: 100 }, token).then(setSentApplications).catch(() => {})
  }, [isCreator, user?.id, token])

  const handlePropose = useCallback((venue: VenueListItem) => {
    setProposeVenue(venue)
  }, [])

  const handleNavigateToVenue = useCallback((userId: number) => {
    navigate(`/venue/profile/${userId}`)
  }, [navigate])

  const totalPages = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  const featuredVenue = venues[0] ?? null
  const gridVenues = venues

  const BANNER_AFTER = 6
  const beforeBanner = gridVenues.slice(0, BANNER_AFTER)
  const bannerSideVenue = gridVenues[BANNER_AFTER] ?? null
  const afterBanner = gridVenues.slice(BANNER_AFTER + 1)

  return (
    <div className="spacesCatalog">
      <div className="spacesCatalog__content">

        <HeroBanner featuredVenue={featuredVenue} onNavigate={handleNavigateToVenue} />

        {isLoading ? (
          <div className="spacesCatalog__loading">Загрузка...</div>
        ) : venues.length === 0 ? (
          <div className="spacesCatalog__empty">
            {!token ? 'Войдите в аккаунт, чтобы увидеть доступные пространства' : 'Пространства не найдены'}
          </div>
        ) : (
          <>
            <div className="spacesCatalog__grid">
              {beforeBanner.map(venue => (
                <VenueCard key={venue.id} venue={venue} token={token} isCreator={isCreator} onPropose={handlePropose} onNavigate={handleNavigateToVenue} />
              ))}
            </div>

            <CategoryBannerRow
              venue={bannerSideVenue}
              token={token}
              isCreator={isCreator}
              onPropose={handlePropose}
              onNavigate={handleNavigateToVenue}
            />

            {afterBanner.length > 0 && (
              <div className="spacesCatalog__grid spacesCatalog__grid--after">
                {afterBanner.map(venue => (
                  <VenueCard key={venue.id} venue={venue} token={token} isCreator={isCreator} onPropose={handlePropose} onNavigate={handleNavigateToVenue} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="spacesCatalog__pagination">
                <button
                  type="button"
                  className="spacesCatalog__pageBtn"
                  disabled={currentPage === 1}
                  onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                >←</button>
                <span className="spacesCatalog__pageInfo">{currentPage} из {totalPages}</span>
                <button
                  type="button"
                  className="spacesCatalog__pageBtn"
                  disabled={currentPage === totalPages}
                  onClick={() => setOffset(offset + LIMIT)}
                >→</button>
              </div>
            )}
          </>
        )}
      </div>

      {proposeVenue && token && (
        <ProposeModal
          venue={proposeVenue}
          myEvents={myEvents.filter(ev => !sentApplications.some(a => a.event_id === ev.id && a.receiver_id === proposeVenue.user_id && a.receiver_type === 'venue'))}
          categories={categories}
          token={token}
          onProposed={(eventId) => setSentApplications(prev => [...prev, { event_id: eventId, receiver_id: proposeVenue.user_id, receiver_type: 'venue' } as Application])}
          onClose={() => setProposeVenue(null)}
        />
      )}

      <Footer />
    </div>
  )
}
