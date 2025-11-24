import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testModelVideo() {
  try {
    console.log('🔍 Fetching right-handed model...');
    
    const modelVideo = await prisma.modelVideo.findFirst({
      where: {
        handedness: 'right',
        active: true,
      },
      orderBy: {
        uploadDate: 'desc',
      },
    });
    
    if (modelVideo) {
      console.log('✅ Found active right-handed model:');
      console.log('   Title:', modelVideo.title);
      console.log('   Player:', modelVideo.playerName);
      console.log('   Storage Path:', modelVideo.cloudStoragePath);
      console.log('   Active:', modelVideo.active);
      console.log('\n📍 This model will be shown when right-handed users toggle the overlay!');
    } else {
      console.log('❌ No active right-handed model found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testModelVideo();
