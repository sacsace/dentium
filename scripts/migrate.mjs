#!/usr/bin/env node
/**
 * Database migration helper
 * Usage:
 *   node scripts/migrate.mjs           # deploy pending migrations
 *   node scripts/migrate.mjs --seed    # deploy + seed
 *   node scripts/migrate.mjs --status  # show migration status
 */
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function run(command) {
  console.log(`\n> ${command}\n`);
  execSync(command, { cwd: root, stdio: "inherit", env: process.env });
}

try {
  if (args.includes("--status")) {
    run("npx prisma migrate status");
    process.exit(0);
  }

  run("npx prisma migrate deploy");
  run("npx prisma generate");

  if (args.includes("--seed")) {
    run("npm run db:seed");
  }

  console.log("\nMigration complete.");
} catch (error) {
  console.error("\nMigration failed.");
  process.exit(error.status ?? 1);
}
