// Set a user's role from the command line.
//   yarn set-role someone@university.edu TEACHER
// Roles: STUDENT, TEACHER, ADMIN. The user must have signed in once.
import { PrismaClient } from '@prisma/client'

const [email, role] = process.argv.slice(2)
const ROLES = ['STUDENT', 'TEACHER', 'ADMIN']
if (!email || !ROLES.includes(role)) {
  console.error('Usage: yarn set-role <email> <STUDENT|TEACHER|ADMIN>')
  process.exit(1)
}
const prisma = new PrismaClient()
try {
  const user = await prisma.user.findFirst({
    where: { email: { equals: email.trim(), mode: 'insensitive' } },
  })
  if (!user) {
    console.error(
      `No user with email ${email}. They need to sign in once first.`,
    )
    process.exit(1)
  }
  await prisma.user.update({ where: { id: user.id }, data: { role } })
  console.log(`${user.email}: ${user.role} → ${role}`)
} finally {
  await prisma.$disconnect()
}
