import { PrismaClient } from '@prisma/client';
import { uploadFile } from './lib/s3';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function uploadModelVideo() {
  try {
    const videoPath = '/home/ubuntu/Uploads/340109 (2).mp4';
    
    console.log('📹 Reading Freddie Freeman video...');
    const videoBuffer = fs.readFileSync(videoPath);
    
    console.log('☁️  Uploading to S3...');
    const fileName = `model-videos/left/${Date.now()}-freddie-freeman.mp4`;
    const cloudStoragePath = await uploadFile(videoBuffer, fileName);
    
    console.log('💾 Creating database record...');
    const modelVideo = await prisma.modelVideo.create({
      data: {
        title: 'Freddie Freeman - MLB Model',
        description: 'MLB World Series MVP - Los Angeles Dodgers. Professional swing model for left-handed hitters.',
        handedness: 'left',
        cloudStoragePath,
        playerName: 'Freddie Freeman',
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
