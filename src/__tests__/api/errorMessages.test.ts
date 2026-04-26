import { describe, it, expect } from 'vitest'
import { getBackendError } from '../../errors/errorMessages'

function makeErr(payload: unknown): Error {
  return new Error(JSON.stringify(payload))
}

describe('getBackendError', () => {
  describe('known error codes', () => {
    const cases: [string, string][] = [
      ['UNAUTHORIZED', 'Необходима авторизация'],
      ['INVALID_TOKEN', 'Токен недействителен или истёк'],
      ['INVALID_EMAIL', 'Некорректный формат email'],
      ['INVALID_CREDENTIALS', 'Неверный email или пароль'],
      ['EMAIL_ALREADY_EXISTS', 'Пользователь с таким email уже существует'],
      ['PASSWORD_TOO_SHORT', 'Пароль должен быть не менее 8 символов'],
      ['PASSWORD_TOO_LONG', 'Пароль не должен превышать 72 символа'],
      ['INVALID_PHONE', 'Телефон должен быть в формате +79001234567'],
      ['INVALID_URL', 'Ссылка должна начинаться с https://'],
      ['PROFILE_NOT_FOUND', 'Профиль не найден'],
      ['CREATOR_NOT_FOUND', 'Креатор не найден'],
      ['VENUE_NOT_FOUND', 'Пространство не найдено'],
      ['ACCESS_DENIED', 'Доступ запрещён'],
      ['FILE_TOO_LARGE', 'Файл превышает допустимый размер 10 МБ'],
      ['INVALID_FILE_TYPE', 'Недопустимый формат файла (разрешены: jpg, jpeg, png, gif, webp)'],
      ['EVENT_NOT_FOUND', 'Мероприятие не найдено'],
      ['DUPLICATE_APPLICATION', 'Заявка на это мероприятие уже отправлена'],
      ['APPLICATION_NOT_FOUND', 'Заявка не найдена'],
      ['COLLABORATION_NOT_FOUND', 'Коллаборация не найдена'],
    ]

    it.each(cases)('код %s → верное сообщение', (code, expected) => {
      expect(getBackendError(makeErr({ errors: [{ code }] }))).toBe(expected)
    })
  })

  describe('неизвестный код', () => {
    it('возвращает message из тела ответа когда он есть', () => {
      expect(getBackendError(makeErr({ errors: [{ code: 'UNKNOWN', message: 'Server says no' }] })))
        .toBe('Server says no')
    })

    it('возвращает кастомный fallback когда нет message', () => {
      expect(getBackendError(makeErr({ errors: [{ code: 'UNKNOWN' }] }), 'Моя ошибка'))
        .toBe('Моя ошибка')
    })

    it('возвращает дефолтный fallback', () => {
      expect(getBackendError(makeErr({ errors: [{ code: 'UNKNOWN' }] })))
        .toBe('Что-то пошло не так')
    })
  })

  describe('граничные случаи', () => {
    it('некорректный JSON → дефолтный fallback', () => {
      expect(getBackendError(new Error('not json'))).toBe('Что-то пошло не так')
    })

    it('пустой массив errors → дефолтный fallback', () => {
      expect(getBackendError(makeErr({ errors: [] }))).toBe('Что-то пошло не так')
    })

    it('null → дефолтный fallback', () => {
      expect(getBackendError(null)).toBe('Что-то пошло не так')
    })

    it('строка → дефолтный fallback', () => {
      expect(getBackendError('error string')).toBe('Что-то пошло не так')
    })

    it('кастомный fallback при null', () => {
      expect(getBackendError(null, 'Custom')).toBe('Custom')
    })
  })
})
