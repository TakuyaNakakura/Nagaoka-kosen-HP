import { spawn } from "node:child_process";

const argv = process.argv.slice(2);

if (argv.length === 0) {
  console.error("Usage: node scripts/run-with-db-env.mjs <command> [args...]");
  process.exit(1);
}

const [command, ...args] = argv;

const directUrlFallback =
  process.env.DIRECT_DATABASE_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

const env = {
  ...process.env,
};

if (!env.DIRECT_DATABASE_URL && directUrlFallback) {
  env.DIRECT_DATABASE_URL = directUrlFallback;
}

const child = spawn(command, args, {
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
