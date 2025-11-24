import { PrismaClient } from '@prisma/client';
import { uploadFile } from './lib/s3';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function uploadModelVideo() {
  try {
    const videoPath = '/home/ubuntu/Uploads/2005069 (1).mp4';
    
    console.log('📹 Reading video file...');
    const videoBuffer = fs.readFileSync(videoPath);
    
    console.log('☁️  Uploading to S3...');
    const fileName = `model-videos/right/${Date.now()}-vlad-guerrero-jr.mp4`;
    const cloudStoragePath = await uploadFile(videoBuffer, fileName);
    
    console.log('💾 Creating database record...');
    const modelVideo = await prisma.modelVideo.create({
      data: {
        title: 'Vlad Guerrero Jr. - MLB Model',
        description: 'MLB All-Star - Toronto Blue Jays. Professional swing model for right-handed hitters.',
        handedness: 'right',
        cloudStoragePath,
        playerName: 'Vlad Guerrero Jr.',
        playerLevel: 'mlb',
        active: true,
      },
    });
    
    console.log('✅ Model video created successfully!');
    console.log('   ID:', modelVideo.id);
    console.log('   Title:', modelVideo.title);
    console.log('   Handedness:', modelVideo.handedness);
    console.log('   Player:', modelVideo.playerName);
    console.log('   Active:', modelVideo.active);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

uploadModelVideo();
