import dotenv from 'dotenv';
dotenv.config();

import prisma from './services/database';

async function main() {
  const apiKey = await prisma.apiKey.findFirst({
    where: { user: { email: 'dev@slyky.app' } },
    select: { key: true },
  });
  if (apiKey) {
    console.log('Your API key is:', apiKey.key);
  } else {
    console.log('No API key found. You may need to re‑seed.');
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });