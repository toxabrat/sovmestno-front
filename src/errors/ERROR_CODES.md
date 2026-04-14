# Error Codes Reference

Все ошибки возвращаются в едином формате:
```json
{
  "errors": [
    { "code": "ERROR_CODE", "message": "Human-readable description" }
  ]
}
```

---

## Глобальные коды (любая защищённая ручка)

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Отсутствует или невалидный токен |
| `INVALID_TOKEN` | 401 | Токен просрочен или подпись не совпадает |
| `SERVICE_UNAVAILABLE` | 503 | Downstream сервис недоступен |
| `INTERNAL_ERROR` | 500 | Внутренняя ошибка сервера |

---

## Аутентификация

### `POST /api/user/auth/register/creator`
### `POST /api/user/auth/register/venue`

| Code | HTTP | Когда |
|------|------|-------|
| `FIELD_REQUIRED` | 400 | Не передан `email`, `password` или `name` |
| `INVALID_EMAIL` | 400 | Некорректный формат email |
| `PASSWORD_TOO_SHORT` | 400 | Пароль короче 8 символов |
| `PASSWORD_TOO_LONG` | 400 | Пароль длиннее 72 символов |
| `VALUE_TOO_SHORT` | 400 | `name` короче 2 символов |
| `VALUE_TOO_LONG` | 400 | `name` > 100, `description` > 2000, `street_address` > 500 |
| `INVALID_PHONE` | 400 | Телефон не в формате E.164 (нужно: `+79001234567`) |
| `INVALID_URL` | 400 | Ссылка без схемы или невалидная (нужно: `https://...`) |
| `EMAIL_ALREADY_EXISTS` | 409 | Пользователь с таким email уже существует |
| `INTERNAL_ERROR` | 500 | Ошибка сохранения |

### `POST /api/user/auth/register/admin`

| Code | HTTP | Когда |
|------|------|-------|
| `FIELD_REQUIRED` | 400 | Не передан `email`, `password` или `admin_secret` |
| `INVALID_EMAIL` | 400 | Некорректный формат email |
| `PASSWORD_TOO_SHORT` | 400 | Пароль короче 8 символов |
| `PASSWORD_TOO_LONG` | 400 | Пароль длиннее 72 символов |
| `INVALID_ADMIN_SECRET` | 403 | Неверный секретный ключ администратора |
| `EMAIL_ALREADY_EXISTS` | 409 | Пользователь с таким email уже существует |
| `INTERNAL_ERROR` | 500 | Ошибка сохранения |

### `POST /api/user/auth/login`

| Code | HTTP | Когда |
|------|------|-------|
| `FIELD_REQUIRED` | 400 | Не передан `email` или `password` |
| `INVALID_EMAIL` | 400 | Некорректный формат email |
| `INVALID_CREDENTIALS` | 401 | Неверный email или пароль |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

### `POST /api/auth/refresh`

| Code | HTTP | Когда |
|------|------|-------|
| `FIELD_REQUIRED` | 400 | Не передан `refresh_token` |
| `INVALID_REFRESH_TOKEN` | 401 | Токен невалиден, просрочен или отозван |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

### `POST /api/auth/logout`

| Code | HTTP | Когда |
|------|------|-------|
| `FIELD_REQUIRED` | 400 | Не передан `refresh_token` |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

### `POST /api/auth/logout-all` 🔒

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `INVALID_TOKEN` | 401 | Невалидный токен |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

---

## Профили

### `GET /api/user/profile/me` 🔒

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `PROFILE_NOT_FOUND` | 404 | Профиль не найден |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

### `POST /api/user/creator` 🔒 (creator)
### `POST /api/user/venue` 🔒 (venue)

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `FIELD_REQUIRED` | 400 | Не передан `name` |
| `VALUE_TOO_SHORT` | 400 | `name` короче 2 символов |
| `VALUE_TOO_LONG` | 400 | `name` > 100, `description` > 2000, `street_address` > 500 |
| `INVALID_PHONE` | 400 | Телефон не в формате E.164 |
| `INVALID_URL` | 400 | Ссылка без схемы или невалидная |
| `INVALID_EMAIL` | 400 | Некорректный формат `work_email` |
| `PROFILE_ALREADY_EXISTS` | 409 | Профиль уже создан для этого пользователя |
| `INTERNAL_ERROR` | 500 | Ошибка сохранения |

### `GET /api/user/creator/:user_id`
### `GET /api/user/venue/:user_id`

| Code | HTTP | Когда |
|------|------|-------|
| `INVALID_ID` | 400 | `user_id` не является числом |
| `CREATOR_NOT_FOUND` / `VENUE_NOT_FOUND` | 404 | Профиль не найден |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

### `PUT /api/user/creator/:user_id` 🔒 (creator)
### `PUT /api/user/venue/:user_id` 🔒 (venue)

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `INVALID_ID` | 400 | `user_id` не является числом |
| `VALUE_TOO_SHORT` | 400 | `name` короче 2 символов |
| `VALUE_TOO_LONG` | 400 | `name` > 100, `description` > 2000, `street_address` > 500 |
| `INVALID_PHONE` | 400 | Телефон не в формате E.164 |
| `INVALID_URL` | 400 | Ссылка без схемы или невалидная |
| `INVALID_EMAIL` | 400 | Некорректный формат `work_email` |
| `ACCESS_DENIED` | 403 | Попытка редактировать чужой профиль |
| `CREATOR_NOT_FOUND` / `VENUE_NOT_FOUND` | 404 | Профиль не найден |
| `INTERNAL_ERROR` | 500 | Ошибка сохранения |

### `DELETE /api/user/creator/:user_id` 🔒 (creator)
### `DELETE /api/user/venue/:user_id` 🔒 (venue)

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `INVALID_ID` | 400 | `user_id` не является числом |
| `ACCESS_DENIED` | 403 | Попытка удалить чужой профиль |
| `CREATOR_NOT_FOUND` / `VENUE_NOT_FOUND` | 404 | Профиль не найден |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

### `POST /api/user/upload` 🔒

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `FIELD_REQUIRED` | 400 | Не передан `type` или `file` |
| `INVALID_FILE_TYPE` | 400 | Расширение не разрешено (разрешены: jpg, jpeg, png, gif, webp) |
| `FILE_TOO_LARGE` | 400 | Файл превышает 10MB |
| `INVALID_IMAGE_TYPE` | 400 | `type` не разрешён (разрешены: avatar, venue-logo, venue-cover, venue-photo, creator-photo, event-cover) |
| `INTERNAL_ERROR` | 500 | Ошибка загрузки в хранилище |

### `DELETE /api/user/photo/:photo_id` 🔒

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `INVALID_ID` | 400 | `photo_id` не является числом |
| `ACCESS_DENIED` | 403 | Попытка удалить чужое фото |
| `PHOTO_NOT_FOUND` | 404 | Фото не найдено |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

---

## Мероприятия

### `GET /api/event/events` 🔒

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

### `POST /api/event/events` 🔒 (creator)

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `ACCESS_DENIED` | 403 | Роль не creator |
| `FIELD_REQUIRED` | 400 | Не передан `title` |
| `VALUE_TOO_SHORT` | 400 | `title` короче 3 символов |
| `VALUE_TOO_LONG` | 400 | `title` > 200 или `description` > 5000 символов |
| `INTERNAL_ERROR` | 500 | Ошибка сохранения |

### `GET /api/event/events/:id` 🔒

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `INVALID_ID` | 400 | `id` не является числом |
| `EVENT_NOT_FOUND` | 404 | Мероприятие не найдено |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

### `PUT /api/event/events/:id` 🔒 (creator)

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `ACCESS_DENIED` | 403 | Роль не creator или чужое мероприятие |
| `INVALID_ID` | 400 | `id` не является числом |
| `VALUE_TOO_SHORT` | 400 | `title` короче 3 символов |
| `VALUE_TOO_LONG` | 400 | `title` > 200 или `description` > 5000 символов |
| `EVENT_NOT_FOUND` | 404 | Мероприятие не найдено |
| `INTERNAL_ERROR` | 500 | Ошибка сохранения |

### `PATCH /api/event/events/:id/publish` 🔒 (creator)

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `ACCESS_DENIED` | 403 | Роль не creator или чужое мероприятие |
| `INVALID_ID` | 400 | `id` не является числом |
| `EVENT_NOT_FOUND` | 404 | Мероприятие не найдено |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

### `DELETE /api/event/events/:id` 🔒 (creator)

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `ACCESS_DENIED` | 403 | Роль не creator или чужое мероприятие |
| `INVALID_ID` | 400 | `id` не является числом |
| `EVENT_NOT_FOUND` | 404 | Мероприятие не найдено |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

### `GET /api/event/events/batch` 🔒

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `FIELD_REQUIRED` | 400 | Не передан query-параметр `ids` |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

---

## Категории

### `GET /api/event/categories` (публичный)
### `GET /api/event/categories/:id` (публичный)

| Code | HTTP | Когда |
|------|------|-------|
| `INVALID_ID` | 400 | `id` не является числом |
| `CATEGORY_NOT_FOUND` | 404 | Категория не найдена |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

### `POST /api/event/categories` 🔒 (admin)

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `ACCESS_DENIED` | 403 | Роль не admin |
| `FIELD_REQUIRED` | 400 | Не передан `name` |
| `VALUE_TOO_SHORT` | 400 | `name` короче 2 символов |
| `VALUE_TOO_LONG` | 400 | `name` длиннее 100 символов |
| `INTERNAL_ERROR` | 500 | Ошибка сохранения |

### `PUT /api/event/categories/:id` 🔒 (admin)

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `ACCESS_DENIED` | 403 | Роль не admin |
| `INVALID_ID` | 400 | `id` не является числом |
| `VALUE_TOO_SHORT` | 400 | `name` короче 2 символов |
| `VALUE_TOO_LONG` | 400 | `name` длиннее 100 символов |
| `CATEGORY_NOT_FOUND` | 404 | Категория не найдена |
| `INTERNAL_ERROR` | 500 | Ошибка сохранения |

### `DELETE /api/event/categories/:id` 🔒 (admin)

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `ACCESS_DENIED` | 403 | Роль не admin |
| `INVALID_ID` | 400 | `id` не является числом |
| `CATEGORY_NOT_FOUND` | 404 | Категория не найдена |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

---

## Заявки

### `POST /api/application/applications` 🔒 (creator или venue)

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `FIELD_REQUIRED` | 400 | Не передан `receiver_id`, `receiver_type` или `event_id` |
| `INVALID_VALUE` | 400 | `receiver_type` не является `creator` или `venue` |
| `CANNOT_APPLY_TO_SELF` | 400 | Нельзя отправить заявку самому себе |
| `DUPLICATE_APPLICATION` | 409 | Уже есть pending-заявка на это мероприятие |
| `MIRROR_APPLICATION_EXISTS` | 409 | Уже есть входящая pending-заявка с другой стороны |
| `INTERNAL_ERROR` | 500 | Ошибка сохранения |

### `GET /api/application/applications` 🔒

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

### `GET /api/application/applications/:id` 🔒

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `INVALID_ID` | 400 | `id` не является числом |
| `ACCESS_DENIED` | 403 | Пользователь не является отправителем или получателем |
| `APPLICATION_NOT_FOUND` | 404 | Заявка не найдена |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

### `DELETE /api/application/applications/:id` 🔒 (только sender)

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `INVALID_ID` | 400 | `id` не является числом |
| `ACCESS_DENIED` | 403 | Пользователь не является отправителем |
| `APPLICATION_NOT_FOUND` | 404 | Заявка не найдена |
| `APPLICATION_ALREADY_PROCESSED` | 409 | Заявка уже принята или отклонена (нельзя удалить) |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

### `PATCH /api/application/applications/:id/accept` 🔒 (только receiver)
### `PATCH /api/application/applications/:id/reject` 🔒 (только receiver)

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `INVALID_ID` | 400 | `id` не является числом |
| `ACCESS_DENIED` | 403 | Пользователь не является получателем |
| `APPLICATION_NOT_FOUND` | 404 | Заявка не найдена |
| `APPLICATION_ALREADY_PROCESSED` | 409 | Заявка уже обработана |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

---

## Коллаборации

### `GET /api/application/collaborations` 🔒

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

### `GET /api/application/collaborations/:id` 🔒

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `INVALID_ID` | 400 | `id` не является числом |
| `ACCESS_DENIED` | 403 | Пользователь не участвует в коллаборации |
| `COLLABORATION_NOT_FOUND` | 404 | Коллаборация не найдена |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |

### `PATCH /api/application/collaborations/:id/complete` 🔒 (только creator)
### `PATCH /api/application/collaborations/:id/cancel` 🔒 (только creator)

| Code | HTTP | Когда |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Нет токена |
| `INVALID_ID` | 400 | `id` не является числом |
| `ACCESS_DENIED` | 403 | Пользователь не является creator в этой коллаборации |
| `COLLABORATION_NOT_FOUND` | 404 | Коллаборация не найдена |
| `COLLABORATION_ALREADY_PROCESSED` | 409 | Коллаборация уже завершена или отменена |
| `INTERNAL_ERROR` | 500 | Ошибка сервера |
