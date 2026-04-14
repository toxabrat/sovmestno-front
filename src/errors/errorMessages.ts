const ERROR_MESSAGES: Record<string, string> = {
  // Глобальные
  UNAUTHORIZED: 'Необходима авторизация',
  INVALID_TOKEN: 'Токен недействителен или истёк',
  SERVICE_UNAVAILABLE: 'Сервис временно недоступен',
  INTERNAL_ERROR: 'Внутренняя ошибка сервера',

  // Аутентификация
  FIELD_REQUIRED: 'Заполните все обязательные поля',
  INVALID_EMAIL: 'Некорректный формат email',
  PASSWORD_TOO_SHORT: 'Пароль должен быть не менее 8 символов',
  PASSWORD_TOO_LONG: 'Пароль не должен превышать 72 символа',
  VALUE_TOO_SHORT: 'Значение слишком короткое',
  VALUE_TOO_LONG: 'Значение слишком длинное',
  INVALID_PHONE: 'Телефон должен быть в формате +79001234567',
  INVALID_URL: 'Ссылка должна начинаться с https://',
  EMAIL_ALREADY_EXISTS: 'Пользователь с таким email уже существует',
  INVALID_ADMIN_SECRET: 'Неверный секретный ключ администратора',
  INVALID_CREDENTIALS: 'Неверный email или пароль',
  INVALID_REFRESH_TOKEN: 'Сессия истекла, войдите заново',

  // Профили
  PROFILE_NOT_FOUND: 'Профиль не найден',
  PROFILE_ALREADY_EXISTS: 'Профиль уже создан для этого аккаунта',
  CREATOR_NOT_FOUND: 'Креатор не найден',
  VENUE_NOT_FOUND: 'Пространство не найдено',
  INVALID_ID: 'Некорректный идентификатор',
  ACCESS_DENIED: 'Доступ запрещён',

  // Загрузка файлов
  INVALID_FILE_TYPE: 'Недопустимый формат файла (разрешены: jpg, jpeg, png, gif, webp)',
  FILE_TOO_LARGE: 'Файл превышает допустимый размер 10 МБ',
  INVALID_IMAGE_TYPE: 'Недопустимый тип изображения',
  PHOTO_NOT_FOUND: 'Фото не найдено',

  // Мероприятия
  EVENT_NOT_FOUND: 'Мероприятие не найдено',

  // Категории
  CATEGORY_NOT_FOUND: 'Категория не найдена',

  // Заявки
  INVALID_VALUE: 'Некорректное значение',
  CANNOT_APPLY_TO_SELF: 'Нельзя отправить заявку самому себе',
  DUPLICATE_APPLICATION: 'Заявка на это мероприятие уже отправлена',
  MIRROR_APPLICATION_EXISTS: 'Уже есть входящая заявка от этого пользователя',
  APPLICATION_NOT_FOUND: 'Заявка не найдена',
  APPLICATION_ALREADY_PROCESSED: 'Заявка уже обработана',

  // Коллаборации
  COLLABORATION_NOT_FOUND: 'Коллаборация не найдена',
  COLLABORATION_ALREADY_PROCESSED: 'Коллаборация уже завершена или отменена',
}

export function getBackendError(err: unknown, fallback = 'Что-то пошло не так'): string {
  try {
    const parsed = JSON.parse((err as Error).message)
    const code: string = parsed?.errors?.[0]?.code ?? ''
    return ERROR_MESSAGES[code] ?? parsed?.errors?.[0]?.message ?? fallback
  } catch {
    return fallback
  }
}
