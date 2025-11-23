import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function checkLessons() {
  // Search for "Launch Angle Ladder" lesson
  const lessons = await prisma.lesson.findMany({
    where: {
      title: {
        contains: 'Launch',
        mode: 'insensitive',
      },
    },
    include: {
      module: {
        include: {
          course: {
            select: {
              title: true,
              published: true,
              visibility: true,
            },
          },
        },
      },
    },
  });

  console.log('Found lessons:', JSON.stringify(lessons, null, 2));
  
  await prisma.$disconnect();
}

checkLessons().catch(console.error);
