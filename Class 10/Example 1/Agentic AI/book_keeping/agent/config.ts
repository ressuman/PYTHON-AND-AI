/**
 * Agent runtime configuration.
 * pi-coding-agent is loaded here and wired to the application context.
 */
import type { createAgent } from "@earendil-works/pi-coding-agent";

export type AgentInstance = Awaited<ReturnType<typeof createAgent>>;

export interface AgentConfig {
  persona: string;
  skills: string[];
  model: string;
}

export const defaultConfig: AgentConfig = {
  persona: "Ledger",
  skills: ["bookkeeping"],
  model: "claude-sonnet-4-20250514",
};
