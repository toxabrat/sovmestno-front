import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchCreatorProfile, fetchImageUrl } from '../../api/auth'
import { fetchEvents, fetchCategories } from '../../api/events'
import type { CreatorProfile } from '../../api/auth'
import type { Event, Category } from '../../api/events'
import { Footer } from '../../components/layout/Footer'
import './CreatorProfilePage.css'

import iconSocial from '../../assets/playground_profile/Frame 2131328057.png'
import iconTelegram from '../../assets/icons/space_sign_up4/Vector(1).png'
import iconVk       from '../../assets/icons/space_sign_up4/Vector(2).png'
import iconTiktok   from '../../assets/icons/space_sign_up4/Vector(3).png'
import iconDzen     from '../../assets/icons/space_sign_up4/Vector(4).png'


const SOCIAL_CONFIG = {
  vk:     { icon: iconVk       },
  tg:     { icon: iconTelegram },
  tiktok: { icon: iconTiktok   },
  dzen:   { icon: iconDzen     },
}
type SocialType = keyof typeof SOCIAL_CONFIG

function SocialBadge({ href, label, type }: { href: string; label: string; type: SocialType }) {
  const fullHref = href.startsWith('http') ? href : `https://${href}`
  return (
    <a href={fullHref} target="_blank" rel="noopener noreferrer" className="creatorProfile__socialBadge">
      <img src={SOCIAL_CONFIG[type].icon} alt="" className="creatorProfile__socialBadgeImg" />
      <span className="creatorProfile__socialBadgeLabel">{label}</span>
    </a>
  )
}

function PhotoThumb({ imageId, token }: { imageId: number; token: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    fetchImageUrl(imageId, token).then(u => { if (!cancelled) setUrl(u) }).catch(() => {})
    return () => { cancelled = true }
  }, [imageId, token])
  return (
    <div className="creatorProfile__photoThumb">
      {url
        ? <img src={url} alt="" className="creatorProfile__photoImg" />
        : <div className="creatorProfile__photoPlaceholder" />}
    </div>
  )
}

function EventCard({ event, token, categories, isOwner }: {
  event: Event
  token: string | null
  categories: Category[]
  isOwner: boolean
}) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const catName = categories.find(c => event.category_ids?.includes(c.id))?.name ?? ''

  useEffect(() => {
    if (!token || !event.cover_photo_id) return
    fetchImageUrl(event.cover_photo_id, token).then(setCoverUrl).catch(() => {})
  }, [event.cover_photo_id, token])

  return (
    <div className="creatorProfile__eventCard">
      <div className="creatorProfile__eventCover">
        {coverUrl
          ? <img src={coverUrl} alt="" className="creatorProfile__eventCoverImg" />
          : <div className="creatorProfile__eventCoverPlaceholder" />}
      </div>
      <div className="creatorProfile__eventBody">
        <Link to={`/events/${event.id}`} className="creatorProfile__eventTitleLink">
          <h3 className="creatorProfile__eventTitle">{event.title}</h3>
        </Link>
        {catName && <span className="creatorProfile__eventTag">💬 {catName}</span>}
        {event.description && <p className="creatorProfile__eventDesc">{event.description}</p>}
        {isOwner && (
          <div className="creatorProfile__eventActions">
            <button type="button" className="creatorProfile__eventDeleteBtn">Удалить</button>
            <button type="button" className="creatorProfile__eventPublishBtn">Опубликовать мероприятие</button>
          </div>
        )}
      </div>
    </div>
  )
}

function RecommendedEventCard({ event, token, categories }: {
  event: Event
  token: string | null
  categories: Category[]
}) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const catName = categories.find(c => event.category_ids?.includes(c.id))?.name ?? ''
  const [creatorName] = useState('Имя Фамилия')

  useEffect(() => {
    if (!token || !event.cover_photo_id) return
    fetchImageUrl(event.cover_photo_id, token).then(setCoverUrl).catch(() => {})
  }, [event.cover_photo_id, token])

  return (
    <div className="creatorProfile__recCard">
      <div className="creatorProfile__recCover">
        {coverUrl
          ? <img src={coverUrl} alt="" className="creatorProfile__recCoverImg" />
          : <div className="creatorProfile__recCoverPlaceholder" />}
      </div>
      <div className="creatorProfile__recBody">
        <Link to={`/events/${event.id}`} className="creatorProfile__recTitleLink">
          <h3 className="creatorProfile__recTitle">{event.title}</h3>
        </Link>
        {catName && <span className="creatorProfile__recTag">💬 {catName}</span>}
        {event.description && <p className="creatorProfile__recDesc">{event.description}</p>}
        <div className="creatorProfile__recAuthor">
          <div className="creatorProfile__recAvatar" />
          <span className="creatorProfile__recAuthorName">{creatorName}</span>
        </div>
      </div>
    </div>
  )
}


export function CreatorProfilePage() {
  const { user, token } = useAuth()
  const { userId } = useParams<{ userId: string }>()
  const targetUserId = userId ? Number(userId) : user?.id
  const isOwner = user?.role === 'creator' && !!targetUserId && user?.id === targetUserId

  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])

  const storageKey = targetUserId ? `creator_photo_ids_${targetUserId}` : null
  const [photoIds, setPhotoIds] = useState<number[]>([])
  const photoScrollRef = useRef<HTMLDivElement>(null)
  const eventsScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !storageKey) {
      setPhotoIds([])
      return
    }
    try {
      const s = localStorage.getItem(storageKey)
      setPhotoIds(s ? (JSON.parse(s) as number[]) : [])
    } catch {
      setPhotoIds([])
    }
  }, [storageKey])

  useEffect(() => {
    if (!targetUserId || !token) return
    setIsLoading(true)
    fetchCreatorProfile(targetUserId, token)
      .then(data => {
        setProfile(data)
        const photoId = data.photo?.id ?? data.photo_id
        if (photoId) fetchImageUrl(photoId, token).then(setPhotoUrl).catch(() => {})
      })
      .catch(() => setError('Не удалось загрузить профиль'))
      .finally(() => setIsLoading(false))
  }, [targetUserId, token])

  useEffect(() => {
    fetchCategories(token).then(setCategories).catch(() => {})
    fetchEvents({}, token).then(setAllEvents).catch(() => {})
  }, [token])

  useEffect(() => {
    if (!targetUserId || !token) return
    fetchEvents({ creator_id: targetUserId }, token).then(setMyEvents).catch(() => {})
  }, [targetUserId, token])

  const clean = (s: string, prefix?: string) =>
    s.replace(/^https?:\/\//, '').replace(prefix ? new RegExp(`^${prefix}/?@?`) : /x/, '').replace(/\/$/, '')

  const socials: Array<{ href: string; label: string; type: SocialType }> = []
  if (profile?.vk_link)          socials.push({ href: profile.vk_link,          label: clean(profile.vk_link, 'vk\\.com'),          type: 'vk' })
  if (profile?.tg_channel_link)  socials.push({ href: profile.tg_channel_link,  label: clean(profile.tg_channel_link, 't\\.me'),     type: 'tg' })
  if (profile?.tg_personal_link) socials.push({ href: profile.tg_personal_link, label: clean(profile.tg_personal_link, 't\\.me'),    type: 'tg' })
  if (profile?.tiktok_link)      socials.push({ href: profile.tiktok_link,      label: clean(profile.tiktok_link),                   type: 'tiktok' })
  if (profile?.dzen_link)        socials.push({ href: profile.dzen_link,        label: clean(profile.dzen_link),                     type: 'dzen' })

  const recEvents = allEvents.filter(e => !myEvents.find(m => m.id === e.id)).slice(0, 3)

  if (isLoading) return <div className="creatorProfile__state">Загрузка...</div>
  if (error || !profile) return <div className="creatorProfile__state creatorProfile__state--error">{error ?? 'Профиль не найден'}</div>

  return (
    <div className="creatorProfile">
      <div className="creatorProfile__content">

        <div className="creatorProfile__layout">

          <div className="creatorProfile__card">
            <div className="creatorProfile__identity">
              <div className="creatorProfile__avatarWrap">
                <div className="creatorProfile__avatar">
                  {photoUrl
                    ? <img src={photoUrl} alt="" className="creatorProfile__avatarImg" />
                    : <div className="creatorProfile__avatarPlaceholder" />}
                </div>
                <span className="creatorProfile__onlineDot" />
              </div>

              <div className="creatorProfile__info">
                <h1 className="creatorProfile__name">{profile.name}</h1>
                {profile.description && (
                  <p className="creatorProfile__desc">{profile.description}</p>
                )}
              </div>

              <div className="creatorProfile__actions">
                {isOwner ? (
                  <>
                    <button type="button" className="creatorProfile__editBtn">Изменить</button>
                    <button type="button" className="creatorProfile__proposeBtn">Предложить сотрудничество</button>
                  </>
                ) : (
                  <>
                    <button type="button" className="creatorProfile__saveBtn">Сохранить</button>
                    <button type="button" className="creatorProfile__proposeBtn">Предложить сотрудничество</button>
                  </>
                )}
              </div>
            </div>
          </div>

          <aside className="creatorProfile__sidebar">
            {socials.length > 0 && (
              <div className="creatorProfile__sideCard">
                <div className="creatorProfile__sideHeader">
                  <img src={iconSocial} alt="" className="creatorProfile__sideIcon" />
                  <span className="creatorProfile__sideTitle">Социальные сети</span>
                </div>
                <div className="creatorProfile__socialList">
                  {socials.map((s, i) => <SocialBadge key={i} {...s} />)}
                </div>
              </div>
            )}
          </aside>

        </div>

        {myEvents.length > 0 && (
          <section className="creatorProfile__section">
            <div className="creatorProfile__sectionHeader">
              <h2 className="creatorProfile__sectionTitle">Мои актуальные мероприятия</h2>
              <div className="creatorProfile__arrows">
                <button type="button" className="creatorProfile__arrowBtn" onClick={() => eventsScrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' })}>‹</button>
                <button type="button" className="creatorProfile__arrowBtn" onClick={() => eventsScrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}>›</button>
              </div>
            </div>
            <div className="creatorProfile__scroll" ref={eventsScrollRef}>
              {myEvents.map(ev => (
                <EventCard key={ev.id} event={ev} token={token} categories={categories} isOwner={isOwner} />
              ))}
            </div>
          </section>
        )}

        {photoIds.length > 0 && (
          <section className="creatorProfile__section">
            <div className="creatorProfile__sectionHeader">
              <h2 className="creatorProfile__sectionTitle">Фотографии пространства</h2>
              <div className="creatorProfile__arrows">
                <button type="button" className="creatorProfile__arrowBtn" onClick={() => photoScrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' })}>‹</button>
                <button type="button" className="creatorProfile__arrowBtn" onClick={() => photoScrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}>›</button>
              </div>
            </div>
            <div className="creatorProfile__photosScroll" ref={photoScrollRef}>
              {photoIds.map(id => (
                <PhotoThumb key={id} imageId={id} token={token!} />
              ))}
            </div>
          </section>
        )}

        {isOwner && myEvents.length > 0 && (
          <section className="creatorProfile__section">
            <div className="creatorProfile__sectionHeader">
              <h2 className="creatorProfile__sectionTitle">Мои мероприятия</h2>
            </div>
            <div className="creatorProfile__eventsGrid">
              {myEvents.map(ev => (
                <EventCard key={ev.id} event={ev} token={token} categories={categories} isOwner={true} />
              ))}
            </div>
          </section>
        )}

      </div>

      {recEvents.length > 0 && (
        <section className="creatorProfile__recommended">
          <div className="creatorProfile__recommendedInner">
            <h2 className="creatorProfile__recommendedTitle">Вам моугут понравится эти мероприятия</h2>
            <div className="creatorProfile__recommendedGrid">
              {recEvents.map(ev => (
                <RecommendedEventCard key={ev.id} event={ev} token={token} categories={categories} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
