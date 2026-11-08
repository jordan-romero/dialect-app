#!/usr/bin/env node
// One-time copy of Mailchimp newsletter subscribers into Resend contacts.
//
//   bash scripts/with-env.sh node scripts/migrate-mailchimp-to-resend.mjs          # dry run
//   bash scripts/with-env.sh node scripts/migrate-mailchimp-to-resend.mjs --apply  # write
//
// Needs MAILCHIMP_API_KEY / MAILCHIMP_API_SERVER / MAILCHIMP_AUDIENCE_ID and a
// full-access RESEND_API_KEY (optionally RESEND_NEWSLETTER_SEGMENT_ID).
// Only "subscribed" members are copied: they already confirmed through
// Mailchimp's double opt-in. Unsubscribed and pending ones are left behind.
// Safe to re-run; contacts that already exist are skipped.

const apply = process.argv.includes('--apply')
const {
  MAILCHIMP_API_KEY: mcKey,
  MAILCHIMP_API_SERVER: mcServer,
  MAILCHIMP_AUDIENCE_ID: mcList,
  RESEND_API_KEY: resendKey,
  RESEND_NEWSLETTER_SEGMENT_ID: segment,
} = process.env

for (const [name, value] of Object.entries({
  MAILCHIMP_API_KEY: mcKey,
  MAILCHIMP_API_SERVER: mcServer,
  MAILCHIMP_AUDIENCE_ID: mcList,
  ...(apply ? { RESEND_API_KEY: resendKey } : {}),
})) {
  if (!value) {
    console.error(`Missing ${name}`)
    process.exit(1)
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function mailchimpMembers() {
  const members = []
  const auth = 'Basic ' + Buffer.from(`x:${mcKey}`).toString('base64')
  for (let offset = 0; ; offset += 500) {
    const url = `https://${mcServer}.api.mailchimp.com/3.0/lists/${mcList}/members?status=subscribed&count=500&offset=${offset}&fields=members.email_address,members.merge_fields,total_items`
    const res = await fetch(url, { headers: { Authorization: auth } })
    if (!res.ok) throw new Error(`Mailchimp ${res.status}: ${await res.text()}`)
    const page = await res.json()
    members.push(...page.members)
    if (members.length >= page.total_items || page.members.length === 0) break
  }
  return members.map((m) => ({
    email: m.email_address.trim().toLowerCase(),
    firstName: m.merge_fields?.FNAME || undefined,
    lastName: m.merge_fields?.LNAME || undefined,
  }))
}

async function createContact(c) {
  const res = await fetch('https://api.resend.com/contacts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: c.email,
      first_name: c.firstName,
      last_name: c.lastName,
      unsubscribed: false,
      segments: segment ? [{ id: segment }] : undefined,
    }),
  })
  if (res.ok) return 'created'
  if (res.status === 409) return 'exists'
  throw new Error(`Resend ${res.status} for ${c.email}: ${await res.text()}`)
}

const members = await mailchimpMembers()
console.log(`${members.length} subscribed Mailchimp members`)
if (!apply) {
  console.log('Dry run. Re-run with --apply to create them in Resend.')
  process.exit(0)
}

const tally = { created: 0, exists: 0, failed: 0 }
for (const m of members) {
  try {
    tally[await createContact(m)]++
  } catch (error) {
    tally.failed++
    console.error(error.message)
  }
  await sleep(550) // Resend's default limit is 2 requests/second
}
console.log(tally)
process.exit(tally.failed ? 1 : 0)
