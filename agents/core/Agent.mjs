import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

export class SoftwareAgent {
  constructor(definition, agentsDirectory, provider) {
    this.definition = definition;
    this.agentsDirectory = agentsDirectory;
    this.provider = provider;
  }

  async execute(context) {
    const startedAt = new Date().toISOString();
    const promptPath = path.resolve(this.agentsDirectory, this.definition.prompt);
    const prompt = await readFile(promptPath, "utf8");
    const evidence = [];

    for (const output of this.definition.outputs) {
      const outputPath = path.resolve(this.agentsDirectory, output);
      const content = await readFile(outputPath);
      const metadata = await stat(outputPath);
      evidence.push({
        path: path.relative(path.resolve(this.agentsDirectory, ".."), outputPath),
        bytes: metadata.size,
        sha256: createHash("sha256").update(content).digest("hex"),
      });
    }

    const review = await this.provider.review({ agent: this.definition, prompt, context, evidence });
    return {
      runId: crypto.randomUUID(),
      agentId: this.definition.id,
      agentName: this.definition.name,
      phase: this.definition.phase,
      workstream: this.definition.workstream,
      responsibilities: this.definition.responsibilities,
      inputs: this.definition.inputs,
      dependsOn: this.definition.dependsOn || [],
      handoffTo: this.definition.handoffTo || [],
      provider: this.provider.name,
      status: "completed",
      startedAt,
      completedAt: new Date().toISOString(),
      evidence,
      review,
    };
  }
}
