import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin12345', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@persona.com' },
    update: {},
    create: {
      email: 'admin@persona.com',
      passwordHash: adminPassword,
      fullName: 'Admin User',
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log('Created admin:', admin.email);

  // Create sample users
  const userPassword = await bcrypt.hash('password123', 10);

  const usersData = [
    { email: 'john@example.com', fullName: 'John Doe' },
    { email: 'jane@example.com', fullName: 'Jane Smith' },
    { email: 'mike@example.com', fullName: 'Mike Johnson' },
    { email: 'sarah@example.com', fullName: 'Sarah Wilson' },
    { email: 'david@example.com', fullName: 'David Brown' },
  ];

  const createdUsers: any[] = [];
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash: userPassword,
        fullName: u.fullName,
        isVerified: true,
      },
    });
    createdUsers.push(user);
    console.log('Created user:', user.email);
  }

  // Create skills
  const skillsData = [
    { name: 'TypeScript', category: 'Programming' },
    { name: 'NestJS', category: 'Programming' },
    { name: 'React', category: 'Programming' },
    { name: 'Career Coaching', category: 'Career' },
    { name: 'Resume Review', category: 'Career' },
    { name: 'Interview Prep', category: 'Career' },
    { name: 'Nutrition', category: 'Health' },
    { name: 'Mental Health', category: 'Health' },
    { name: 'Financial Planning', category: 'Finance' },
    { name: 'Investing', category: 'Finance' },
    { name: 'UX Design', category: 'Design' },
    { name: 'Product Management', category: 'Business' },
  ];

  const skills: any[] = [];
  for (const s of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
    skills.push(skill);
  }
  console.log(`Created ${skills.length} skills`);

  // Create personas
  const personasData = [
    {
      userIndex: 0,
      headline: 'Senior Software Engineer & Tech Lead',
      bio: '10+ years of experience building scalable web applications. I help developers level up their skills and navigate their careers.',
      hourlyRate: 75,
      skillNames: ['TypeScript', 'NestJS', 'React'],
    },
    {
      userIndex: 1,
      headline: 'Career Coach & Resume Expert',
      bio: 'Helped 500+ professionals land their dream jobs. Specializing in resume optimization, interview preparation, and career transitions.',
      hourlyRate: 60,
      skillNames: ['Career Coaching', 'Resume Review', 'Interview Prep'],
    },
    {
      userIndex: 2,
      headline: 'Certified Nutritionist & Wellness Coach',
      bio: 'Certified nutritionist helping clients build sustainable healthy habits. Personalized nutrition plans and wellness coaching.',
      hourlyRate: 50,
      skillNames: ['Nutrition', 'Mental Health'],
    },
    {
      userIndex: 3,
      headline: 'Financial Advisor & Investment Strategist',
      bio: 'CFA charterholder with 8 years of experience in financial planning and investment management. Helping you build wealth.',
      hourlyRate: 90,
      skillNames: ['Financial Planning', 'Investing'],
    },
    {
      userIndex: 4,
      headline: 'UX Designer & Product Consultant',
      bio: 'Designing user-centered products for 7+ years. I help teams create intuitive, accessible, and beautiful experiences.',
      hourlyRate: 65,
      skillNames: ['UX Design', 'Product Management'],
    },
  ];

  const personas: any[] = [];
  for (const p of personasData) {
    const user = createdUsers[p.userIndex];
    const persona = await prisma.persona.create({
      data: {
        userId: user.id,
        headline: p.headline,
        bio: p.bio,
        hourlyRate: p.hourlyRate,
        isVerified: true,
        rating: 4.5 + Math.random() * 0.5,
        ratingCount: Math.floor(Math.random() * 50) + 5,
        skills: {
          create: p.skillNames.map((skillName: string) => {
            const skill = skills.find((s) => s.name === skillName)!;
            return { skillId: skill.id };
          }),
        },
      },
    });
    personas.push(persona);
    console.log('Created persona:', persona.headline);

    // Update user role to PERSONA
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'PERSONA' },
    });
  }

  // Create availability slots for personas
  const now = new Date();
  for (let i = 0; i < personas.length; i++) {
    const persona = personas[i];
    for (let day = 1; day <= 5; day++) {
      for (let hour = 9; hour <= 16; hour += 2) {
        const startTime = new Date(now);
        startTime.setDate(startTime.getDate() + day);
        startTime.setHours(hour, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);

        await prisma.availability.create({
          data: {
            personaId: persona.id,
            startTime,
            endTime,
          },
        });
      }
    }
    console.log(`Created availability for persona ${i + 1}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });