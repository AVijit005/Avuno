import { execSync } from "child_process";

async function globalSetup() {
  console.log("Running E2E global setup...");
  try {
    execSync("bunx tsx apps/backend/src/prisma/e2e-seed.ts", { stdio: "inherit" });
  } catch {
    try {
      execSync("npx --yes tsx apps/backend/src/prisma/e2e-seed.ts", { stdio: "inherit" });
    } catch (err) {
      console.warn("E2E seed script warning:", err);
    }
  }
}

export default globalSetup;
