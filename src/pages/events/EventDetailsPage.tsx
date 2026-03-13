import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchEventById, fetchCategories } from '../../api/events'
import { fetchCreatorProfile, fetchImageUrl } from '../../api/auth'
import type { Event, Category } from '../../api/events'
import type { CreatorProfile } from '../../api/auth'
import './EventDetailsPage.css'

export function EventDetailsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { token } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [creator, setCreator] = useState<CreatorProfile | null>(null)
  const [creatorAvatarUrl, setCreatorAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) return
    const id = Number(eventId)
    if (Number.isNaN(id)) {
      setError('Некорректный ID мероприятия')
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    fetchEventById(id, token)
      .then(data => setEvent(data))
      .catch(() => setError('Не удалось загрузить мероприятие'))
      .finally(() => setIsLoading(false))
  }, [eventId, token])

  useEffect(() => {
    fetchCategories(token).then(setCategories).catch(() => {})
  }, [token])

  useEffect(() => {
    if (!event?.cover_photo_id || !token) return
    fetchImageUrl(event.cover_photo_id, token).then(setCoverUrl).catch(() => {})
  }, [event?.cover_photo_id, token])

  useEffect(() => {
    if (!event?.creator_id || !token) return
    fetchCreatorProfile(event.creator_id, token)
      .then(data => {
        setCreator(data)
        const avatarId = data.photo?.id ?? data.photo_id
        if (avatarId) {
          fetchImageUrl(avatarId, token).then(setCreatorAvatarUrl).catch(() => {})
        }
      })
      .catch(() => {})
  }, [event?.creator_id, token])

  if (isLoading) return <div className="eventDetails__state">Загрузка...</div>
  if (error || !event) return <div className="eventDetails__state eventDetails__state--error">{error ?? 'Мероприятие не найдено'}</div>

  const cat = categories.find(c => event.category_ids?.includes(c.id))

  return (
    <div className="eventDetails">
      <div className="eventDetails__content">
        <Link to="/events" className="eventDetails__back">← Назад к мероприятиям</Link>

        <div className="eventDetails__card">
          <div className="eventDetails__cover">
            {coverUrl
              ? <img src={coverUrl} alt={event.title} className="eventDetails__coverImg" />
              : <div className="eventDetails__coverPlaceholder" />}
          </div>
          <div className="eventDetails__body">
            <h1 className="eventDetails__title">{event.title}</h1>
            {cat && <span className="eventDetails__tag">{cat.name}</span>}
            {event.description && <p className="eventDetails__desc">{event.description}</p>}
            {creator && (
              <Link to={`/creator/profile/${event.creator_id}`} className="eventDetails__creator">
                <div className="eventDetails__creatorAvatar">
                  {creatorAvatarUrl
                    ? <img src={creatorAvatarUrl} alt="" className="eventDetails__creatorImg" />
                    : <div className="eventDetails__creatorPlaceholder" />}
                </div>
                <span className="eventDetails__creatorName">{creator.name}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
