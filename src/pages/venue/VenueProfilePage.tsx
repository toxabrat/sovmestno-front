import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchVenueProfile, fetchImageUrl, fetchVenues, uploadImage } from '../../api/auth'
import { fetchEvents, fetchCategories, deleteEvent } from '../../api/events'
import type { VenueProfile, VenueListItem, VenuePhoto } from '../../api/auth'
import type { Event, Category } from '../../api/events'
import { createApplication } from '../../api/applications'
import { Footer } from '../../components/layout/Footer'
import '../spaces/SpacesCatalogPage.css'
import './VenueProfilePage.css'

import iconPin from '../../assets/playground_profile/Group 1067450.png'
import iconSocial from '../../assets/playground_profile/Frame 2131328057.png'
import iconTelegram from '../../assets/icons/space_sign_up4/Vector(1).png'
import iconVk       from '../../assets/icons/space_sign_up4/Vector(2).png'
import iconTiktok   from '../../assets/icons/space_sign_up4/Vector(3).png'
import iconYoutube  from '../../assets/icons/space_sign_up4/Vector(4).png'
import iconDzen     from '../../assets/icons/space_sign_up4/Vector(5).png'


function PhotoThumb({ imageId, isOwner, photoRecordId, onDelete }: {
  imageId: number
  isOwner?: boolean
  photoRecordId?: number
  onDelete?: (id: number) => void
}) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchImageUrl(imageId)
      .then(u => { if (!cancelled) setUrl(u) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [imageId])

  return (
    <div className="venueProfile__photoThumb">
      {url
        ? <img src={url} alt="" className="venueProfile__photoImg" />
        : <div className="venueProfile__photoPlaceholder" />}
      {isOwner && photoRecordId && (
        <button type="button" className="venueProfile__photoDeleteBtn" onClick={() => onDelete?.(photoRecordId)}>×</button>
      )}
    </div>
  )
}

function CompletedEventCard({ event, categories, isOwner, onDelete }: {
  event: Event
  categories: Category[]
  isOwner: boolean
  onDelete?: (id: number) => void
}) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const catName = categories.find(c => event.category_ids?.includes(c.id))?.name ?? ''

  useEffect(() => {
    if (!event.cover_photo_id) return
    fetchImageUrl(event.cover_photo_id).then(setCoverUrl).catch(() => {})
  }, [event.cover_photo_id])

  return (
    <div className="venueProfile__completedCard">
      <div className="venueProfile__completedCover">
        {coverUrl
          ? <img src={coverUrl} alt="" className="venueProfile__completedCoverImg" />
          : <div className="venueProfile__completedCoverPlaceholder" />}
      </div>
      <div className="venueProfile__completedBody">
        <h3 className="venueProfile__completedTitle">{event.title}</h3>
        {catName && <span className="venueProfile__completedTag">◇ {catName}</span>}
        {event.description && <p className="venueProfile__completedDesc">{event.description}</p>}
        {isOwner && (
          <button type="button" className="venueProfile__completedDeleteBtn" onClick={() => onDelete?.(event.id)}>
            Удалить
          </button>
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

function ProposeModal({
  venueUserId,
  venueName,
  myEvents,
  categories,
  token,
  onClose,
}: {
  venueUserId: number
  venueName: string
  myEvents: Event[]
  categories: Category[]
  token: string
  onClose: () => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handlePropose = async () => {
    if (selected === null) return
    setSending(true)
    try {
      await createApplication({ receiver_id: venueUserId, receiver_type: 'venue', event_id: selected }, token)
      setSent(true)
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
          <h2 className="proposeModal__venueName">{venueName}</h2>
        </div>
        {sent ? (
          <div className="proposeModal__success"><p>Заявка отправлена!</p></div>
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
                      {cat && <span className="proposeModal__eventTag"><span>◇</span> {cat.name}</span>}
                    </div>
                    <span className={`proposeModal__radio ${selected === ev.id ? 'proposeModal__radio--on' : ''}`} />
                  </button>
                )
              })}
              {myEvents.length === 0 && <p className="proposeModal__empty">У вас пока нет мероприятий</p>}
            </div>
            <div className="proposeModal__actions">
              <button type="button" className="venueCard__saveBtn" onClick={onClose}>Отмена</button>
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

function RecommendedCard({ venue }: { venue: VenueListItem }) {
  const navigate = useNavigate()
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    const coverId = venue.cover_photo?.id ?? venue.cover_photo_id
    const logoId  = venue.logo?.id ?? venue.logo_id
    if (coverId) fetchImageUrl(coverId).then(setCoverUrl).catch(() => {})
    if (logoId)  fetchImageUrl(logoId).then(setLogoUrl).catch(() => {})
  }, [venue])

  return (
    <div className="recCard">
      <div className="recCard__cover">
        {coverUrl
          ? <img src={coverUrl} alt="" className="recCard__coverImg" />
          : <div className="recCard__coverPlaceholder" />}
      </div>
      <div className="recCard__body">
        <div
          className="recCard__nameRow"
          role="button"
          tabIndex={0}
          onClick={() => navigate(`/venue/profile/${venue.user_id}`)}
          onKeyDown={e => e.key === 'Enter' && navigate(`/venue/profile/${venue.user_id}`)}
          style={{ cursor: 'pointer' }}
        >
          <div className="recCard__logo">
            {logoUrl
              ? <img src={logoUrl} alt="" className="recCard__logoImg" />
              : <div className="recCard__logoPlaceholder" />}
          </div>
          <span className="recCard__name">{venue.name}</span>
        </div>
        {venue.description && (
          <p className="recCard__desc">{venue.description}</p>
        )}
        {(venue.street_address || venue.address) && (
          <p className="recCard__address">
            <span className="recCard__pin">📍</span>
            {venue.street_address ?? venue.address}
          </p>
        )}
      </div>
    </div>
  )
}


const SOCIAL_CONFIG = {
  vk:      { icon: iconVk       },
  tg:      { icon: iconTelegram },
  tiktok:  { icon: iconTiktok   },
  youtube: { icon: iconYoutube  },
  dzen:    { icon: iconDzen     },
}

type SocialType = keyof typeof SOCIAL_CONFIG

function SocialBadge({ href, label, type }: { href: string; label: string; type: SocialType }) {
  const cfg = SOCIAL_CONFIG[type]

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="venueProfile__socialBadge"
    >
      <img src={cfg.icon} alt="" className="venueProfile__socialBadgeImg" />
      <span className="venueProfile__socialBadgeLabel">{label}</span>
    </a>
  )
}


async function addVenuePhoto(imageId: number, token: string): Promise<VenuePhoto> {
  const response = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/user/users/venues/photos`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ image_id: imageId }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(JSON.stringify(data))
  return data
}

async function deleteVenuePhoto(photoId: number, token: string): Promise<void> {
  const response = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/user/users/venues/photos/${photoId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok && response.status !== 204) {
    const data = await response.json().catch(() => ({}))
    throw new Error(JSON.stringify(data))
  }
}

export function VenueProfilePage() {
  const { user, token } = useAuth()
  const { userId: paramUserId } = useParams<{ userId: string }>()
  const targetUserId = paramUserId ? Number(paramUserId) : user?.id
  const isOwner = user?.role === 'venue' && !!targetUserId && user?.id === targetUserId
  const isCreatorViewing = user?.role === 'creator' && !isOwner && !!targetUserId

  const [profile, setProfile] = useState<VenueProfile | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [recommended, setRecommended] = useState<VenueListItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [completedEvents, setCompletedEvents] = useState<Event[]>([])

  const [isSaved, setIsSaved] = useState(() => {
    if (!targetUserId) return false
    try { return (JSON.parse(localStorage.getItem('savedVenues') || '[]') as number[]).includes(targetUserId) } catch { return false }
  })
  const [showProposeModal, setShowProposeModal] = useState(false)
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [myCategories, setMyCategories] = useState<Category[]>([])

  const scrollRef = useRef<HTMLDivElement>(null)
  const completedScrollRef = useRef<HTMLDivElement>(null)
  const photoFileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const loadProfile = () => {
    if (!targetUserId || !token) return
    setIsLoading(true)
    fetchVenueProfile(targetUserId, token)
      .then(data => {
        setProfile(data)
        const coverId = data.cover_photo?.id ?? data.cover_photo_id
        const logoId  = data.logo?.id ?? data.logo_id
        if (coverId) fetchImageUrl(coverId).then(setCoverUrl).catch(() => {})
        if (logoId)  fetchImageUrl(logoId).then(setLogoUrl).catch(() => {})
      })
      .catch(err => {
        console.error('Failed to load venue profile:', err)
        setError('Не удалось загрузить профиль')
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { loadProfile() }, [targetUserId, token])

  useEffect(() => {
    fetchVenues(token, 6, 0)
      .then(res => setRecommended(res.data.slice(0, 3)))
      .catch(() => {})
    fetchCategories(token).then(setCategories).catch(() => {})
  }, [token])

  useEffect(() => {
    if (!targetUserId || !token) return
    fetchEvents({ creator_id: targetUserId, is_completed: true }, token)
      .then(setCompletedEvents).catch(() => setCompletedEvents([]))
  }, [targetUserId, token])

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return
    setUploadingPhoto(true)
    try {
      const uploaded = await uploadImage(file, 'venue-photo', token)
      await addVenuePhoto(uploaded.id, token)
      loadProfile()
    } catch { /* */ }
    finally {
      setUploadingPhoto(false)
      if (photoFileInputRef.current) photoFileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async (photoId: number) => {
    if (!token) return
    try {
      await deleteVenuePhoto(photoId, token)
      loadProfile()
    } catch { /* */ }
  }

  useEffect(() => {
    if (!showProposeModal || !token || !user?.id) return
    fetchEvents({ creator_id: user.id }, token).then(setMyEvents).catch(() => {})
    fetchCategories(token).then(setMyCategories).catch(() => {})
  }, [showProposeModal, token, user?.id])

  const handleSave = () => {
    if (!targetUserId) return
    const saved = JSON.parse(localStorage.getItem('savedVenues') || '[]') as number[]
    const next = saved.includes(targetUserId) ? saved.filter(x => x !== targetUserId) : [...saved, targetUserId]
    localStorage.setItem('savedVenues', JSON.stringify(next))
    setIsSaved(next.includes(targetUserId))
  }

  const handleDeleteEvent = async (id: number) => {
    if (!token) return
    try {
      await deleteEvent(id, token)
      setCompletedEvents(prev => prev.filter(e => e.id !== id))
    } catch { /* */ }
  }

  const scrollLeft  = () => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })
  const scrollRight = () => scrollRef.current?.scrollBy({ left:  300, behavior: 'smooth' })

  const address = profile?.street_address || profile?.address || ''

  const cleanHandle = (s: string) =>
    s.replace(/^https?:\/\/[^/]+\/?/, '').replace(/^@+/, '').replace(/\/$/, '') || s.replace(/^@+/, '')

  const buildUrl = (type: SocialType, val: string): string => {
    if (val.startsWith('http')) return val
    const handle = val.replace(/^@+/, '').trim()
    if (!handle) return '#'
    switch (type) {
      case 'tg': return `https://t.me/${handle}`
      case 'vk': return `https://vk.com/${handle}`
      case 'tiktok': return `https://www.tiktok.com/@${handle}`
      case 'youtube': return `https://www.youtube.com/@${handle}`
      case 'dzen': return `https://dzen.ru/${handle}`
    }
  }

  const socials: Array<{ href: string; label: string; type: SocialType }> = []
  if (profile?.vk_link)          socials.push({ href: buildUrl('vk', profile.vk_link),          label: cleanHandle(profile.vk_link),              type: 'vk' })
  if (profile?.tg_channel_link)  socials.push({ href: buildUrl('tg', profile.tg_channel_link),  label: '@' + cleanHandle(profile.tg_channel_link), type: 'tg' })
  if (profile?.tiktok_link)      socials.push({ href: buildUrl('tiktok', profile.tiktok_link),  label: '@' + cleanHandle(profile.tiktok_link),    type: 'tiktok' })
  if (profile?.youtube_link)     socials.push({ href: buildUrl('youtube', profile.youtube_link), label: '@' + cleanHandle(profile.youtube_link),   type: 'youtube' })
  if (profile?.dzen_link)        socials.push({ href: buildUrl('dzen', profile.dzen_link),      label: cleanHandle(profile.dzen_link),             type: 'dzen' })

  const photoItems = (profile?.photos ?? []).filter(p => p?.image?.id)

  if (isLoading) return <div className="venueProfile__state">Загрузка...</div>
  if (error || !profile) return <div className="venueProfile__state venueProfile__state--error">{error ?? 'Профиль не найден'}</div>

  return (
    <div className="venueProfile">
      <div className="venueProfile__content">

        <div className="venueProfile__layout">

          <div className="venueProfile__main">
            <div className="venueProfile__card">

              <div className="venueProfile__cover">
                {coverUrl
                  ? <img src={coverUrl} alt="" className="venueProfile__coverImg" />
                  : <div className="venueProfile__coverPlaceholder" />}
              </div>

              <div className="venueProfile__cardBody">
                <div className="venueProfile__identity">
                  <div className="venueProfile__logo">
                    {logoUrl
                      ? <img src={logoUrl} alt="" className="venueProfile__logoImg" />
                      : <div className="venueProfile__logoPlaceholder" />}
                  </div>
                  <div className="venueProfile__nameBlock">
                    <h1 className="venueProfile__name">{profile.name}</h1>
                    {profile.description && (
                      <p className="venueProfile__desc">{profile.description}</p>
                    )}
                  </div>
                </div>

                {isCreatorViewing && (
                  <div className="venueProfile__creatorActions">
                    <button
                      type="button"
                      className={`venueCard__saveBtn ${isSaved ? 'venueCard__saveBtn--saved' : ''}`}
                      onClick={handleSave}
                    >
                      {isSaved ? 'Сохранено' : 'Сохранить'}
                    </button>
                    <button
                      type="button"
                      className="venueCard__proposeBtn"
                      onClick={() => setShowProposeModal(true)}
                    >
                      Предложить мероприятие
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          <aside className="venueProfile__sidebar">
            {address && (
              <div className="venueProfile__sideCard">
                <div className="venueProfile__sideHeader">
                  <img src={iconPin} alt="" className="venueProfile__sideIcon" />
                  <span className="venueProfile__sideTitle">Адрес</span>
                </div>
                <p className="venueProfile__address">{address}</p>
              </div>
            )}

            {socials.length > 0 && (
              <div className="venueProfile__sideCard">
                <div className="venueProfile__sideHeader">
                  <img src={iconSocial} alt="" className="venueProfile__sideIcon" />
                  <span className="venueProfile__sideTitle">Социальные сети</span>
                </div>
                <div className="venueProfile__socialList">
                  {socials.map((s, i) => (
                    <SocialBadge key={i} {...s} />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {profile.category_ids && profile.category_ids.length > 0 && (
          <div className="venueProfile__formatsSection">
            <span className="venueProfile__formatsLabel">Интересующие форматы</span>
            <div className="venueProfile__formatsTags">
              {profile.category_ids.map(catId => {
                const cat = categories.find(c => c.id === catId)
                return cat ? (
                  <span key={cat.id} className="venueProfile__formatTag">{cat.name}</span>
                ) : null
              })}
            </div>
          </div>
        )}

        <section className="venueProfile__photos">
          <div className="venueProfile__photosHeader">
            <h2 className="venueProfile__photosTitle">Фотографии пространства</h2>
            <div className="venueProfile__photosNav">
              <button type="button" className="venueProfile__arrowBtn" onClick={scrollLeft}>‹</button>
              <button type="button" className="venueProfile__arrowBtn" onClick={scrollRight}>›</button>
            </div>
          </div>

          <div className="venueProfile__photosScroll" ref={scrollRef}>
            {isOwner && (
              <>
                <input ref={photoFileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleAddPhoto} style={{ display: 'none' }} />
                <button
                  type="button"
                  className="venueProfile__photoThumb venueProfile__photoAdd"
                  onClick={() => photoFileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                >
                  <span className="venueProfile__photoAddPlus">+</span>
                  <span className="venueProfile__photoAddText">{uploadingPhoto ? 'Загрузка...' : 'Загрузить фото'}</span>
                </button>
              </>
            )}
            {photoItems.map(p => (
              <PhotoThumb key={p.id} imageId={p.image.id} isOwner={isOwner} photoRecordId={p.id} onDelete={handleDeletePhoto} />
            ))}
            {photoItems.length === 0 && !isOwner && (
              <p className="venueProfile__emptyMsg">Фотографий пока нет</p>
            )}
          </div>
        </section>

        {(completedEvents.length > 0 || isOwner) && (
          <section className="venueProfile__completedSection">
            <div className="venueProfile__photosHeader">
              <h2 className="venueProfile__photosTitle">Проведённые мероприятия</h2>
              <div className="venueProfile__photosNav">
                <button type="button" className="venueProfile__arrowBtn" onClick={() => completedScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}>‹</button>
                <button type="button" className="venueProfile__arrowBtn" onClick={() => completedScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}>›</button>
              </div>
            </div>
            {completedEvents.length > 0 ? (
              <div className="venueProfile__photosScroll" ref={completedScrollRef}>
                {completedEvents.map(ev => (
                  <CompletedEventCard key={ev.id} event={ev} categories={categories} isOwner={isOwner} onDelete={handleDeleteEvent} />
                ))}
              </div>
            ) : (
              <p className="venueProfile__emptyMsg">Проведённых мероприятий пока нет</p>
            )}
          </section>
        )}

      </div>

      {recommended.length > 0 && (
        <section className="venueProfile__recommended">
          <div className="venueProfile__recommendedInner">
            <h2 className="venueProfile__recommendedTitle">Вам моугут понравится эти пространства</h2>
            <div className="venueProfile__recommendedGrid">
              {recommended.map(v => (
                <RecommendedCard key={v.id} venue={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      {showProposeModal && isCreatorViewing && targetUserId && token && (
        <ProposeModal
          venueUserId={targetUserId}
          venueName={profile.name}
          myEvents={myEvents}
          categories={myCategories}
          token={token}
          onClose={() => setShowProposeModal(false)}
        />
      )}

      <Footer />
    </div>
  )
}
