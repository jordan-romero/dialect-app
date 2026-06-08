import { NextApiRequest, NextApiResponse } from 'next'

interface ErrorResponse {
  error: string
}

interface SubscribeData {
  email: string
  firstName?: string
  lastName?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function subscribeHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res
      .status(405)
      .json({ error: 'Method not allowed' } as ErrorResponse)
  }

  const { email, firstName, lastName } = req.body as SubscribeData

  if (!email || !EMAIL_RE.test(email)) {
    return res
      .status(400)
      .json({ error: 'A valid email is required' } as ErrorResponse)
  }

  const API_KEY = process.env.MAILCHIMP_API_KEY
  const API_SERVER = process.env.MAILCHIMP_API_SERVER
  const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID

  const url = `https://${API_SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`

  const data = {
    email_address: email,
    // Double opt-in: Mailchimp emails a confirmation link, so an attacker can't
    // silently subscribe someone else's address — they must confirm.
    status: 'pending',
    merge_fields: {
      FNAME: firstName,
      LNAME: lastName,
    },
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
