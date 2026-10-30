import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateTeam } from "./core/teamValidation.mjs";

const directory = path.dirname(fileURLToPath(import.meta.url));
const team = JSON.parse(await readFile(path.join(directory, "team.json"), "utf8"));
const approvals = JSON.parse(await readFile(path.join(directory, "human-approvals.json"), "utf8"));
const topology = validateTeam(team);
console.log(`${team.name} · ${topology.agentCount} agents · ${topology.phaseCount} phases`);
for (const phase of [...new Set(team.agents.map((agent) => agent.phase))]) {
  console.log(`\n[${phase.toUpperCase()}]`);
  for (const agent of team.agents.filter((item) => item.phase === phase)) {
    const dependencies = agent.dependsOn.length ? agent.dependsOn.join(", ") : "project brief";
    console.log(`- ${agent.name}`);
    console.log(`  owns: ${agent.workstream}`);
    console.log(`  waits for: ${dependencies}`);
    console.log(`  hands off to: ${agent.handoffTo.join(", ")}`);
  }
}
console.log("\nHuman checkpoints");
for (const checkpoint of team.checkpoints) console.log(`- ${checkpoint.id.padEnd(14)} ${approvals[checkpoint.id]?.status || "missing"}`);
