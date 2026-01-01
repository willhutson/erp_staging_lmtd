import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create or find organization
  let org = await prisma.organization.findFirst({
    where: { slug: "lmtd" },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "TeamLMTD",
        slug: "lmtd",
      },
    });
    console.log("Created organization:", org.name);
  } else {
    console.log("Found existing organization:", org.name);
  }

  // Create admin user (Will)
  // The supabaseId will be linked when you first log in
  const willEmail = "will@teamlmtd.com";

  let will = await prisma.user.findFirst({
    where: { email: willEmail },
  });

  if (!will) {
    will = await prisma.user.create({
      data: {
        organizationId: org.id,
        email: willEmail,
        name: "Will Hutson",
        role: "Founder",
        department: "Leadership",
        permissionLevel: "ADMIN",
        isActive: true,
      },
    });
    console.log("Created user:", will.name);
  } else {
    console.log("Found existing user:", will.name);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
