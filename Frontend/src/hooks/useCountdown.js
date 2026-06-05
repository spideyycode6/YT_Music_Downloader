import { useEffect, useState } from 'react'
import { formatCountdown } from '@/utils/formatters'

export function useCountdown(initialSeconds, active) {
  const [seconds, setSeconds] = useState(initialSeconds || 0)

  useEffect(() => {
    setSeconds(initialSeconds || 0)
  }, [initialSeconds])

  useEffect(() => {
    if (!active || seconds <= 0) return undefined

    const timer = setInterval(() => {
      setSeconds((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [active, seconds])

  return {
    formatted: formatCountdown(seconds),
    seconds,
  }
}
