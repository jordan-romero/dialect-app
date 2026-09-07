import { ReactNode, useEffect, useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { clearAppLocalState } from '../../lib/clientState'

// When the signed-in user changes on this browser, wipe the previous user's
// per-user localStorage (lesson resume, streak, etc.) so progress never bleeds
// between accounts. The marker key is deliberately NOT under `aa:` so the wipe
// doesn't remove it.
const UID_KEY = 'aa_uid'

// Gates the dashboard content until that reconciliation has run. This has to
// happen BEFORE any descendant reads localStorage during its own render or
// state initializer (e.g. LessonContainerV3 seeds its resume step from
// `aa:lesson:*:step`). If it ran only in a mounted effect, a freshly signed-in
// account on a shared browser could still inherit the previous account's
// in-memory position even though storage was cleared a tick later.
const UserScopeGuard = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useUser()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Wait until Auth0 has resolved who (if anyone) is signed in.
    if (isLoading) return
    const sub = user?.sub
    if (typeof window !== 'undefined' && sub) {
      const stored = window.localStorage.getItem(UID_KEY)
      if (stored && stored !== sub) clearAppLocalState()
      window.localStorage.setItem(UID_KEY, sub)
    }
    // Release the gate once reconciled (also for signed-out/errored states, so
    // the dashboard's own auth handling can take over rather than hang blank).
    setReady(true)
  }, [isLoading, user?.sub])

  if (!ready) return null
  return <>{children}</>
}

export default UserScopeGuard
