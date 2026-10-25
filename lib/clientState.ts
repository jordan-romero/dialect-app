// Per-user client state we keep in localStorage (lesson resume position, streak
// "last seen", mobile banner dismissal, etc.) is all namespaced under `aa:`.
// When the signed-in user changes we must wipe it so one account never inherits
// another's progress on a shared browser.
export function clearAppLocalState() {
  if (typeof window === 'undefined') return
  for (const key of Object.keys(window.localStorage)) {
    if (key.startsWith('aa:')) window.localStorage.removeItem(key)
  }
}
