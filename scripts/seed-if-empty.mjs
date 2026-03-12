import { spawn } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [userCount, companyCount] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
  ]);

  if (userCount > 0 || companyCount > 0) {
    console.log("Seed skipped because existing data was found.");
    return;
  }

  await prisma.$disconnect();

  await new Promise((resolve, reject) => {
    const child = spawn("node", ["prisma/seed.js"], {
      env: process.env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }
      reject(new Error(`Seed script exited with code ${code ?? "unknown"}`));
    });
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => undefined);
  });
