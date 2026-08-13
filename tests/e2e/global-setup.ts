import { execSync } from "child_process";

async function globalSetup() {
  console.log("Running E2E global setup...");
  try {
    execSync("node apps/backend/src/prisma/e2e-seed.cjs", { stdio: "inherit" });
  } catch (err) {
    console.error("Failed to run E2E seed script", err);
    throw err;
  }
}

export default globalSetup;
