import * as React from 'react'

type EmailTemplateProps = {
  email: string
}

const EmailVerification: React.FC<Readonly<EmailTemplateProps>> = ({
  email,
}) => (
  <div>
    <h1>Welcome, {email}!</h1>
  </div>
)

export default EmailVerification
