// Pages that render inside the dashboard app shell (side rail, full viewport)
// rather than the public site's header and footer.
export const isAppShellPath = (pathname: string) =>
  pathname.startsWith('/dashboard') || pathname.startsWith('/teach')
