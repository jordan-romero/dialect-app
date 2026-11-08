import { PrismaClient } from '@prisma/client'

// One Prisma client per server process. Each `new PrismaClient()` opens its own
// connection pool, and in dev every hot reload made another, which exhausts the
// Supabase pooler. New code imports this instead of constructing its own.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
