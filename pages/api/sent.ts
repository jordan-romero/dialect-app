import { Resend } from 'resend'
import EmailVerification from '../../components/EmailTemplates/EmailVerification'

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

const resend = new Resend(process.env.RESEND_API_KEY)

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: any, res: any) => {
  const supabase = createMiddlewareClient({ req, res })
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user

  try {
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    if (user && user.email) {
      const data = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: [user.email],
        subject: 'Hello world',
        react: EmailVerification({ email: user.email }),
      })
      res.status(200).json(data)
    }
  } catch (error) {
    res.status(400).json(error)
  }
}
