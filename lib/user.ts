import type { PrismaClient, User } from '@prisma/client'

// Look up the DB user for an Auth0 id (the session `sub`). Returns null when the
// row doesn't exist yet — callers decide how to handle that (401/404).
export async function getUserByAuth0Id(
  prisma: PrismaClient,
  auth0Id?: string | null,
): Promise<User | null> {
  if (!auth0Id) return null
  return prisma.user.findUnique({ where: { auth0Id } })
}

// Resolve the DB user for a VERIFIED Auth0 session, provisioning the row on
// first sight. Identity comes only from the session (never client input), so
// this is safe to call from any authenticated route. It's also race-safe: if a
// concurrent request (e.g. createUser + overview firing together on first load)
// creates the row first, we catch the unique-constraint error and return it.
export async function getOrCreateUser(
  prisma: PrismaClient,
  identity: { sub?: string | null; email?: string | null },
): Promise<User | null> {
  const auth0Id = identity.sub || undefined
  const email = identity.email || undefined
  if (!auth0Id || !email) return null

  const byAuth0 = await prisma.user.findUnique({ where: { auth0Id } })
  if (byAuth0) {
    // Keep email in sync if Auth0's changed and the new one isn't taken.
    if (byAuth0.email !== email) {
      const clash = await prisma.user.findUnique({ where: { email } })
      if (!clash || clash.id === byAuth0.id) {
        return prisma.user.update({ where: { auth0Id }, data: { email } })
      }
    }
    return byAuth0
  }

  const byEmail = await prisma.user.findUnique({ where: { email } })
  if (byEmail) {
    return prisma.user.update({ where: { email }, data: { auth0Id } })
  }

  try {
    return await prisma.user.create({ data: { email, auth0Id } })
  } catch {
    // Another concurrent request likely created it first — fetch and return.
    const again =
      (await prisma.user.findUnique({ where: { auth0Id } })) ||
      (await prisma.user.findUnique({ where: { email } }))
    if (again) return again
    throw new Error('Failed to provision user')
  }
}
