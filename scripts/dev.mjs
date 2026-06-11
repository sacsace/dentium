import { spawn } from "node:child_process";

// Cursor/shell may set NODE_ENV=production globally; dev server requires development.
process.env.NODE_ENV = "development";

const args = ["next", "dev", ...process.argv.slice(2)];
const child = spawn("npx", args, {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
