import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createUser = async (req: any, res: any) => {
  const accessToken = req.headers.authorization

  const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL
  console.log(auth0Domain)

  try {
    const response = await fetch(`${auth0Domain}/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    console.log(response)
    const profile = await response.json()

    console.log(profile)

    const { email, name, id } = profile

    // Check if the user already exists in the database
    const existingUser = await prisma.users.findUnique({
      where: { id },
    })

    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'User already exists', user: existingUser })
    }

    // If the user doesn't exist, create and save the user
    const newUser = await prisma.users.create({
      data: {
        email,
      },
    })

    res
      .status(200)
      .json({ message: 'User created successfully', user: newUser })
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' })
  }
}
