import { useEffect, useRef } from 'react'

/**
 * Возвращает последнее непустое значение.
 * Позволяет диалогам доигрывать анимацию закрытия после того,
 * как источник данных уже обнулился.
 */
export function useLastNonNull<T>(value: T | null): T | null {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    if (value !== null) ref.current = value
  })

  return value ?? ref.current
}
