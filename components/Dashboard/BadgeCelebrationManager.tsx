import React, { useCallback, useEffect, useRef, useState } from 'react'
import BadgeCelebration, { EarnedBadge } from './BadgeCelebration'

// Mounted once in the dashboard shell. Checks for newly-earned badges on load
// and whenever a 'badges:check' event fires (after completing a quiz/lesson),
// then shows a full-screen celebration for each — one at a time.
const BadgeCelebrationManager: React.FC = () => {
  const [queue, setQueue] = useState<EarnedBadge[]>([])
  const checking = useRef(false)

  const runCheck = useCallback(async () => {
    if (checking.current) return
    checking.current = true
    try {
      const res = await fetch('/api/badges/check', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        const earned: EarnedBadge[] = data?.newlyEarned || []
        if (earned.length) {
          setQueue((q) => {
            const seen = new Set(q.map((b) => b.id))
            return [...q, ...earned.filter((b) => !seen.has(b.id))]
          })
        }
      }
    } catch (e) {
      console.error('Badge check failed:', e)
    } finally {
      checking.current = false
    }
  }, [])

  useEffect(() => {
    // Slight delay on initial load so any just-completed writes have landed.
    const t = setTimeout(runCheck, 600)
    const handler = () => {
      // Give the completion's API writes a moment before checking.
      setTimeout(runCheck, 500)
    }
    window.addEventListener('badges:check', handler)
    return () => {
      clearTimeout(t)
      window.removeEventListener('badges:check', handler)
    }
  }, [runCheck])

  if (queue.length === 0) return null

  return (
    <BadgeCelebration
      badge={queue[0]}
      onClose={() => setQueue((q) => q.slice(1))}
    />
  )
}

export default BadgeCelebrationManager
