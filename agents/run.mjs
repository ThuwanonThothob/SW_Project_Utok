import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SoftwareAgent } from "./core/Agent.mjs";
import { createProvider } from "./core/providers.mjs";
import { validateTeam } from "./core/teamValidation.mjs";

const agentsDirectory = path.dirname(fileURLToPath(import.meta.url));
const logsDirectory = path.join(agentsDirectory, "logs");
const team = JSON.parse(await readFile(path.join(agentsDirectory, "team.json"), "utf8"));
const approvals = JSON.parse(await readFile(path.join(agentsDirectory, "human-approvals.json"), "utf8"));
const provider = createProvider();
const topology = validateTeam(team);
const phases = [...new Set(team.agents.map((agent) => agent.phase))];
const executionId = crypto.randomUUID();
const execution = { executionId, team: team.name, topology, provider: provider.name, startedAt: new Date().toISOString(), status: "running", phases: [], handoffs: [] };
const completedAgents = new Set();

await mkdir(logsDirectory, { recursive: true });

for (const phase of phases) {
  const phaseResult = { phase, status: "running", agents: [] };
  const definitions = team.agents.filter((agent) => agent.phase === phase);
  console.log(`\n[${phase.toUpperCase()}] ${definitions.length} specialized agent(s)`);
  for (const definition of definitions) {
    const missingDependencies = (definition.dependsOn || []).filter((dependency) => !completedAgents.has(dependency));
    if (missingDependencies.length) throw new Error(`${definition.name} is blocked by: ${missingDependencies.join(", ")}`);
    const agent = new SoftwareAgent(definition, agentsDirectory, provider);
    const result = await agent.execute({ executionId, project: "ThaiFlood Watch", previousPhases: execution.phases.map((item) => item.phase) });
    phaseResult.agents.push(result);
    completedAgents.add(definition.id);
    for (const recipient of definition.handoffTo || []) {
      execution.handoffs.push({ from: definition.id, to: recipient, outputs: definition.outputs, at: result.completedAt });
    }
    await appendFile(path.join(logsDirectory, "agent-execution.jsonl"), `${JSON.stringify(result)}\n`);
    console.log(`✓ ${definition.name} [${definition.workstream}]: ${result.evidence.length} output(s) verified`);
    console.log(`  ↳ handoff: ${(definition.handoffTo || []).join(", ")}`);
  }
  phaseResult.status = "completed";
  execution.phases.push(phaseResult);

  const checkpoint = team.checkpoints.find((item) => item.afterPhase === phase);
  if (checkpoint) {
    const approval = approvals[checkpoint.id] || { status: "pending" };
    execution.checkpoint = { id: checkpoint.id, ...approval };
    console.log(`${approval.status === "approved" ? "✓" : "⏸"} Human checkpoint '${checkpoint.id}': ${approval.status}`);
    if (approval.status !== "approved") {
      execution.status = "paused_for_human_approval";
      execution.completedAt = new Date().toISOString();
      await writeFile(path.join(logsDirectory, "workflow-state.json"), `${JSON.stringify(execution, null, 2)}\n`);
      console.log(`\nWorkflow paused. Approve with:\n  npm run agents:approve -- ${checkpoint.id} "Your Name" "Approval note"`);
      process.exit(2);
    }
  }
}

execution.status = "completed";
execution.completedAt = new Date().toISOString();
await writeFile(path.join(logsDirectory, "workflow-state.json"), `${JSON.stringify(execution, null, 2)}\n`);
console.log("\nAgentic SDLC completed and approved for release.");
