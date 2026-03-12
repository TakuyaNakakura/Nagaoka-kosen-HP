import { PrismaClient } from "@prisma/client";

const maxAttempts = Number(process.env.DB_WAIT_MAX_ATTEMPTS ?? "30");
const delayMs = Number(process.env.DB_WAIT_DELAY_MS ?? "2000");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    console.log(`Database is ready after ${attempt} attempt(s).`);
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.$disconnect().catch(() => undefined);
    console.log(`Database is not ready yet (${attempt}/${maxAttempts}): ${message}`);

    if (attempt === maxAttempts) {
      console.error("Database did not become ready in time.");
      process.exit(1);
    }

    await sleep(delayMs);
  }
}
