
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create test user (john@doe.com / johndoe123)
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  
  const testUser = await prisma.user.upsert({
    where: { username: 'john@doe.com' },
    update: {},
    create: {
      username: 'john@doe.com',
      password: hashedPassword,
      email: 'john@doe.com',
      name: 'John Doe',
      height: 70, // 5'10"
      weight: 175,
      bats: 'Right',
      throws: 'Right',
      position: 'Center Field',
      level: 'High School (13-18)',
      batLength: 33,
      batWeight: 30,
      batType: 'BBCOR',
      struggles: ['Getting jammed on inside pitches', 'Rolling over for ground balls'],
      goals: ['Hit for more power', 'More consistent contact'],
      mentalApproach: 'Balanced',
      confidenceLevel: 7,
      profileComplete: true,
    },
  });

  console.log('Test user created:', testUser.username);

  // Create drills
  const drills = [
    {
      name: 'Tee Work - Basic',
      source: 'Driveline Baseball',
      category: 'Balance',
      primaryPurpose: 'Develop consistent contact and proper swing mechanics',
      setup: 'Set up tee at various heights and locations. Start at belt height, middle of plate.',
      execution: 'Focus on balanced setup, smooth load, and controlled swing. Aim for line drives up the middle. Take 10 swings per location before adjusting tee position.',
      keyPoints: ['Maintain balance throughout swing', 'Keep head still', 'Follow through completely', 'Focus on quality over quantity'],
      commonMistakes: ['Rushing the swing', 'Lunging forward', 'Dropping back shoulder', 'Not following through'],
      equipment: ['Batting tee', 'Baseball/Softball', 'Bat', 'Batting gloves'],
      targetSkills: ['Balance', 'Contact', 'Swing Path'],
      difficulty: 'Beginner',
      videoUrl: '/videos/drills/tee-work.mp4',
      thumbnailUrl: '/images/drills/tee-work.jpg',
    },
    {
      name: 'Soft Toss',
      source: 'Driveline Baseball',
      category: 'Rotation',
      primaryPurpose: 'Develop timing and hand-eye coordination with moving ball',
      setup: 'Partner kneels to the side (front foot area) about 10-12 feet away. Hitter sets up in batting stance.',
      execution: 'Partner tosses ball underhand into hitting zone. Hitter focuses on driving ball to opposite field. Start slow, increase speed as comfort improves.',
      keyPoints: ['Wait for the ball', 'Smooth hip rotation', 'Hands stay inside ball', 'Drive through contact'],
      commonMistakes: ['Swinging too early', 'Pulling off the ball', 'Casting hands', 'Poor balance'],
      equipment: ['Baseballs', 'Bat', 'Partner/Coach', 'Net or field space'],
      targetSkills: ['Timing', 'Rotation', 'Hand Path'],
      difficulty: 'Beginner',
      videoUrl: '/videos/drills/soft-toss.mp4',
      thumbnailUrl: '/images/drills/soft-toss.jpg',
    },
    {
      name: 'Underload/Overload Training',
      source: 'Driveline Baseball',
      category: 'Launch',
      primaryPurpose: 'Increase bat speed and power through varied resistance',
      setup: 'Use bats of different weights: lighter than game bat (-3oz), game weight, heavier than game bat (+3oz to +5oz). Perform same drill with each weight.',
      execution: 'Take 5 swings with light bat, 5 with game bat, 5 with heavy bat. Focus on maximum intent and speed with each swing. Rest between sets.',
      keyPoints: ['Maximum effort on every swing', 'Maintain proper mechanics', 'Full recovery between sets', 'Track bat speed if possible'],
      commonMistakes: ['Going through motions', 'Losing mechanics with heavy bat', 'Insufficient rest', 'Not progressing gradually'],
      equipment: ['Underload bat', 'Game bat', 'Overload bat', 'Optional: Bat speed sensor'],
      targetSkills: ['Bat Speed', 'Power', 'Strength'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/underload-overload.mp4',
      thumbnailUrl: '/images/drills/underload-overload.jpg',
    },
    {
      name: 'Front Toss',
      source: 'Driveline Baseball',
      category: 'Sequence',
      primaryPurpose: 'Practice hitting against live arm angle and timing',
      setup: 'Thrower stands behind L-screen about 30-40 feet away. Hitter in batting stance.',
      execution: 'Thrower delivers easy tosses from behind screen. Hitter works on timing and driving ball to all fields. Increase velocity gradually.',
      keyPoints: ['Track ball early', 'Proper load timing', 'Controlled aggression', 'Adjust to different locations'],
      commonMistakes: ['Bailing out', 'Overswinging', 'Poor pitch recognition', 'Inconsistent timing'],
      equipment: ['L-screen', 'Baseballs', 'Bat', 'Net or field', 'Thrower'],
      targetSkills: ['Timing', 'Pitch Recognition', 'Sequencing'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/front-toss.mp4',
      thumbnailUrl: '/images/drills/front-toss.jpg',
    },
    {
      name: 'One-Handed Swings',
      source: 'Driveline Baseball',
      category: 'Rear Elbow',
      primaryPurpose: 'Develop individual hand strength and proper swing path',
      setup: 'Use light bat or training stick. Perform swings off tee with top hand only, then bottom hand only.',
      execution: 'Take 5 swings top hand only (back hand for righties), focusing on driving through ball. Then 5 swings bottom hand only, focusing on path and extension.',
      keyPoints: ['Maintain balance', 'Proper grip pressure', 'Full extension', 'Smooth acceleration'],
      commonMistakes: ['Gripping too tight', 'Chopping motion', 'Poor balance', 'Incomplete swing'],
      equipment: ['Light bat or training stick', 'Batting tee', 'Balls'],
      targetSkills: ['Hand Path', 'Extension', 'Strength'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/one-handed.mp4',
      thumbnailUrl: '/images/drills/one-handed.jpg',
    },
    {
      name: 'Separation Drill',
      source: 'Driveline Baseball',
      category: 'Anchor',
      primaryPurpose: 'Create proper separation between hips and shoulders for power',
      setup: 'Start with hands at shoulder, back elbow up. Partner holds bat barrel, creating resistance.',
      execution: 'Begin hip rotation while partner holds barrel. Feel stretch between hips and shoulders. Release and complete swing. Repeat 10 times.',
      keyPoints: ['Hips start first', 'Maintain posture', 'Feel the stretch', 'Explosive release'],
      commonMistakes: ['Rotating everything together', 'Collapsing back side', 'Losing balance', 'Not maintaining resistance'],
      equipment: ['Bat', 'Partner'],
      targetSkills: ['Hip/Shoulder Separation', 'Power Generation', 'Sequencing'],
      difficulty: 'Advanced',
      videoUrl: '/videos/drills/separation.mp4',
      thumbnailUrl: '/images/drills/separation.jpg',
    },
    {
      name: 'Vision Training',
      source: 'Driveline Baseball',
      category: 'Launch',
      primaryPurpose: 'Improve pitch recognition and tracking',
      setup: 'Use colored balls or numbered balls. Front toss from behind screen.',
      execution: 'Thrower calls out color or number as ball is released. Hitter must identify and decide to swing or take. Increases reaction time and decision making.',
      keyPoints: ['Quick visual pickup', 'Decisive action', 'Maintain mechanics under pressure', 'Track ball all the way'],
      commonMistakes: ['Guessing instead of seeing', 'Late recognition', 'Indecision', 'Poor swing decisions'],
      equipment: ['Colored balls', 'L-screen', 'Thrower'],
      targetSkills: ['Pitch Recognition', 'Reaction Time', 'Decision Making'],
      difficulty: 'Advanced',
      videoUrl: '/videos/drills/vision-training.mp4',
      thumbnailUrl: '/images/drills/vision-training.jpg',
    },
    {
      name: 'Stride Box Drill',
      source: 'Driveline Baseball',
      category: 'Balance',
      primaryPurpose: 'Control stride length and direction for consistent contact',
      setup: 'Mark a box on ground (6-8 inches) where front foot should land. Use tape or chalk.',
      execution: 'Take swings off tee, focusing on landing front foot inside box every time. Should be soft, balanced landing.',
      keyPoints: ['Consistent stride length', 'Directional stride', 'Soft landing', 'Weight stays back'],
      commonMistakes: ['Striding too far', 'Lunging', 'Landing heavy', 'Inconsistent direction'],
      equipment: ['Tape or chalk', 'Tee', 'Bat', 'Balls'],
      targetSkills: ['Stride Control', 'Balance', 'Consistency'],
      difficulty: 'Beginner',
      videoUrl: '/videos/drills/stride-box.mp4',
      thumbnailUrl: '/images/drills/stride-box.jpg',
    },
    {
      name: 'Connection Drill (Towel)',
      source: 'Driveline Baseball',
      category: 'Rear Elbow',
      primaryPurpose: 'Keep hands and body connected through swing',
      setup: 'Place towel under both armpits. Set up at tee.',
      execution: 'Take smooth swings while keeping towel in place. If towel falls, connection is lost. Focus on rotating body, not casting hands.',
      keyPoints: ['Body rotation drives hands', 'Towel stays in place', 'Smooth path', 'Connected throughout'],
      commonMistakes: ['Casting hands', 'Disconnecting too early', 'Barring lead arm', 'Over-rotating shoulders'],
      equipment: ['Towel', 'Tee', 'Bat', 'Balls'],
      targetSkills: ['Connection', 'Swing Path', 'Body Control'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/connection.mp4',
      thumbnailUrl: '/images/drills/connection.jpg',
    },
    {
      name: 'Hip Rotation Drill',
      source: 'Driveline Baseball',
      category: 'Rotation',
      primaryPurpose: 'Develop powerful, efficient hip rotation',
      setup: 'No bat needed. Start in batting stance. Place hands on hips.',
      execution: 'Practice rotating hips forcefully while keeping upper body quiet. Back knee should drive forward. Feel weight transfer to firm front side.',
      keyPoints: ['Hips lead rotation', 'Back knee drives', 'Front side firms up', 'Upper body stays back'],
      commonMistakes: ['Spinning', 'Weight stays back', 'Weak front side', 'Early shoulder rotation'],
      equipment: ['None'],
      targetSkills: ['Hip Rotation', 'Power Generation', 'Weight Transfer'],
      difficulty: 'Beginner',
      videoUrl: '/videos/drills/hip-rotation.mp4',
      thumbnailUrl: '/images/drills/hip-rotation.jpg',
    },
    {
      name: 'Inside Pitch Drill',
      source: 'Driveline Baseball',
      category: 'Rear Elbow',
      primaryPurpose: 'Handle inside pitches without getting jammed',
      setup: 'Set tee on inside corner, slightly out in front. Can also use front toss.',
      execution: 'Work on quick hands and keeping barrel in zone longer. Pull hands in tight to body. Should drive ball to pull side.',
      keyPoints: ['Quick hands', 'Tight to body', 'Barrel stays in zone', 'Turn on the ball'],
      commonMistakes: ['Getting jammed', 'Rolling over', 'Slow hands', 'Wrong barrel path'],
      equipment: ['Tee or front tosser', 'Balls', 'Bat'],
      targetSkills: ['Hand Speed', 'Barrel Control', 'Inside Pitch Handling'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/inside-pitch.mp4',
      thumbnailUrl: '/images/drills/inside-pitch.jpg',
    },
    {
      name: 'Outside Pitch Drill',
      source: 'Driveline Baseball',
      category: 'Launch',
      primaryPurpose: 'Drive outside pitches to opposite field',
      setup: 'Set tee on outside corner, slightly deeper in zone.',
      execution: 'Work on letting ball travel deeper. Stay through the ball. Drive to opposite field with extension.',
      keyPoints: ['Let ball travel', 'Stay inside ball', 'Full extension', 'Opposite field approach'],
      commonMistakes: ['Pulling off ball', 'Rolling over', 'Casting', 'Early rotation'],
      equipment: ['Tee or front tosser', 'Balls', 'Bat'],
      targetSkills: ['Pitch Recognition', 'Opposite Field Power', 'Extension'],
      difficulty: 'Intermediate',
      videoUrl: '/videos/drills/outside-pitch.mp4',
      thumbnailUrl: '/images/drills/outside-pitch.jpg',
    },
  ];

  for (const drill of drills) {
    await prisma.drill.upsert({
      where: { name: drill.name },
      update: {},
      create: drill,
    });
  }

  console.log(`Created ${drills.length} drills`);

  // Create mock videos for test user
  const mockVideos = [
    {
      title: 'Batting Practice #1',
      analyzed: true,
      balanceScore: 78,
      anchorScore: 75,
      rotationScore: 82,
      rearElbowScore: 71,
      launchScore: 79,
      sequenceScore: 77,
      overallScore: 77,
      tier: 'Varsity',
      exitVelocity: 89,
      coachFeedback: 'Great hip rotation! Your lower body is generating good power. Focus on keeping your hands inside the ball on inside pitches to avoid getting jammed. Try the Inside Pitch Drill to improve your hand path.',
      uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      title: 'Cage Work - Front Toss',
      analyzed: true,
      balanceScore: 81,
      anchorScore: 77,
      rotationScore: 85,
      rearElbowScore: 73,
      launchScore: 82,
      sequenceScore: 80,
      overallScore: 80,
      tier: 'Varsity',
      exitVelocity: 92,
      coachFeedback: 'Excellent improvement! Your balance has gotten much better and it shows in your exit velocity. Keep working on that rear elbow position to maintain connection through the zone.',
      uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      title: 'Live BP Session',
      analyzed: true,
      balanceScore: 75,
      anchorScore: 73,
      rotationScore: 79,
      rearElbowScore: 69,
      launchScore: 76,
      sequenceScore: 74,
      overallScore: 74,
      tier: 'JV',
      exitVelocity: 86,
      coachFeedback: 'You rushed a few swings today. Remember to let the ball travel and stay balanced through contact. The Connection Drill will help you maintain better body control.',
      uploadDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
    {
      title: 'Game Swing Analysis',
      analyzed: true,
      balanceScore: 83,
      anchorScore: 80,
      rotationScore: 88,
      rearElbowScore: 76,
      launchScore: 85,
      sequenceScore: 82,
      overallScore: 82,
      tier: 'Varsity',
      exitVelocity: 94,
      coachFeedback: 'This is your best swing yet! Everything is clicking - great sequence from hips to shoulders to hands. Your exit velo shows the power you\'re generating. Keep this feel!',
      uploadDate: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      title: 'Tee Work - High Pitch',
      analyzed: true,
      balanceScore: 72,
      anchorScore: 70,
      rotationScore: 76,
      rearElbowScore: 67,
      launchScore: 73,
      sequenceScore: 71,
      overallScore: 72,
      tier: 'JV',
      exitVelocity: 84,
      coachFeedback: 'High pitches are challenging your balance. Work on staying tall through contact and not dropping your back shoulder. The Stride Box Drill will help maintain consistent mechanics.',
      uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  ];

  for (const video of mockVideos) {
    await prisma.video.create({
      data: {
        ...video,
        videoUrl: '/videos/mock-swing.mp4',
        thumbnailUrl: '/images/thumbnails/swing-thumb.jpg',
        userId: testUser.id,
      },
    });
  }

  console.log(`Created ${mockVideos.length} mock videos`);

  // Create progress entries for charts
  const progressEntries = [];
  const today = new Date();
  
  for (let i = 8; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - (i * 7)); // Weekly entries
    
    progressEntries.push({
      userId: testUser.id,
      date,
      avgBalance: 70 + Math.floor(Math.random() * 15),
      avgAnchor: 68 + Math.floor(Math.random() * 15),
      avgRotation: 75 + Math.floor(Math.random() * 15),
      avgRearElbow: 65 + Math.floor(Math.random() * 15),
      avgLaunch: 72 + Math.floor(Math.random() * 15),
      avgSequence: 70 + Math.floor(Math.random() * 15),
      avgOverall: 70 + Math.floor(Math.random() * 12),
    });
  }

  await prisma.progressEntry.createMany({
    data: progressEntries,
  });

  console.log(`Created ${progressEntries.length} progress entries`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
