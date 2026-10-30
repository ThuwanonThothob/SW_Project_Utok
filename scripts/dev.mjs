import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const processes = [
  { name: "API", color: "\u001b[33m", child: spawn(npmCommand, ["run", "dev", "--workspace", "backend"], { stdio: ["inherit", "pipe", "pipe"] }) },
  { name: "WEB", color: "\u001b[36m", child: spawn(npmCommand, ["run", "dev", "--workspace", "frontend"], { stdio: ["inherit", "pipe", "pipe"] }) },
];

for (const processInfo of processes) {
  const prefix = `${processInfo.color}[${processInfo.name}]\u001b[0m`;
  processInfo.child.stdout.on("data", (chunk) => process.stdout.write(`${prefix} ${chunk}`));
  processInfo.child.stderr.on("data", (chunk) => process.stderr.write(`${prefix} ${chunk}`));
  processInfo.child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${prefix} stopped with exit code ${code}`);
      shutdown(code);
    }
  });
}

let stopping = false;
function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const processInfo of processes) processInfo.child.kill("SIGTERM");
  setTimeout(() => process.exit(code), 250);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
