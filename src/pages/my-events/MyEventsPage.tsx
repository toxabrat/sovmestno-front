import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Footer } from '../../components/layout/Footer'
import {
  fetchApplications,
  createApplication,
  acceptApplication,
  rejectApplication,
  fetchCollaborations,
  completeCollaboration,
  cancelCollaboration,
  type Application as APIApplication,
  type Collaboration,
} from '../../api/applications'
import { fetchEventById, fetchEvents, fetchCategories } from '../../api/events'
import { fetchCreatorProfile, fetchVenueProfile, fetchImageUrl } from '../../api/auth'
import type { VenueListItem } from '../../api/auth'
import type { Event as APIEvent, Category } from '../../api/events'
import './MyEventsPage.css'
import '../spaces/SpacesCatalogPage.css'

type SidebarTab = 'applications' | 'current' | 'saved'
type FilterTab = 'all' | 'mutual' | 'invite' | 'declined' | 'waiting'
type UIStatus = 'mutual' | 'request' | 'declined' | 'waiting'

interface DisplayApp {
  id: number
  applicationId: number
  personName: string
  avatarUrl: string | null
  avatarColor: string
  avatarEmoji: string
  eventName: string
  status: UIStatus
  date: string
  telegram?: string
  phone?: string
  email?: string
  declineReason?: string
}

type CollabStage = 'question' | 'congrats' | 'failed' | 'published'

interface DisplayCollab {
  id: number
  collaborationId: number
  personName: string
  avatarUrl: string | null
  avatarColor: string
  avatarEmoji: string
  eventName: string
  eventId: number
  date: string
  telegram: string
  phone: string
  email: string
  stage: CollabStage
}

const STATUS_LABELS: Record<UIStatus, string> = {
  mutual:   'Взаимно',
  request:  'Запрос',
  declined: 'Отказано :(',
  waiting:  'Жди ответ',
}
const STATUS_BG: Record<UIStatus, string> = {
  mutual:   '#D8F772',
  request:  '#f5a0c0',
  declined: '#8a8a8a',
  waiting:  '#d0d8f8',
}
const STATUS_TEXT: Record<UIStatus, string> = {
  mutual:   '#1a1a1a',
  request:  '#fff',
  declined: '#fff',
  waiting:  '#1a1a1a',
}

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: 'Все' },
  { key: 'mutual',   label: 'Взаимно' },
  { key: 'invite',   label: 'Приглашает' },
  { key: 'declined', label: 'Отказано :(' },
  { key: 'waiting',  label: 'Жди ответ' },
]

const AVATAR_COLORS = ['#e8c96d', '#a8d8a8', '#d8a8e0', '#a8c8e8', '#e8a8a8', '#c8d8f0']

function getSavedVenueIds(): number[] {
  try { return JSON.parse(localStorage.getItem('savedVenues') || '[]') } catch { return [] }
}
function getSavedEventIds(): number[] {
  try { return JSON.parse(localStorage.getItem('savedEvents') || '[]') } catch { return [] }
}
function removeSavedVenue(id: number) {
  const arr = getSavedVenueIds().filter(x => x !== id)
  localStorage.setItem('savedVenues', JSON.stringify(arr))
}
function removeSavedEvent(id: number) {
  const arr = getSavedEventIds().filter(x => x !== id)
  localStorage.setItem('savedEvents', JSON.stringify(arr))
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}`
}

function mapApiStatus(app: APIApplication, currentUserId: number): UIStatus {
  if (app.status === 'accepted') return 'mutual'
  if (app.status === 'rejected') return 'declined'
  if (app.status === 'pending' && app.receiver_id === currentUserId) return 'request'
  return 'waiting'
}

function AppRowHeader({ app }: { app: DisplayApp }) {
  return (
    <>
      <div className="me__appVenue">
        {app.avatarUrl ? (
          <img src={app.avatarUrl} alt="" className="me__appAvatarImg" />
        ) : (
          <div className="me__appAvatar" style={{ background: app.avatarColor }}>
            <span>{app.avatarEmoji}</span>
          </div>
        )}
        <span className="me__appVenueName">{app.personName}</span>
      </div>
      <span className="me__appEventName">{app.eventName}</span>
      <span className="me__appStatus" style={{ background: STATUS_BG[app.status], color: STATUS_TEXT[app.status] }}>
        {STATUS_LABELS[app.status]}
      </span>
      <span className="me__appDate">{app.date}</span>
    </>
  )
}

function CreatorExpanded({ app, onAccept, onReject }: {
  app: DisplayApp
  onAccept: (id: number) => void
  onReject: (id: number) => void
}) {
  const navigate = useNavigate()

  if (app.status === 'mutual') {
    return (
      <div className="me__appDetails">
        <div className="me__contactLeft">
          <h3 className="me__contactTitle">Контакты для связи</h3>
          <p className="me__contactDesc">
            Ура! Вы взаимно заинтересованы в совместном мероприятии.
            Воспользуйтесь персональными контактами, чтобы договориться о нюансах
          </p>
        </div>
        <div className="me__contactRight">
          {app.phone && (
            <div className="me__contactRow">
              <span className="me__contactLabel">Контактный телефон</span>
              <a href={`tel:${app.phone}`} className="me__contactValue">{app.phone}</a>
            </div>
          )}
          {app.email && (
            <div className="me__contactRow">
              <span className="me__contactLabel">Рабочая почта</span>
              <a href={`mailto:${app.email}`} className="me__contactValue">{app.email}</a>
            </div>
          )}
          {app.telegram && (
            <div className="me__contactRow">
              <span className="me__contactLabel">Аккаунт в telegram</span>
              <a href={`https://t.me/${app.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="me__contactValue">{app.telegram}</a>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (app.status === 'request') {
    return (
      <div className="me__appDetails me__appDetails--request">
        <div className="me__requestLeft">
          <h3 className="me__requestTitle">Пространство выбрало ваше мероприятие</h3>
          <p className="me__contactDesc">
            Отвечая «Принять приглашение», вы даёте согласие на обмен персональными контактами
            для дальнейшего согласования мероприятия
          </p>
        </div>
        <div className="me__requestActions">
          <button type="button" className="me__currentBtnOutline" onClick={() => onReject(app.applicationId)}>Отказаться</button>
          <button type="button" className="me__currentBtnFilled" onClick={() => onAccept(app.applicationId)}>Принять предложение</button>
        </div>
      </div>
    )
  }

  if (app.status === 'declined') {
    return (
      <div className="me__appDetails me__appDetails--declined">
        <div className="me__declinedContent">
          <h3 className="me__declinedTitle">К сожалению, пространство пока не готово<br />провести ваше мероприятие</h3>
        </div>
      </div>
    )
  }

  if (app.status === 'waiting') {
    return (
      <div className="me__appDetails me__appDetails--waiting">
        <div className="me__waitingLeft">
          <h3 className="me__waitingTitle">Пу-пу-пу... пространство пока молчит</h3>
          <p className="me__contactDesc">
            Но не беда! Вы можете предлагать свою инициативу неограниченному количеству пространств
          </p>
        </div>
        <button type="button" className="me__currentBtnFilled" onClick={() => navigate('/spaces')}>
          Перейти в каталог пространств
        </button>
      </div>
    )
  }

  return null
}

function VenueExpanded({ app, onAccept, onReject }: {
  app: DisplayApp
  onAccept: (id: number) => void
  onReject: (id: number) => void
}) {
  const navigate = useNavigate()

  if (app.status === 'mutual') {
    return (
      <div className="me__appDetails me__appDetails--slim">
        <div className="me__contactLeft">
          <h3 className="me__contactTitle">Контакты для связи</h3>
          <p className="me__contactDesc">
            Ура! Вы взаимно заинтересованы в совместном мероприятии.
            Воспользуйтесь персональными контактами, чтобы договориться о нюансах
          </p>
        </div>
        <div className="me__contactRight">
          {app.telegram && (
            <div className="me__contactRow">
              <span className="me__contactLabel">Аккаунт в telegram</span>
              <a href={`https://t.me/${app.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="me__contactValue">{app.telegram}</a>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (app.status === 'request') {
    return (
      <div className="me__appDetails me__appDetails--request">
        <div className="me__requestLeft">
          <h3 className="me__requestTitle">Креатору нравится ваше пространство</h3>
          <p className="me__contactDesc">
            Отвечая «Принять приглашение», вы даёте согласие на обмен персональными контактами
            для дальнейшего согласования мероприятия
          </p>
        </div>
        <div className="me__requestActions">
          <button type="button" className="me__currentBtnOutline" onClick={() => onReject(app.applicationId)}>Отказаться</button>
          <button type="button" className="me__currentBtnFilled" onClick={() => onAccept(app.applicationId)}>Принять предложение</button>
        </div>
      </div>
    )
  }

  if (app.status === 'declined') {
    return (
      <div className="me__appDetails me__appDetails--declined">
        <div className="me__declinedContent">
          <h3 className="me__declinedTitle">К сожалению, креатор не готов<br />провести у вас мероприятие по причине:</h3>
          {app.declineReason && (
            <span className="me__declinedTag">{app.declineReason}</span>
          )}
        </div>
        <div className="me__declinedIllustration">
          <span className="me__declinedIllustrationCircles">
            <span /><span /><span />
          </span>
        </div>
      </div>
    )
  }

  if (app.status === 'waiting') {
    return (
      <div className="me__appDetails me__appDetails--waiting">
        <div className="me__waitingLeft">
          <h3 className="me__waitingTitle">Пу-пу-пу... креатор пока молчит</h3>
          <p className="me__contactDesc">
            Но не беда! Вы можете поискать другие мероприятия и создателей в каталоге мероприятий
          </p>
        </div>
        <button type="button" className="me__currentBtnFilled" onClick={() => navigate('/events')}>
          Перейти в каталог мероприятий
        </button>
      </div>
    )
  }

  return null
}

function ApplicationRow({ app, isExpanded, onToggle, isVenue, onAccept, onReject }: {
  app: DisplayApp
  isExpanded: boolean
  onToggle: () => void
  isVenue: boolean
  onAccept: (id: number) => void
  onReject: (id: number) => void
}) {
  return (
    <div className={`me__appRow ${isExpanded ? 'me__appRow--expanded' : ''}`}>
      <button type="button" className="me__appMain" onClick={onToggle}>
        <AppRowHeader app={app} />
      </button>
      {isExpanded && (
        isVenue
          ? <VenueExpanded app={app} onAccept={onAccept} onReject={onReject} />
          : <CreatorExpanded app={app} onAccept={onAccept} onReject={onReject} />
      )}
    </div>
  )
}

function CollabHeader({ item }: { item: DisplayCollab }) {
  return (
    <div className="me__currentHeader">
      <div className="me__appVenue">
        {item.avatarUrl ? (
          <img src={item.avatarUrl} alt="" className="me__appAvatarImg" />
        ) : (
          <div className="me__appAvatar" style={{ background: item.avatarColor }}>
            <span>{item.avatarEmoji}</span>
          </div>
        )}
        <span className="me__appVenueName">{item.personName}</span>
      </div>
      <span className="me__appEventName">{item.eventName}</span>
      <span className="me__appStatus" style={{ background: STATUS_BG.mutual, color: STATUS_TEXT.mutual }}>
        Взаимно
      </span>
      <span className="me__appDate">{item.date}</span>
    </div>
  )
}

function CreatorCollabCard({ item, onComplete, onCancel, onShare, onEdit, onRemove }: {
  item: DisplayCollab
  onComplete: (id: number) => void
  onCancel: (id: number) => void
  onShare: (collabId: number) => void
  onEdit: (eventId: number) => void
  onRemove: (collabId: number) => void
}) {
  const stageStep: Record<CollabStage, number> = { question: 0, congrats: 1, published: 2, failed: -1 }
  const step = stageStep[item.stage]

  return (
    <div className="me__currentCard">
      <CollabHeader item={item} />

      <div className="me__currentContacts">
        {item.phone ? (
          <div className="me__currentContactItem">
            <span className="me__contactLabel">Контактный телефон</span>
            <a href={`tel:${item.phone}`} className="me__contactValue">{item.phone}</a>
          </div>
        ) : <div className="me__currentContactItem" />}
        {item.email ? (
          <div className="me__currentContactItem">
            <span className="me__contactLabel">Рабочая почта</span>
            <a href={`mailto:${item.email}`} className="me__contactValue">{item.email}</a>
          </div>
        ) : <div className="me__currentContactItem" />}
        {item.telegram ? (
          <div className="me__currentContactItem">
            <span className="me__contactLabel">Аккаунт в telegram</span>
            <a href={`https://t.me/${item.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="me__contactValue">{item.telegram}</a>
          </div>
        ) : <div className="me__currentContactItem" />}
      </div>

      <div className="me__currentFooter me__currentFooter--withDots">
        {step >= 0 && (
          <div className="me__collabDots">
            {[0, 1, 2].map(i => (
              <span key={i} className={`me__dot ${step === i ? 'me__dot--active' : ''}`} />
            ))}
          </div>
        )}

        {item.stage === 'question' && (
          <>
            <div className="me__currentFooterLeft">
              <h3 className="me__currentFooterTitle">Удалось провести мероприятие в этом пространстве?</h3>
              <p className="me__currentFooterDesc">
                Отвечая «Мероприятие было проведено», вы подтверждаете завершение сотрудничества
              </p>
            </div>
            <div className="me__currentFooterActions">
              <button type="button" className="me__currentBtnOutline" onClick={() => onCancel(item.collaborationId)}>Не удалось</button>
              <button type="button" className="me__currentBtnFilled" onClick={() => onComplete(item.collaborationId)}>Мероприятие было проведено</button>
            </div>
          </>
        )}

        {item.stage === 'congrats' && (
          <>
            <div className="me__currentFooterLeft">
              <h3 className="me__currentFooterTitle">Поздравляем!</h3>
              <p className="me__currentFooterDesc">
                Поделитесь успешным кейсом у себя на странице. Это повысит к вам доверие как к опытному креатору
              </p>
            </div>
            <div className="me__currentFooterActions">
              <button type="button" className="me__currentBtnFilled" onClick={() => onShare(item.collaborationId)}>Поделиться</button>
            </div>
          </>
        )}

        {item.stage === 'published' && (
          <div className="me__currentFooterLeft">
            <h3 className="me__currentFooterTitle">Кейс опубликован</h3>
            <p className="me__currentFooterDesc">
              Он будет находиться на вашей личной странице и будет виден всем пользователям
            </p>
          </div>
        )}

        {item.stage === 'failed' && (
          <>
            <div className="me__currentFooterLeft">
              <h3 className="me__currentFooterTitle">И такое бывает!</h3>
              <p className="me__currentFooterDesc">
                Не переживайте, в следующий раз обязательно получится
              </p>
            </div>
            <div className="me__currentFooterActions">
              <button type="button" className="me__currentBtnOutline" onClick={() => onRemove(item.collaborationId)}>Больше не актуально</button>
              <button type="button" className="me__currentBtnFilled" onClick={() => onEdit(item.eventId)}>Разместить заново</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function VenueCollabCard({ item, onComplete, onCancel }: {
  item: DisplayCollab
  onComplete: (id: number) => void
  onCancel: (id: number) => void
}) {
  return (
    <div className="me__currentCard">
      <CollabHeader item={item} />

      <div className="me__currentContacts">
        {item.telegram ? (
          <div className="me__currentContactItem">
            <span className="me__contactLabel">Аккаунт в telegram</span>
            <a href={`https://t.me/${item.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="me__contactValue">{item.telegram}</a>
          </div>
        ) : null}
      </div>

      <div className="me__currentFooter">
        <div className="me__currentFooterLeft">
          <h3 className="me__currentFooterTitle">Удалось провести мероприятие?</h3>
          <p className="me__currentFooterDesc">
            Отвечая «Мероприятие было проведено», вы подтверждаете завершение сотрудничества
          </p>
        </div>
        <div className="me__currentFooterActions">
          <button type="button" className="me__currentBtnOutline" onClick={() => onCancel(item.collaborationId)}>Не удалось</button>
          <button type="button" className="me__currentBtnFilled" onClick={() => onComplete(item.collaborationId)}>Мероприятие было проведено</button>
        </div>
      </div>
    </div>
  )
}

function SavedVenueCard({ venue, token, onRemove, onPropose }: {
  venue: VenueListItem
  token: string | null
  onRemove: (userId: number) => void
  onPropose: (venue: VenueListItem) => void
}) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    const logoId = venue.logo_id ?? (venue.logo as { id?: number } | undefined)?.id
    if (logoId) fetchImageUrl(logoId, token).then(setLogoUrl).catch(() => {})
  }, [venue, token])

  return (
    <div className="me__savedCard">
      <div className="me__savedTop">
        <div className="me__savedAvatarLarge">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="me__savedAvatarImg" />
          ) : (
            <div className="me__savedAvatarDefault" />
          )}
          <span className="me__savedOnline" />
        </div>
        <div className="me__savedInfo">
          <h3 className="me__savedName">{venue.name}</h3>
          <p className="me__savedDesc">{venue.description ?? ''}</p>
        </div>
      </div>
      <div className="me__savedActions">
        <button type="button" className="me__savedBtnOutline" onClick={() => onRemove(venue.user_id)}>Отменить сохранение</button>
        <button type="button" className="me__savedBtnFilled" onClick={() => onPropose(venue)}>Предложить мероприятие</button>
      </div>
    </div>
  )
}

function SavedEventCard({ ev, token, isInvited, onRemove, onInvite }: {
  ev: APIEvent
  token: string | null
  isInvited: boolean
  onRemove: (id: number) => void
  onInvite: (ev: APIEvent) => void
}) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [creatorName, setCreatorName] = useState('')
  const [creatorAvatarUrl, setCreatorAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    if (ev.cover_photo_id) fetchImageUrl(ev.cover_photo_id, token).then(setCoverUrl).catch(() => {})
    fetchCreatorProfile(ev.creator_id, token)
      .then(p => {
        setCreatorName(p.name)
        if (p.photo_id) fetchImageUrl(p.photo_id, token).then(setCreatorAvatarUrl).catch(() => {})
      })
      .catch(() => {})
  }, [ev, token])

  return (
    <div className="me__eventCard">
      <div className="me__eventCardTop">
        <div className="me__eventCoverBox">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="me__eventCoverImg" />
          ) : (
            <div className="me__eventCoverDefault" />
          )}
        </div>
        <div className="me__eventCardBody">
          <h3 className="me__eventCardTitle">{ev.title}</h3>
          {ev.description && <p className="me__eventCardDesc">{ev.description}</p>}
          {creatorName && (
            <div className="me__eventCreator">
              <div className="me__eventCreatorAvatar">
                {creatorAvatarUrl
                  ? <img src={creatorAvatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : null}
              </div>
              <span className="me__eventCreatorName">{creatorName}</span>
            </div>
          )}
        </div>
      </div>
      <div className="me__eventCardActions">
        <button type="button" className="me__savedBtnOutline" onClick={() => onRemove(ev.id)}>Отменить сохранение</button>
        {isInvited ? (
          <span className="me__inviteSentLabel">Заявка отправлена</span>
        ) : (
          <button type="button" className="me__savedBtnFilled" onClick={() => onInvite(ev)}>Пригласить провести</button>
        )}
      </div>
    </div>
  )
}

function ProposeEventThumb({ imageId, token }: { imageId?: number; token: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!imageId) return
    fetchImageUrl(imageId, token).then(setUrl).catch(() => {})
  }, [imageId, token])
  return (
    <div className="proposeModal__eventThumb">
      {url ? <img src={url} alt="" /> : <div className="proposeModal__eventThumbPlaceholder" />}
    </div>
  )
}

function ProposeEventModal({
  venue,
  myEvents,
  categories,
  token,
  onClose,
}: {
  venue: VenueListItem
  myEvents: APIEvent[]
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
      await createApplication({
        receiver_id: venue.user_id,
        receiver_type: 'venue',
        event_id: selected,
      }, token)
      setSent(true)
    } catch { /* */ }
    finally { setSending(false) }
  }

  return (
    <div className="proposeOverlay" onClick={onClose}>
      <div className="proposeModal" onClick={e => e.stopPropagation()}>
        <button type="button" className="proposeModal__close" onClick={onClose}>✕</button>
        <div className="proposeModal__header">
          <div className="proposeModal__venueAvatar">
            <div style={{ width: '100%', height: '100%', background: '#e8e4f8', borderRadius: '50%' }} />
          </div>
          <div>
            <h2 className="proposeModal__venueName">{venue.name}</h2>
            {venue.description && <p className="proposeModal__venueDesc">{venue.description}</p>}
          </div>
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
                    <ProposeEventThumb imageId={ev.cover_photo_id} token={token} />
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

export function MyEventsPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const isVenue = user?.role === 'venue'

  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('applications')
  const [filter, setFilter] = useState<FilterTab>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const [apps, setApps] = useState<DisplayApp[]>([])
  const [appsLoading, setAppsLoading] = useState(false)

  const [collabs, setCollabs] = useState<DisplayCollab[]>([])
  const [collabsLoading, setCollabsLoading] = useState(false)

  const [savedVenues, setSavedVenues] = useState<VenueListItem[]>([])
  const [savedEvents, setSavedEvents] = useState<APIEvent[]>([])
  const [savedLoading, setSavedLoading] = useState(false)

  const [invitedEventIds, setInvitedEventIds] = useState<Set<number>>(new Set())

  const [proposeVenue, setProposeVenue] = useState<VenueListItem | null>(null)
  const [myCreatorEvents, setMyCreatorEvents] = useState<APIEvent[]>([])
  const [myCategories, setMyCategories] = useState<Category[]>([])

  const loadApplications = useCallback(async () => {
    if (!token || !user) return
    setAppsLoading(true)
    try {
      const raw: APIApplication[] = await fetchApplications({ role: 'any', limit: 100 }, token)

      const enriched: DisplayApp[] = await Promise.all(
        raw.map(async (a, idx) => {
          const isCurrentUserSender = a.sender_id === user.id
          const otherUserId = isCurrentUserSender ? a.receiver_id : a.sender_id
          const otherType = isCurrentUserSender ? a.receiver_type : a.sender_type
          const uiStatus = mapApiStatus(a, user.id)

          let personName = 'Пользователь'
          let telegram = ''
          let phone = ''
          let email = ''
          let avatarUrl: string | null = null

          try {
            if (otherType === 'venue') {
              const prof = await fetchVenueProfile(otherUserId, token)
              personName = prof.name
              telegram = prof.tg_personal_link || prof.tg_channel_link || ''
              phone = prof.phone || ''
              email = prof.work_email || ''
              if (prof.logo_id) {
                try { avatarUrl = await fetchImageUrl(prof.logo_id, token) } catch { /* */ }
              }
            } else {
              const prof = await fetchCreatorProfile(otherUserId, token)
              personName = prof.name
              telegram = prof.tg_personal_link || prof.tg_channel_link || ''
              phone = prof.phone || ''
              email = prof.work_email || ''
              if (prof.photo_id) {
                try { avatarUrl = await fetchImageUrl(prof.photo_id, token) } catch { /* */ }
              }
            }
          } catch { /* */ }

          let eventName = `Мероприятие #${a.event_id}`
          try {
            const ev = await fetchEventById(a.event_id, token)
            eventName = ev.title
          } catch { /* */ }

          return {
            id: a.id,
            applicationId: a.id,
            personName,
            avatarUrl,
            avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
            avatarEmoji: otherType === 'venue' ? '🏠' : '🎨',
            eventName,
            status: uiStatus,
            date: formatDate(a.created_at),
            telegram: telegram || undefined,
            phone: phone || undefined,
            email: email || undefined,
          }
        }),
      )

      setApps(enriched)
    } catch (err) {
      console.error('Failed to load applications:', err)
    } finally {
      setAppsLoading(false)
    }
  }, [token, user])

  const loadCollaborations = useCallback(async () => {
    if (!token || !user) return
    setCollabsLoading(true)
    try {
      const raw: Collaboration[] = await fetchCollaborations({ status: 'pending', limit: 100 }, token)

      const enriched: DisplayCollab[] = await Promise.all(
        raw.map(async (c, idx) => {
          const otherId = isVenue ? c.creator_user_id : c.venue_user_id

          let personName = 'Пользователь'
          let telegram = ''
          let phone = ''
          let email = ''
          let avatarUrl: string | null = null

          try {
            if (isVenue) {
              const prof = await fetchCreatorProfile(otherId, token)
              personName = prof.name
              telegram = prof.tg_personal_link || prof.tg_channel_link || ''
              phone = prof.phone || ''
              email = prof.work_email || ''
              if (prof.photo_id) {
                try { avatarUrl = await fetchImageUrl(prof.photo_id, token) } catch { /* */ }
              }
            } else {
              const prof = await fetchVenueProfile(otherId, token)
              personName = prof.name
              telegram = prof.tg_personal_link || prof.tg_channel_link || ''
              phone = prof.phone || ''
              email = prof.work_email || ''
              if (prof.logo_id) {
                try { avatarUrl = await fetchImageUrl(prof.logo_id, token) } catch { /* */ }
              }
            }
          } catch { /* */ }

          let eventName = `Мероприятие #${c.event_id}`
          try {
            const ev = await fetchEventById(c.event_id, token)
            eventName = ev.title
          } catch { /* */ }

          return {
            id: c.id,
            collaborationId: c.id,
            personName,
            avatarUrl,
            avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
            avatarEmoji: isVenue ? '🎨' : '🏠',
            eventName,
            eventId: c.event_id,
            date: formatDate(c.created_at),
            telegram: telegram || '',
            phone: phone || '',
            email: email || '',
            stage: 'question' as CollabStage,
          }
        }),
      )

      setCollabs(enriched)
    } catch (err) {
      console.error('Failed to load collaborations:', err)
    } finally {
      setCollabsLoading(false)
    }
  }, [token, user, isVenue])

  const loadSaved = useCallback(async () => {
    if (!token) return
    setSavedLoading(true)
    try {
      if (isVenue) {
        const ids = getSavedEventIds()
        if (ids.length > 0) {
          const evts = await Promise.all(
            ids.map(id => fetchEventById(id, token).catch(() => null))
          )
          setSavedEvents(evts.filter((e): e is APIEvent => e !== null))
        } else {
          setSavedEvents([])
        }
      } else {
        const ids = getSavedVenueIds()
        if (ids.length > 0) {
          const venues = await Promise.all(
            ids.map(id =>
              fetchVenueProfile(id, token)
                .then(v => ({ ...v, user_id: id } as VenueListItem))
                .catch(() => null)
            )
          )
          setSavedVenues(venues.filter((v): v is VenueListItem => v !== null))
        } else {
          setSavedVenues([])
        }
      }
    } catch { /* */ }
    finally { setSavedLoading(false) }
  }, [token, isVenue])

  useEffect(() => {
    if (sidebarTab === 'applications') loadApplications()
    if (sidebarTab === 'current') loadCollaborations()
    if (sidebarTab === 'saved') loadSaved()
  }, [sidebarTab, loadApplications, loadCollaborations, loadSaved])

  useEffect(() => {
    if (!token || !user || isVenue) return
    fetchEvents({ creator_id: user.id, is_active: true }, token).then(setMyCreatorEvents).catch(() => {})
    fetchCategories(token).then(setMyCategories).catch(() => {})
  }, [token, user, isVenue])

  const handleAccept = async (appId: number) => {
    if (!token) return
    try {
      await acceptApplication(appId, token)
      await loadApplications()
    } catch (err) {
      console.error('Accept failed:', err)
    }
  }

  const handleReject = async (appId: number) => {
    if (!token) return
    try {
      await rejectApplication(appId, token)
      await loadApplications()
    } catch (err) {
      console.error('Reject failed:', err)
    }
  }

  const handleComplete = async (collabId: number) => {
    if (!token) return
    try {
      await completeCollaboration(collabId, token)
      setCollabs(prev => prev.map(c =>
        c.collaborationId === collabId ? { ...c, stage: 'congrats' as CollabStage } : c,
      ))
    } catch (err) {
      console.error('Complete failed:', err)
    }
  }

  const handleCancel = async (collabId: number) => {
    if (!token) return
    try {
      await cancelCollaboration(collabId, token)
      setCollabs(prev => prev.map(c =>
        c.collaborationId === collabId ? { ...c, stage: 'failed' as CollabStage } : c,
      ))
    } catch (err) {
      console.error('Cancel failed:', err)
    }
  }

  const handleShare = (collabId: number) => {
    setCollabs(prev => prev.map(c =>
      c.collaborationId === collabId ? { ...c, stage: 'published' as CollabStage } : c,
    ))
  }

  const handleRemove = (collabId: number) => {
    setCollabs(prev => prev.filter(c => c.collaborationId !== collabId))
  }

  const handleEdit = (eventId: number) => {
    navigate(`/events/create?edit=${eventId}`)
  }

  const requestCount = apps.filter(a => a.status === 'request').length
  const filtered = filter === 'all'
    ? apps
    : apps.filter(a => {
        if (filter === 'invite') return a.status === 'request'
        return a.status === filter
      })

  const savedLabel = isVenue ? 'Сохранённые мероприятия' : 'Сохранённые пространства'

  return (
    <div className="me">
      <div className="me__layout">
        <aside className="me__sidebar">
          <button
            type="button"
            className={`me__sideBtn ${sidebarTab === 'applications' ? 'me__sideBtn--active' : ''}`}
            onClick={() => setSidebarTab('applications')}
          >
            Заявки мероприятий
            {requestCount > 0 && <span className="me__sideBadge">{requestCount}</span>}
          </button>
          <button
            type="button"
            className={`me__sideBtn ${sidebarTab === 'current' ? 'me__sideBtn--active' : ''}`}
            onClick={() => setSidebarTab('current')}
          >
            Текущие мероприятия
          </button>
          <button
            type="button"
            className={`me__sideBtn ${sidebarTab === 'saved' ? 'me__sideBtn--active' : ''}`}
            onClick={() => setSidebarTab('saved')}
          >
            {savedLabel}
          </button>
        </aside>

        <main className="me__main">
          {sidebarTab === 'applications' && (
            <>
              <h1 className="me__title">Заявки мероприятий</h1>
              <div className="me__filters">
                {FILTER_TABS.map(t => (
                  <button
                    key={t.key}
                    type="button"
                    className={`me__filterBtn ${filter === t.key ? 'me__filterBtn--active' : ''}`}
                    onClick={() => setFilter(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="me__appList">
                {appsLoading ? (
                  <p className="me__emptyInCard">Загрузка...</p>
                ) : filtered.length === 0 ? (
                  <p className="me__emptyInCard">Заявок пока нет</p>
                ) : (
                  filtered.map(app => (
                    <ApplicationRow
                      key={app.id}
                      app={app}
                      isExpanded={expandedId === app.id}
                      onToggle={() => setExpandedId(prev => prev === app.id ? null : app.id)}
                      isVenue={isVenue}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {sidebarTab === 'current' && (
            <>
              <div className="me__titleRow">
                <h1 className="me__title">Текущие мероприятия</h1>
                <span className="me__titleDot" />
              </div>
              <p className="me__subtitle">
                Здесь находятся мероприятия, которые получили взаимные отклики.
                Расскажите о дальнейшей судьбе мероприятия
              </p>
              {collabsLoading ? (
                <p className="me__empty">Загрузка...</p>
              ) : collabs.length > 0 ? (
                <div className="me__currentList">
                  {collabs.map(c => (
                    isVenue ? (
                      <VenueCollabCard
                        key={c.id}
                        item={c}
                        onComplete={handleComplete}
                        onCancel={handleCancel}
                      />
                    ) : (
                      <CreatorCollabCard
                        key={c.id}
                        item={c}
                        onComplete={handleComplete}
                        onCancel={handleCancel}
                        onShare={handleShare}
                        onEdit={handleEdit}
                        onRemove={handleRemove}
                      />
                    )
                  ))}
                </div>
              ) : (
                <p className="me__empty">Текущих мероприятий пока нет</p>
              )}
            </>
          )}

          {sidebarTab === 'saved' && (
            <>
              <h1 className="me__title">{savedLabel}</h1>
              <p className="me__subtitle">
                Здесь находятся мероприятия, которые получили взаимные отклики.
                Расскажите о дальнейшей судьбе мероприятия
              </p>
              {savedLoading ? (
                <p className="me__empty">Загрузка...</p>
              ) : isVenue ? (
                savedEvents.length > 0 ? (
                  <div className="me__savedList">
                    {savedEvents.map(ev => (
                      <SavedEventCard
                        key={ev.id}
                        ev={ev}
                        token={token}
                        onRemove={(id) => { removeSavedEvent(id); setSavedEvents(prev => prev.filter(e => e.id !== id)) }}
                        isInvited={invitedEventIds.has(ev.id)}
                        onInvite={async (evt) => {
                          if (!token) return
                          try {
                            await createApplication({ receiver_id: evt.creator_id, receiver_type: 'creator', event_id: evt.id }, token)
                            setInvitedEventIds(prev => new Set([...prev, evt.id]))
                          } catch { /* ignore */ }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="me__empty">Сохранённых мероприятий пока нет</p>
                )
              ) : (
                savedVenues.length > 0 ? (
                  <div className="me__savedList">
                    {savedVenues.map(v => (
                      <SavedVenueCard
                        key={v.user_id}
                        venue={v}
                        token={token}
                        onRemove={(uid) => { removeSavedVenue(uid); setSavedVenues(prev => prev.filter(x => x.user_id !== uid)) }}
                        onPropose={(venue) => setProposeVenue(venue)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="me__empty">Сохранённых пространств пока нет</p>
                )
              )}
            </>
          )}
        </main>
      </div>

      <Footer />

      {proposeVenue && token && (
        <ProposeEventModal
          venue={proposeVenue}
          myEvents={myCreatorEvents}
          categories={myCategories}
          token={token}
          onClose={() => setProposeVenue(null)}
        />
      )}
    </div>
  )
}
