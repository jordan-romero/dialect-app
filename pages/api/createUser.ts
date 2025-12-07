import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const createUser = async (req: any, res: any) => {
  try {
    console.log('🔍 Debug - Creating user with data:', req.body.user)
    const { email, sub: auth0Id } = req.body.user // Extract email and auth0Id from profile.user

    console.log('🔍 Debug - Extracted values:', { email, auth0Id })

    if (!email || !auth0Id) {
      console.log('❌ Missing required fields:', { email, auth0Id })
      return res.status(400).json({ error: 'Email and auth0Id are required' })
    }

    // Check if the user already exists in the database by email or auth0Id
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    })

    const existingUserByAuth0Id = await prisma.user.findUnique({
      where: { auth0Id },
    })

    if (existingUserByEmail && existingUserByAuth0Id) {
      // User exists with both email and auth0Id
      return res
        .status(200)
        .json({ message: 'User already exists', user: existingUserByEmail })
    } else if (existingUserByEmail && !existingUserByAuth0Id) {
      // User exists by email but not auth0Id - update the auth0Id
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { auth0Id },
      })
      console.log('✅ Updated existing user with auth0Id:', updatedUser)
      return res
        .status(200)
        .json({ message: 'User updated with auth0Id', user: updatedUser })
    } else if (!existingUserByEmail && existingUserByAuth0Id) {
      // User exists by auth0Id but not email - update the email
      const updatedUser = await prisma.user.update({
        where: { auth0Id },
        data: { email },
      })
      console.log('✅ Updated existing user with email:', updatedUser)
      return res
        .status(200)
        .json({ message: 'User updated with email', user: updatedUser })
    } else {
      // User doesn't exist - create new user
      const newUser = await prisma.user.create({
        data: {
          email,
          auth0Id,
        },
      })
      console.log('✅ Created new user:', newUser)
      return res
        .status(201)
        .json({ message: 'User created successfully', user: newUser })
    }
  } catch (error) {
    console.error('An error occurred:', error)
    return res.status(500).json({ error: 'An error occurred' })
  } finally {
    // Ensure the response is sent
    res.end()
  }
}

export default createUser
