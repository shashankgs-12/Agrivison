import { spawnSync } from "node:child_process";
import process from "node:process";

function runNpm(args) {
  const npmCliPath = process.env.npm_execpath;
  if (!npmCliPath) {
    throw new Error("Run the Vercel build script through npm.");
  }

  const result = spawnSync(process.execPath, [npmCliPath, ...args], {
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (process.env.VERCEL_ENV === "production") {
  runNpm(["exec", "--", "prisma", "migrate", "deploy"]);
}

runNpm(["exec", "--", "next", "build"]);
