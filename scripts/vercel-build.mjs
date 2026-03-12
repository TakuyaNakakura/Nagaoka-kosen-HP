import { spawn } from "node:child_process";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: process.env,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${command} was terminated by signal ${signal}`));
        return;
      }

      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with code ${code ?? "unknown"}`));
    });
  });
}

function shouldSeedPreview() {
  if (process.env.SEED_DATABASE_IF_EMPTY === "true") {
    return true;
  }

  if (process.env.SEED_PREVIEW_DATA === "false") {
    return false;
  }

  return process.env.VERCEL_ENV === "preview";
}

async function main() {
  await run("npm", ["run", "migrate:deploy"]);

  if (shouldSeedPreview()) {
    console.log("Seeding database if empty...");
    await run("npm", ["run", "seed:if-empty"]);
  } else {
    console.log("Preview seed step skipped.");
  }

  await run("npm", ["run", "build"]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
