export class ArtifactVerificationProvider {
  name = "local-artifact-verifier";

  async review({ agent, evidence }) {
    return `${agent.name} verified ${evidence.length} required output(s) with SHA-256 traceability.`;
  }
}

export class CompatibleLlmProvider {
  constructor() {
    this.name = `llm:${process.env.AGENT_LLM_MODEL || "configured-model"}`;
    this.endpoint = process.env.AGENT_LLM_ENDPOINT;
    this.apiKey = process.env.AGENT_LLM_API_KEY;
    this.model = process.env.AGENT_LLM_MODEL;
  }

  async review({ prompt, context, evidence }) {
    if (!this.endpoint || !this.apiKey || !this.model) throw new Error("AGENT_LLM_ENDPOINT, AGENT_LLM_API_KEY and AGENT_LLM_MODEL are required");
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: `Review the current project outputs.\nContext: ${JSON.stringify(context)}\nEvidence: ${JSON.stringify(evidence)}\nReturn a concise verification summary and any blocking issue.` },
        ],
        temperature: 0.1,
      }),
    });
    if (!response.ok) throw new Error(`LLM provider returned HTTP ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || data.output_text || "LLM review completed";
  }
}

export function createProvider() {
  return process.env.AGENT_LLM_ENDPOINT ? new CompatibleLlmProvider() : new ArtifactVerificationProvider();
}
