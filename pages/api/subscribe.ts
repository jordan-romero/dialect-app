import { NextApiRequest, NextApiResponse } from 'next'

interface ErrorResponse {
  error: string
}

export default async function subscribeHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { email } = req.body

  if (!email || !email.length) {
    return res.status(400).json({ error: 'Email is required' } as ErrorResponse)
  }

  const API_KEY = process.env.MAILCHIMP_API_KEY
  const API_SERVER = process.env.MAILCHIMP_API_SERVER
  const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID

  const url = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`

  const data = {
    email_address: email,
    status: 'subscribed',
  }

  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `api_key ${API_KEY}`,
    },
    body: JSON.stringify(data),
  }

  try {
    const response = await fetch(url, options)
    if (response.status >= 400) {
      const errorResponse: ErrorResponse = await response.json()
      const errorMessage = errorResponse?.error || 'Unknown error'
      return res.status(400).json({ error: errorMessage })
    }
    return res.status(201).json({ message: 'success' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
