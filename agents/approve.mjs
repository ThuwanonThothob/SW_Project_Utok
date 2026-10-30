import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const agentsDirectory = path.dirname(fileURLToPath(import.meta.url));
const [checkpoint, actor, note = ""] = process.argv.slice(2);
if (!checkpoint || !actor) {
  console.error("Usage: npm run agents:approve -- <checkpoint> <actor> [note]");
  process.exit(1);
}
const file = path.join(agentsDirectory, "human-approvals.json");
const approvals = JSON.parse(await readFile(file, "utf8"));
if (!Object.hasOwn(approvals, checkpoint)) {
  console.error(`Unknown checkpoint '${checkpoint}'. Available: ${Object.keys(approvals).join(", ")}`);
  process.exit(1);
}
approvals[checkpoint] = { status: "approved", actor, approvedAt: new Date().toISOString(), note };
await writeFile(file, `${JSON.stringify(approvals, null, 2)}\n`);
console.log(`Approved '${checkpoint}' by ${actor}`);
