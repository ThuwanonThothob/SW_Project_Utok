export function validateTeam(team) {
  const ids = new Set();
  const phaseOrder = new Map();

  for (const agent of team.agents) {
    if (ids.has(agent.id)) throw new Error(`Duplicate agent id: ${agent.id}`);
    ids.add(agent.id);
    if (!phaseOrder.has(agent.phase)) phaseOrder.set(agent.phase, phaseOrder.size);
  }

  for (const agent of team.agents) {
    for (const dependency of agent.dependsOn || []) {
      const owner = team.agents.find((candidate) => candidate.id === dependency);
      if (!owner) throw new Error(`${agent.id} depends on unknown agent: ${dependency}`);
      if (phaseOrder.get(owner.phase) >= phaseOrder.get(agent.phase)) {
        throw new Error(`${agent.id} must depend only on an earlier phase: ${dependency}`);
      }
    }
    for (const recipient of agent.handoffTo || []) {
      if (recipient !== "human-orchestrator" && !ids.has(recipient)) {
        throw new Error(`${agent.id} hands off to unknown agent: ${recipient}`);
      }
    }
    if (!agent.outputs?.length) throw new Error(`${agent.id} has no traceable outputs`);
  }

  for (const checkpoint of team.checkpoints) {
    if (!phaseOrder.has(checkpoint.afterPhase)) throw new Error(`Checkpoint ${checkpoint.id} references an unknown phase`);
  }

  return { agentCount: ids.size, phaseCount: phaseOrder.size };
}
