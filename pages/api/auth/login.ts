import { handleLogin } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'

const login = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Handle the login process using handleLogin
    await handleLogin(req, res, {
      returnTo: '/dashboard',
    })
  } catch (error: any) {
    // Handle errors
    res.status(error.status || 500).end(error.message)
  }
}

export default login
