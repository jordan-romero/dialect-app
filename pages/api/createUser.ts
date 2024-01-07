import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const createUser = async (req: any, res: any) => {
  try {
    const { email, sid: auth0Id } = req.body.user // Extract email and auth0Id from profile.user

    if (!email || !auth0Id) {
      return res.status(400).json({ error: 'Email and auth0Id are required' })
    }

    // Check if the user already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { auth0Id },
    })

    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'User already exists', user: existingUser })
    }

    // If the user doesn't exist, create and save the user
    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          email,
          auth0Id,
        },
      })
      return res
    }

    // Send a success response
    return res.status(200).json({ message: 'User created successfully' })
  } catch (error) {
    console.error('An error occurred:', error)
    return res.status(500).json({ error: 'An error occurred' })
  } finally {
    // Ensure the response is sent
    res.end()
  }
}

export default createUser
