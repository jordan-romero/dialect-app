// pages/api/auth/hook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, secret } = req.body;

  console.log(email, 'TESTING')

  
  // 1
  if (req.method !== 'POST') {
    return res.status(403).json({ message: 'Method not allowed' });
  }
  // 2
  if (secret !== process.env.AUTH0_SECRET) {
    return res.status(403).json({ message: `You must provide the secret 🤫` });
  }
  // 3
  if (email) {
    // 4
    await prisma.users.create({
      data: { email },
    });
    return res.status(200).json({
      message: `User with email: ${email} has been created successfully!`,
    });
  }
};

export default handler;