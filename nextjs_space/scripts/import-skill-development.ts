import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const skillDevCourses = [
    {
      title: "Swing Foundations & Mechanics",
      description: "Core principles of hitting mechanics, including stance, stride, and weight transfer fundamentals",
      category: "Mechanics",
      modules: [
        {
          title: "Stance & Setup Fundamentals",
          lessons: [
            { title: "Proper Batting Stance Alignment", description: "Establishing athletic positioning for optimal swing initiation" },
            { title: "Grip Fundamentals", description: "Hand positioning and grip pressure for maximum bat control" },
            { title: "Weight Distribution Basics", description: "Understanding 50/50 vs 60/40 weight distribution" },
            { title: "Pre-Swing Routine Development", description: "Building consistent pre-pitch routines" },
          ]
        },
        {
          title: "Stride & Timing Mechanics",
          lessons: [
            { title: "Stride Length & Direction", description: "Optimal stride mechanics for balance and power" },
            { title: "Weight Shift Timing", description: "Coordinating weight transfer with pitch recognition" },
            { title: "Trigger Mechanisms", description: "Small movements to initiate swing timing" },
            { title: "Timing Different Pitch Speeds", description: "Adjusting timing for fastballs vs off-speed" },
          ]
        }
      ]
    },
    {
      title: "Lower Body Power & Stability",
      description: "Developing ground force generation, hip rotation, and lower body anchoring for explosive swings",
      category: "Power",
      modules: [
        {
          title: "Ground Force Mechanics",
          lessons: [
            { title: "Lower Body Anchoring Stability", description: "Building stable base for explosive rotation" },
            { title: "Rear Leg Engagement", description: "Maximizing push-off power from back leg" },
            { title: "Front Leg Blocking", description: "Creating firm front side for energy transfer" },
            { title: "Weight Transfer Progression", description: "Linear to rotational energy conversion" },
          ]
        },
        {
          title: "Hip Rotation Mastery",
          lessons: [
            { title: "Hip Loading Mechanics", description: "Coiling hips for maximum rotational power" },
            { title: "Hip Separation Drills", description: "Creating separation between upper and lower body" },
            { title: "Sequential Hip Firing", description: "Proper hip rotation sequence for bat speed" },
            { title: "Hip Rotation Common Errors", description: "Fixing spinning, sliding, and early rotation" },
          ]
        }
      ]
    },
    {
      title: "Upper Body & Bat Path Development",
      description: "Hand path, bat path, and connection principles for efficient swing planes",
      category: "Bat Path",
      modules: [
        {
          title: "Hand Path Fundamentals",
          lessons: [
            { title: "Hand Path to Contact", description: "Efficient hand path for different pitch locations" },
            { title: "Connection Principles", description: "Maintaining connection between arms and torso" },
            { title: "Top Hand vs Bottom Hand Roles", description: "Understanding hand responsibilities in swing" },
            { title: "Casting Prevention", description: "Avoiding early extension of hands" },
          ]
        },
        {
          title: "Bat Path Optimization",
          lessons: [
            { title: "Attack Angle Fundamentals", description: "Matching bat path to pitch plane" },
            { title: "Inside-Out Swing Path", description: "Developing proper swing plane for all pitch locations" },
            { title: "Barrel Control Through Zone", description: "Maintaining barrel in hitting zone longer" },
            { title: "Adjusting to Pitch Heights", description: "Bat path adjustments for high/low pitches" },
          ]
        }
      ]
    },
    {
      title: "Advanced Swing Sequencing",
      description: "Kinetic chain sequencing, timing, and rhythm for maximum efficiency",
      category: "Sequencing",
      modules: [
        {
          title: "Kinetic Chain Principles",
          lessons: [
            { title: "Ground Up Sequencing", description: "Proper firing order from feet to hands" },
            { title: "Separation Mechanics", description: "Creating stretch-shortening cycle for power" },
            { title: "Timing Gates", description: "Understanding sequential activation points" },
            { title: "Common Sequencing Errors", description: "Fixing out-of-sequence movements" },
          ]
        },
        {
          title: "Rhythm & Timing Mastery",
          lessons: [
            { title: "Pre-Pitch Rhythm Development", description: "Establishing timing rhythm before pitch release" },
            { title: "Load to Launch Timing", description: "Smooth transition from load to swing initiation" },
            { title: "Pitch Recognition Integration", description: "Combining timing with pitch identification" },
            { title: "Two-Strike Adjustments", description: "Timing modifications for defensive hitting" },
          ]
        }
      ]
    },
    {
      title: "Pitch Recognition & Approach",
      description: "Visual training, pitch identification, and at-bat strategy development",
      category: "Mental",
      modules: [
        {
          title: "Visual Processing Training",
          lessons: [
            { title: "Tracking Fundamentals", description: "Eye tracking from release to contact point" },
            { title: "Pitch Plane Recognition", description: "Identifying pitch trajectory early" },
            { title: "Spin Recognition", description: "Reading spin for fastball vs breaking ball" },
            { title: "Release Point Focus", description: "Picking up ball out of pitcher's hand" },
          ]
        },
        {
          title: "At-Bat Strategy",
          lessons: [
            { title: "Count-Based Approach", description: "Adjusting strategy based on ball-strike count" },
            { title: "Zone Management", description: "Understanding hot zones vs chase zones" },
            { title: "Two-Strike Hitting", description: "Defensive approach with two strikes" },
            { title: "Situational Hitting", description: "Adjusting approach based on game situation" },
          ]
        }
      ]
    },
    {
      title: "Power Development & Exit Velocity",
      description: "Building explosive bat speed and maximizing exit velocity through mechanics and training",
      category: "Power",
      modules: [
        {
          title: "Bat Speed Development",
          lessons: [
            { title: "Rotational Velocity Training", description: "Maximizing hip and trunk rotation speed" },
            { title: "Acceleration Through Contact", description: "Maintaining bat speed through hitting zone" },
            { title: "Leverage Points", description: "Creating optimal leverage for power generation" },
            { title: "Overload/Underload Training", description: "Bat weight variation for speed development" },
          ]
        },
        {
          title: "Exit Velocity Optimization",
          lessons: [
            { title: "Contact Point Optimization", description: "Finding ideal contact points for max exit velo" },
            { title: "Barrel Accuracy", description: "Hitting ball on sweet spot consistently" },
            { title: "Launch Angle Control", description: "Optimizing launch angle for power production" },
            { title: "Power to All Fields", description: "Generating exit velo on all pitch locations" },
          ]
        }
      ]
    },
    {
      title: "Problem-Solving & Adjustments",
      description: "Diagnosing and fixing common swing flaws and making in-game adjustments",
      category: "Troubleshooting",
      modules: [
        {
          title: "Common Swing Flaws",
          lessons: [
            { title: "Fixing Uppercutting", description: "Correcting excessive upward bat path" },
            { title: "Eliminating Lunging", description: "Preventing forward weight shift too early" },
            { title: "Stopping Early Hip Rotation", description: "Fixing premature hip opening" },
            { title: "Correcting Casting", description: "Eliminating early hand extension" },
            { title: "Fixing Rolling Over", description: "Preventing top hand rollover before contact" },
          ]
        },
        {
          title: "In-Game Adjustments",
          lessons: [
            { title: "Velocity Adjustment", description: "Adapting timing to faster/slower pitchers" },
            { title: "Breaking Ball Adjustments", description: "Staying back on off-speed pitches" },
            { title: "Inside Pitch Adjustments", description: "Quick hands for inside fastballs" },
            { title: "Self-Diagnosis Between ABs", description: "Recognizing and fixing issues mid-game" },
          ]
        }
      ]
    }
  ];

  let coursesCreated = 0;
  let modulesCreated = 0;
  let lessonsCreated = 0;
  let assetsCreated = 0;

  for (const courseData of skillDevCourses) {
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        visibility: 'athlete',
        contentType: 'training',
        thumbnail: '/api/placeholder/400/300',
        importedAt: new Date(),
      },
    });
    coursesCreated++;

    for (let modIndex = 0; modIndex < courseData.modules.length; modIndex++) {
      const moduleData = courseData.modules[modIndex];
      const module = await prisma.module.create({
        data: {
          courseId: course.id,
          title: moduleData.title,
          order: modIndex + 1,
        },
      });
      modulesCreated++;

      for (let lessonIndex = 0; lessonIndex < moduleData.lessons.length; lessonIndex++) {
        const lessonData = moduleData.lessons[lessonIndex];
        const lesson = await prisma.lesson.create({
          data: {
            moduleId: module.id,
            title: lessonData.title,
            description: lessonData.description,
            lessonType: 'video',
            order: lessonIndex + 1,
            content: `Comprehensive training on ${lessonData.title.toLowerCase()}. This lesson covers key concepts, common mistakes, and progressive drills to master this fundamental skill.`,
          },
        });
        lessonsCreated++;

        // Create placeholder asset
        await prisma.contentAsset.create({
          data: {
            lessonId: lesson.id,
            title: `${lessonData.title} Video`,
            assetType: 'video',
            fileUrl: `/placeholder-video/${lessonData.title.toLowerCase().replace(/\s+/g, '-')}`,
            originalUrl: 'https://membership.io/content/skill-development',
          },
        });
        assetsCreated++;
      }
    }
  }

  console.log('\n=== Skill Development Import Complete ===');
  console.log(`Courses created: ${coursesCreated}`);
  console.log(`Modules created: ${modulesCreated}`);
  console.log(`Lessons created: ${lessonsCreated}`);
  console.log(`Assets created: ${assetsCreated}`);
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Error during import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
