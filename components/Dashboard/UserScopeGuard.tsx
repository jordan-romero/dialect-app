import { useEffect } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { clearAppLocalState } from '../../lib/clientState'

// When the signed-in user changes on this browser, wipe the previous user's
// per-user localStorage (lesson resume, streak, etc.) so progress never bleeds
// between accounts. The marker key is deliberately NOT under `aa:` so the wipe
// doesn't remove it.
const UID_KEY = 'aa_uid'

const UserScopeGuard = () => {
  const { user } = useUser()
  useEffect(() => {
    const sub = user?.sub
    if (typeof window === 'undefined' || !sub) return
    const stored = window.localStorage.getItem(UID_KEY)
    if (stored && stored !== sub) clearAppLocalState()
    window.localStorage.setItem(UID_KEY, sub)
  }, [user?.sub])
  return null
}

export default UserScopeGuard
