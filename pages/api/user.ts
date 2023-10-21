/* eslint-disable import/no-anonymous-default-export */
import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = req.body

    console.log(user, 'USER')
    // Check if the user with the given email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    })

    console.log(existingUser, 'EXISTING USER')

    if (existingUser) {
      // If the user already exists, do nothing and return a success response
      return res.status(200).json({ message: 'User already exists.' })
    }

    // Create a new user record in your Prisma database
    const createdUser = await prisma.user.create({
      data: {
        email: user.email,
      },
    })
    console.log(createdUser, 'CreatedUser')

    // Handle successful user creation
    return res.status(201).json(createdUser)
  } catch (error) {
    // Handle errors
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
