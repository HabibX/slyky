import dotenv from 'dotenv';
dotenv.config();

import prisma from './services/database';
import crypto from 'crypto';

async function seed() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'dev@slyky.app',
    },
  });
  console.log('User created:', user.id);

  // Create an API key
  const apiKey = `sk_live_${crypto.randomBytes(16).toString('hex')}`;
  await prisma.apiKey.create({
    data: {
      userId: user.id,
      key: apiKey,
      type: 'secret',
    },
  });
  console.log('API key created:', apiKey);
  console.log('Use this in Authorization header as: Bearer ' + apiKey);
}

seed()
  .catch(console.error)
  .finally(() => process.exit());