import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Provision the database row for the signed-in user. Identity comes ONLY from
// the verified Auth0 session — never from the request body — so a caller can't
// bind an arbitrary email to an arbitrary auth0Id (account takeover).
const createUser = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getSession(req, res)
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const email = session.user.email as string | undefined
  const auth0Id = session.user.sub as string | undefined
  if (!email || !auth0Id) {
    return res.status(400).json({ error: 'Session is missing email or sub' })
  }

  try {
    const existingByAuth0Id = await prisma.user.findUnique({
      where: { auth0Id },
    })

    if (existingByAuth0Id) {
      // Already provisioned. Keep the email in sync if Auth0's changed, but only
      // when the new email isn't already owned by a different row.
      if (existingByAuth0Id.email !== email) {
        const clash = await prisma.user.findUnique({ where: { email } })
        if (!clash || clash.id === existingByAuth0Id.id) {
          const updated = await prisma.user.update({
            where: { auth0Id },
            data: { email },
          })
          return res
            .status(200)
            .json({ message: 'User updated', user: updated })
        }
      }
      return res
        .status(200)
        .json({ message: 'User already exists', user: existingByAuth0Id })
    }

    const existingByEmail = await prisma.user.findUnique({ where: { email } })
    if (existingByEmail) {
      // auth0Id is required + unique, so this row is already bound to a
      // different Auth0 identity (the current sub wasn't found above).
      // Rebinding it would transfer that account's paid access and progress to
      // this session, so refuse with a conflict instead.
      if (existingByEmail.auth0Id === auth0Id) {
        return res
          .status(200)
          .json({ message: 'User already exists', user: existingByEmail })
      }
      return res.status(409).json({
        error: 'This email is already associated with another account.',
      })
    }

    const created = await prisma.user.create({ data: { email, auth0Id } })
    return res.status(201).json({ message: 'User created', user: created })
  } catch (error) {
    console.error('createUser error:', error)
    return res.status(500).json({ error: 'An error occurred' })
  }
}

export default createUser
