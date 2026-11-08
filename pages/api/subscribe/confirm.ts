import { NextApiRequest, NextApiResponse } from 'next'
import { addNewsletterContact, readConfirmToken } from '../../../lib/email'

// The link in the confirmation email lands here. A valid, unexpired token adds
// the address to the newsletter, then we send them to the contact page with a
// status the page shows.
export default async function confirmHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = typeof req.query.token === 'string' ? req.query.token : ''
  try {
    const contact = token ? readConfirmToken(token) : null
    if (!contact) {
      res.redirect(303, '/contact?subscribed=invalid')
      return
    }
    await addNewsletterContact(contact)
    res.redirect(303, '/contact?subscribed=1')
  } catch (error) {
    console.error('Subscribe confirm error:', error)
    res.redirect(303, '/contact?subscribed=error')
  }
}
