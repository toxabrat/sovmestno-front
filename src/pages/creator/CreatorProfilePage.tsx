import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  fetchCreatorProfile,
  fetchImageUrl,
  uploadImage,
  addCreatorPhoto,
  deleteCreatorPhoto,
} from '../../api/auth'
import { fetchEvents, fetchCategories, deleteEvent } from '../../api/events'
import { createApplication, fetchApplications } from '../../api/applications'
import type { Application } from '../../api/applications'
import type { CreatorProfile, CreatorPhotoItem } from '../../api/auth'
import type { Event, Category } from '../../api/events'
import { Footer } from '../../components/layout/Footer'
import './CreatorProfilePage.css'

import iconSocial from '../../assets/playground_profile/Frame 2131328057.png'
import iconTelegram from '../../assets/icons/space_sign_up4/Vector(1).png'
import iconVk       from '../../assets/icons/space_sign_up4/Vector(2).png'
import iconTiktok   from '../../assets/icons/space_sign_up4/Vector(3).png'
import iconYoutube  from '../../assets/icons/space_sign_up4/Vector(4).png'
import iconDzen     from '../../assets/icons/space_sign_up4/Vector(5).png'
import bannerFrame  from '../../assets/icons/creator_profile/Frame 2131328372.png'

const SOCIAL_CONFIG = {
  vk:      { icon: iconVk       },
  tg:      { icon: iconTelegram },
  tiktok:  { icon: iconTiktok   },
  youtube: { icon: iconYoutube  },
  dzen:    { icon: iconDzen     },
}
type SocialType = keyof typeof SOCIAL_CONFIG

function SocialBadge({ href, label, type }: { href: string; label: string; type: SocialType }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="cp__socialBadge">
      <img src={SOCIAL_CONFIG[type].icon} alt="" className="cp__socialBadgeImg" />
      <span className="cp__socialBadgeLabel">{label}</span>
    </a>
  )
}

function PhotoItem({
  item, isOwner, onDelete,
}: {
  item: CreatorPhotoItem
  isOwner: boolean
  onDelete: (id: number) => void
}) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    fetchImageUrl(item.image.id).then(setUrl).catch(() => {})
  }, [item.image.id])

  return (
    <div className="cp__photoThumb">
      {url
        ? <img src={url} alt="" className="cp__photoImg" />
        : <div className="cp__photoPlaceholder" />}
      {isOwner && (
        <button type="button" className="cp__photoDelete" onClick={() => onDelete(item.id)}>
          ×
        </button>
      )}
    </div>
  )
}

function EventCard({
  event, token, categories, isOwner, isVenueVisitor, creatorUserId,
  initialInviteSent,
  onDelete, onPublish, onEdit,
}: {
  event: Event
  token: string | null
  categories: Category[]
  isOwner: boolean
  isVenueVisitor: boolean
  creatorUserId?: number
  initialInviteSent?: boolean
  onDelete?: (id: number) => void
  onPublish?: (id: number) => void
  onEdit?: (id: number) => void
}) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [saved, setSaved] = useState(() => {
    try { return (JSON.parse(localStorage.getItem('savedEvents') || '[]') as number[]).includes(event.id) } catch { return false }
  })
  const [inviteSent, setInviteSent] = useState(initialInviteSent ?? false)
  const [sending, setSending] = useState(false)
  const eventCats = categories.filter(c => event.category_ids?.includes(c.id))
  const visibleCats = eventCats.slice(0, 3)
  const hiddenCatCount = eventCats.length - visibleCats.length

  useEffect(() => {
    if (!event.cover_photo_id) return
    fetchImageUrl(event.cover_photo_id).then(setCoverUrl).catch(() => {})
  }, [event.cover_photo_id, token])

  const handleSave = () => {
    try {
      const arr: number[] = JSON.parse(localStorage.getItem('savedEvents') || '[]')
      if (!arr.includes(event.id)) arr.push(event.id)
      localStorage.setItem('savedEvents', JSON.stringify(arr))
    } catch { /* */ }
    setSaved(true)
  }

  const handleInvite = async () => {
    if (!token || sending || inviteSent || !creatorUserId) return
    setSending(true)
    try {
      await createApplication({ receiver_id: creatorUserId, receiver_type: 'creator', event_id: event.id }, token)
      setInviteSent(true)
    } catch { /* */ }
    finally { setSending(false) }
  }

  return (
    <div className="cp__eventCard">
      <div className="cp__eventCover">
        {coverUrl
          ? <img src={coverUrl} alt="" className="cp__eventCoverImg" />
          : <div className="cp__eventCoverPlaceholder" />}
      </div>
      <div className="cp__eventBody">
        <h3 className="cp__eventTitle">{event.title}</h3>
        {visibleCats.length > 0 && (
          <div className="cp__eventTags">
            {visibleCats.map(c => (
              <span key={c.id} className="cp__eventTag">{c.name}</span>
            ))}
            {hiddenCatCount > 0 && (
              <span className="cp__eventTagMore">и ещё {hiddenCatCount}</span>
            )}
          </div>
        )}
        {event.description && <p className="cp__eventDesc">{event.description}</p>}

        {isOwner && (
          <div className="cp__eventActions">
            <button type="button" className="cp__eventDeleteBtn" onClick={() => onDelete?.(event.id)}>
              Удалить
            </button>
            {event.is_completed ? (
              <button type="button" className="cp__eventPublishBtn" onClick={() => onPublish?.(event.id)}>
                Разместить заново
              </button>
            ) : (
              <button type="button" className="cp__eventPublishBtn" onClick={() => onEdit?.(event.id)}>
                Редактировать
              </button>
            )}
          </div>
        )}

        {isVenueVisitor && (
          <div className="cp__eventActions">
            <button
              type="button"
              className={`cp__eventSaveBtn ${saved ? 'cp__eventSaveBtn--saved' : ''}`}
              disabled={saved}
              onClick={handleSave}
            >
              {saved ? 'Сохранено' : 'Сохранить'}
            </button>
            {inviteSent ? (
              <span className="cp__eventSentLabel">Заявка отправлена!</span>
            ) : (
              <button type="button" className="cp__eventPublishBtn" disabled={sending} onClick={handleInvite}>
                {sending ? 'Отправка...' : 'Пригласить провести'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function EventRecommendCard({ event, token, categories }: { event: Event; token: string | null; categories: Category[] }) {
  const navigate = useNavigate()
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [creatorName, setCreatorName] = useState<string>('')
  const [creatorPhotoUrl, setCreatorPhotoUrl] = useState<string | null>(null)
  const recCats = categories.filter(c => event.category_ids?.includes(c.id))

  useEffect(() => {
    if (!event.cover_photo_id) return
    fetchImageUrl(event.cover_photo_id).then(setCoverUrl).catch(() => {})
  }, [event.cover_photo_id, token])

  useEffect(() => {
    if (!token || !event.creator_id) return
    fetchCreatorProfile(event.creator_id, token)
      .then(prof => {
        setCreatorName(prof.name)
        const photoId = prof.photo?.id ?? prof.photo_id
        if (photoId) fetchImageUrl(photoId).then(setCreatorPhotoUrl).catch(() => {})
      })
      .catch(() => {})
  }, [event.creator_id, token])

  return (
    <div className="cp__recEventCard">
      <div className="cp__recEventCover">
        {coverUrl
          ? <img src={coverUrl} alt="" className="cp__recEventCoverImg" />
          : <div className="cp__recEventCoverPlaceholder" />}
      </div>
      <div className="cp__recEventBody">
        <h3 className="cp__recEventTitle">{event.title}</h3>
        {recCats.length > 0 && (
          <div className="cp__eventTags">
            {recCats.slice(0, 2).map(c => (
              <span key={c.id} className="cp__recEventTag">◇ {c.name}</span>
            ))}
            {recCats.length > 2 && (
              <span className="cp__eventTagMore">и ещё {recCats.length - 2}</span>
            )}
          </div>
        )}
        {event.description && <p className="cp__recEventDesc">{event.description}</p>}
        {creatorName && (
          <div
            className="cp__recEventCreator"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/creator/profile/${event.creator_id}`)}
            onKeyDown={e => e.key === 'Enter' && navigate(`/creator/profile/${event.creator_id}`)}
          >
            <div className="cp__recEventCreatorAvatar">
              {creatorPhotoUrl
                ? <img src={creatorPhotoUrl} alt="" className="cp__recEventCreatorAvatarImg" />
                : <div className="cp__recEventCreatorAvatarPlaceholder" />}
            </div>
            <span className="cp__recEventCreatorName">{creatorName}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function CreatorProfilePage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const targetUserId = userId ? Number(userId) : user?.id
  const isOwner = user?.role === 'creator' && !!targetUserId && user?.id === targetUserId
  const isVenueVisitor = user?.role === 'venue' && !isOwner

  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [activeEvents, setActiveEvents] = useState<Event[]>([])
  const [completedEvents, setCompletedEvents] = useState<Event[]>([])
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([])
  const [sentApplications, setSentApplications] = useState<Application[]>([])

  const photoFileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const activeScrollRef = useRef<HTMLDivElement>(null)
  const completedScrollRef = useRef<HTMLDivElement>(null)
  const photosScrollRef = useRef<HTMLDivElement>(null)

  const loadProfile = () => {
    if (!targetUserId || !token) return
    fetchCreatorProfile(targetUserId, token)
      .then(data => {
        console.log('CreatorProfile data:', JSON.stringify(data, null, 2))
        setProfile(data)
        const photoId = data.photo?.id ?? data.photo_id
        if (photoId) fetchImageUrl(photoId).then(setPhotoUrl).catch(() => {})
      })
      .catch(() => setError('Не удалось загрузить профиль'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId, token])

  useEffect(() => {
    fetchCategories(token).then(setCategories).catch(() => {})
    fetchEvents({ is_active: true }, token)
      .then(evts => setRecommendedEvents(evts.filter(e => e.creator_id !== targetUserId).slice(0, 2)))
      .catch(() => {})
  }, [token, targetUserId])

  useEffect(() => {
    if (!targetUserId || !token) return
    fetchEvents({ creator_id: targetUserId, is_active: true }, token)
      .then(setActiveEvents).catch(() => {})
    fetchEvents({ creator_id: targetUserId, is_completed: true }, token)
      .then(setCompletedEvents).catch(() => {})
  }, [targetUserId, token])

  useEffect(() => {
    if (!isVenueVisitor || !token) return
    fetchApplications({ role: 'sender', limit: 100 }, token)
      .then(setSentApplications)
      .catch(() => {})
  }, [isVenueVisitor, token])

  const handleDeleteEvent = async (id: number) => {
    if (!token) return
    try {
      await deleteEvent(id, token)
      setActiveEvents(prev => prev.filter(e => e.id !== id))
      setCompletedEvents(prev => prev.filter(e => e.id !== id))
    } catch { /* */ }
  }

  const handleEditEvent = (id: number) => {
    navigate(`/events/create?edit=${id}`)
  }

  const handlePublishEvent = (id: number) => {
    navigate(`/events/create?copy=${id}`)
  }

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return
    setUploadingPhoto(true)
    try {
      const uploaded = await uploadImage(file, 'venue-photo', token)
      await addCreatorPhoto(uploaded.id, token)
      loadProfile()
    } catch {
      /* */
    } finally {
      setUploadingPhoto(false)
      if (photoFileInputRef.current) photoFileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async (photoId: number) => {
    if (!token) return
    try {
      await deleteCreatorPhoto(photoId, token)
      loadProfile()
    } catch { /* */ }
  }

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

  const photos = profile?.photos ?? []

  if (isLoading) return <div className="cp__state">Загрузка...</div>
  if (error || !profile) return <div className="cp__state cp__state--error">{error ?? 'Профиль не найден'}</div>

  return (
    <div className="cp">
      <div className="cp__content">

        <div className="cp__layout">
          <div className="cp__card">
            <div className="cp__avatarWrap">
              <div className="cp__avatar">
                {photoUrl
                  ? <img src={photoUrl} alt="" className="cp__avatarImg" />
                  : <div className="cp__avatarPlaceholder" />}
              </div>
              <span className="cp__onlineDot" />
            </div>
            <div className="cp__cardInfo">
              <h1 className="cp__name">{profile.name}</h1>
              {(profile.description ?? '').trim() !== '' && (
                <p className="cp__desc">{profile.description}</p>
              )}
            </div>
          </div>

          <aside className="cp__sidebar">
            <div className="cp__sideCard">
              <div className="cp__sideHeader">
                <img src={iconSocial} alt="" className="cp__sideIcon" />
                <span className="cp__sideTitle">Социальные сети</span>
              </div>
              {socials.length > 0 ? (
                <div className="cp__socialList">
                  {socials.map((s, i) => <SocialBadge key={i} {...s} />)}
                </div>
              ) : (
                <p className="cp__socialEmpty">Ссылки не указаны</p>
              )}
            </div>
          </aside>
        </div>

        {activeEvents.length > 0 && isVenueVisitor && (
          <div className="cp__banner" style={{ backgroundImage: `url(${bannerFrame})` }}>
            <div className="cp__bannerOverlay">
              <h2 className="cp__bannerTitle">Это мероприятие ищет пространство</h2>
              <p className="cp__bannerDesc">
                Сейчас креатор ищет место, где смог бы реализовать свою идею.
                Откликнитесь — и креатор получит от вас приглашение
              </p>
            </div>
            <div className="cp__bannerArrows">
              <button type="button" className="cp__arrowBtn" onClick={() => activeScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}>‹</button>
              <button type="button" className="cp__arrowBtn" onClick={() => activeScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}>›</button>
            </div>
          </div>
        )}

        {activeEvents.length > 0 && (
          <div className="cp__eventsRow">
            <div className="cp__scroll" ref={activeScrollRef}>
              {activeEvents.map(ev => (
                <EventCard key={ev.id} event={ev} token={token} categories={categories}
                  isOwner={isOwner} isVenueVisitor={isVenueVisitor} creatorUserId={targetUserId}
                  initialInviteSent={sentApplications.some(a => a.event_id === ev.id && a.receiver_id === targetUserId && a.receiver_type === 'creator')}
                  onDelete={handleDeleteEvent} onPublish={handlePublishEvent} onEdit={handleEditEvent} />
              ))}
            </div>
          </div>
        )}

        <section className="cp__section">
          <div className="cp__sectionHeader">
            <h2 className="cp__sectionTitle">Фотографии мероприятий</h2>
            {(photos.length > 0 || isOwner) && (
              <div className="cp__arrows">
                <button type="button" className="cp__arrowBtn" onClick={() => photosScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}>‹</button>
                <button type="button" className="cp__arrowBtn" onClick={() => photosScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}>›</button>
              </div>
            )}
          </div>
          <div className="cp__scroll" ref={photosScrollRef}>
            {isOwner && (
              <>
                <input ref={photoFileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleAddPhoto} style={{ display: 'none' }} />
                <button
                  type="button"
                  className="cp__photoAdd"
                  onClick={() => photoFileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                >
                  <span className="cp__photoAddPlus">+</span>
                  <span className="cp__photoAddText">{uploadingPhoto ? 'Загрузка...' : 'Загрузить фото'}</span>
                </button>
              </>
            )}
            {photos.length === 0 && !isOwner && (
              <p className="cp__emptyMsg">Фотографий пока нет</p>
            )}
            {photos.map(item => (
              <PhotoItem key={item.id} item={item} isOwner={isOwner} onDelete={handleDeletePhoto} />
            ))}
          </div>
        </section>

        {(completedEvents.length > 0 || isOwner) && (
          <section className="cp__section">
            <div className="cp__sectionHeader">
              <h2 className="cp__sectionTitle">Проведённые мероприятия</h2>
              <div className="cp__arrows">
                <button type="button" className="cp__arrowBtn" onClick={() => completedScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}>‹</button>
                <button type="button" className="cp__arrowBtn" onClick={() => completedScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}>›</button>
              </div>
            </div>
            {completedEvents.length > 0 ? (
              <div className="cp__scroll" ref={completedScrollRef}>
                {completedEvents.map(ev => (
                  <EventCard key={ev.id} event={ev} token={token} categories={categories}
                    isOwner={isOwner} isVenueVisitor={false} creatorUserId={targetUserId}
                    onDelete={handleDeleteEvent} onPublish={handlePublishEvent} onEdit={handleEditEvent} />
                ))}
              </div>
            ) : (
              <p className="cp__emptyMsg">Проведённых мероприятий пока нет</p>
            )}
          </section>
        )}

      </div>

      {recommendedEvents.length > 0 && (
        <section className="cp__venuesSection">
          <div className="cp__venuesInner">
            <h2 className="cp__venuesTitle">Вам могут понравиться эти мероприятия</h2>
            <div className="cp__recEventsGrid">
              {recommendedEvents.map(ev => (
                <EventRecommendCard key={ev.id} event={ev} token={token} categories={categories} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
