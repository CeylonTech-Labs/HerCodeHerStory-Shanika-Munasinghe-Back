import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  "Code & Projects",
  "AI Learning",
  "University Life",
  "Study Life",
  "Certificates",
  "Achievements",
  "Travel",
  "Journal",
  "Thoughts",
  "Events",
  "Life Lessons",
  "Extracurricular"
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "shanika.uok2@gmail.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "21PQshani@";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Shanika Munasinghe",
      password: hashedPassword,
      role: "ADMIN"
    },
    create: {
      name: "Shanika Munasinghe",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      bio: "Software engineering, AI learning, university life, projects, achievements and personal growth."
    }
  });

  await prisma.profile.upsert({
    where: { id: 1 },
    update: {
      fullName: "Shanika Munasinghe",
      portfolioTitle: "HerCodeHerStory - Shanika Munasinghe"
    },
    create: {
      id: 1,
      fullName: "Shanika Munasinghe",
      title: "Software Engineering Student",
      portfolioTitle: "HerCodeHerStory - Shanika Munasinghe",
      shortBio: "A personal platform for code, learning, research, achievements, travel, journals and growth."
    }
  });

  for (const name of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: {
        name,
        slug: slugify(name)
      }
    });
  }

  console.log(`Seeded admin user: ${adminEmail}`);
  console.log("If you used the default seed password, change it immediately after first login.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
