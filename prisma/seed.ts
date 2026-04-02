import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Demo user for pilot
  const passwordHash = await hash("pilot2026!", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@lawops.ca" },
    update: {},
    create: {
      email: "demo@lawops.ca",
      name: "Demo User",
      passwordHash,
    },
  });

  console.log(`Seeded user: ${user.email} (id: ${user.id})`); // eslint-disable-line no-console
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
