import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchVenueProfile, fetchImageUrl, fetchVenues, uploadImage } from '../../api/auth'
import { fetchEvents, fetchCategories, deleteEvent } from '../../api/events'
import type { VenueProfile, VenueListItem, VenuePhoto } from '../../api/auth'
import type { Event, Category } from '../../api/events'
import { Footer } from '../../components/layout/Footer'
import './VenueProfilePage.css'

import iconPin from '../../assets/playground_profile/Group 1067450.png'
import iconSocial from '../../assets/playground_profile/Frame 2131328057.png'
import iconTelegram from '../../assets/icons/space_sign_up4/Vector(1).png'
import iconVk       from '../../assets/icons/space_sign_up4/Vector(2).png'
import iconTiktok   from '../../assets/icons/space_sign_up4/Vector(3).png'
import iconDzen     from '../../assets/icons/space_sign_up4/Vector(4).png'


function PhotoThumb({ imageId, token, isOwner, photoRecordId, onDelete }: {
  imageId: number
  token: string
  isOwner?: boolean
  photoRecordId?: number
  onDelete?: (id: number) => void
}) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchImageUrl(imageId, token)
      .then(u => { if (!cancelled) setUrl(u) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [imageId, token])

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

function CompletedEventCard({ event, token, categories, isOwner, onDelete }: {
  event: Event
  token: string | null
  categories: Category[]
  isOwner: boolean
  onDelete?: (id: number) => void
}) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const catName = categories.find(c => event.category_ids?.includes(c.id))?.name ?? ''

  useEffect(() => {
    if (!token || !event.cover_photo_id) return
    fetchImageUrl(event.cover_photo_id, token).then(setCoverUrl).catch(() => {})
  }, [event.cover_photo_id, token])

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


function RecommendedCard({ venue, token }: { venue: VenueListItem; token: string | null }) {
  const navigate = useNavigate()
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    const coverId = venue.cover_photo?.id ?? venue.cover_photo_id
    const logoId  = venue.logo?.id ?? venue.logo_id
    if (coverId) fetchImageUrl(coverId, token).then(setCoverUrl).catch(() => {})
    if (logoId)  fetchImageUrl(logoId,  token).then(setLogoUrl).catch(() => {})
  }, [venue, token])

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
  vk:     { icon: iconVk       },
  tg:     { icon: iconTelegram },
  tiktok: { icon: iconTiktok   },
  dzen:   { icon: iconDzen     },
}

type SocialType = keyof typeof SOCIAL_CONFIG

function SocialBadge({ href, label, type }: { href: string; label: string; type: SocialType }) {
  const cfg = SOCIAL_CONFIG[type]
  const fullHref = href.startsWith('http') ? href : `https://${href}`

  return (
    <a
      href={fullHref}
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

  const [profile, setProfile] = useState<VenueProfile | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [recommended, setRecommended] = useState<VenueListItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [completedEvents, setCompletedEvents] = useState<Event[]>([])

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
        if (coverId) fetchImageUrl(coverId, token).then(setCoverUrl).catch(() => {})
        if (logoId)  fetchImageUrl(logoId,  token).then(setLogoUrl).catch(() => {})
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

  const socials: Array<{ href: string; label: string; type: SocialType }> = []
  const clean = (s: string, prefix?: string) =>
    s.replace(/^https?:\/\//, '').replace(prefix ? new RegExp(`^${prefix}/?@?`) : /x/, '').replace(/\/$/, '')

  if (profile?.vk_link)          socials.push({ href: profile.vk_link,          label: clean(profile.vk_link, 'vk\\.com'), type: 'vk' })
  if (profile?.tg_channel_link)  socials.push({ href: profile.tg_channel_link,  label: clean(profile.tg_channel_link, 't\\.me'),  type: 'tg' })
  if (profile?.tg_personal_link) socials.push({ href: profile.tg_personal_link, label: clean(profile.tg_personal_link, 't\\.me'), type: 'tg' })
  if (profile?.tiktok_link)      socials.push({ href: profile.tiktok_link,      label: clean(profile.tiktok_link),  type: 'tiktok' })
  if (profile?.dzen_link)        socials.push({ href: profile.dzen_link,        label: clean(profile.dzen_link),    type: 'dzen' })

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
                <input ref={photoFileInputRef} type="file" accept="image/*" onChange={handleAddPhoto} style={{ display: 'none' }} />
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
              <PhotoThumb key={p.id} imageId={p.image.id} token={token!} isOwner={isOwner} photoRecordId={p.id} onDelete={handleDeletePhoto} />
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
                  <CompletedEventCard key={ev.id} event={ev} token={token} categories={categories} isOwner={isOwner} onDelete={handleDeleteEvent} />
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
                <RecommendedCard key={v.id} venue={v} token={token} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
