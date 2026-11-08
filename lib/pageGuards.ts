// Server-side page guards. Teacher pages check the role before rendering, so
// the UI never shows for the wrong user (the APIs check again on every call).
import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0'
import type { GetServerSidePropsContext } from 'next'
import { prisma } from './prisma'
import { can, type Permission } from './rbac'

export function requirePermissionPage(permission: Permission) {
  return withPageAuthRequired({
    async getServerSideProps(ctx: GetServerSidePropsContext) {
      const session = await getSession(ctx.req, ctx.res)
      const sub = session?.user?.sub
      const user = sub ? await prisma.user.findUnique({ where: { auth0Id: sub } }) : null
      if (!can(user, permission)) {
        return { redirect: { destination: '/dashboard/progress', permanent: false } }
      }
      return { props: {} }
    },
  })
}
