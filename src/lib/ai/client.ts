import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("Brak ANTHROPIC_API_KEY w środowisku.");
    }
    client = new Anthropic();
  }
  return client;
}

export const INGEST_MODEL = process.env.INGEST_MODEL || "claude-sonnet-4-6";
export const LINT_MODEL = process.env.LINT_MODEL || "claude-sonnet-4-6";
