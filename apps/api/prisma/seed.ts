import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear alerts, then seed fresh demo alerts
  await prisma.alert.deleteMany({});
  const now = Date.now();
  await prisma.alert.createMany({
    data: [
      {
        title: 'Welcome to Athlete RIA',
        body: 'This is a demo alert. Use the buttons to mark read or refresh.',
        read: false,
        createdAt: new Date(now - 5 * 60_000),
      },
      {
        title: 'Tax reminder',
        body: 'Estimated state tax projection updated.',
        read: false,
        createdAt: new Date(now - 4 * 60_000),
      },
      {
        title: 'Contract expiring',
        body: 'A vendor contract expires in 30 days.',
        read: false,
        createdAt: new Date(now - 3 * 60_000),
      },
      {
        title: 'Spending spike',
        body: 'Travel spend was 40% higher last week.',
        read: true,
        createdAt: new Date(now - 2 * 60_000),
      },
      {
        title: 'Liquidity check',
        body: '5 accounts below minimum threshold.',
        read: true,
        createdAt: new Date(now - 1 * 60_000),
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed complete.');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });