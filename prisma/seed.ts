// prisma/seed.ts
import { hashPassword } from "@core/auth";
import { getPrisma } from "@core/db";
import { error, formatError, info } from "@core/logger";

async function seed(): Promise<void> {
  try {
    const prisma = getPrisma();
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;

    if (!email || !password) {
      info("Skipping seed because SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD is not set", {
        file: "prisma/seed.ts",
        function: "seed",
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: "admin",
        isAdmin: true,
      },
      create: {
        email,
        password: hashedPassword,
        name: "Admin",
        role: "admin",
        isAdmin: true,
      },
    });

    info("Seeded admin user", {
      file: "prisma/seed.ts",
      function: "seed",
      email,
    });
  } catch (e) {
    error("Couldn't seed database", {
      file: "prisma/seed.ts",
      function: "seed",
      error: formatError(e),
    });
    throw new Error("Couldn't seed database.");
  }
}

seed()
  .catch(() => {
    process.exit(1);
  });
