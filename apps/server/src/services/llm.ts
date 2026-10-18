import type { ChatMessage } from "@campus-ai/shared-types";

import { chatWithOllama } from "./ollama.js";
import { chatWithBailianOpenAI } from "./bailian.js";
import { chatWithDeepSeek } from "./deeepseek.js";

export async function chatWithConfiguredModel(message: ChatMessage[]): Promise<string> {
  const provider = process.env.LLM_PROVIDER ?? "ollama";
  if (provider === "ollama") {
    return chatWithOllama(message);
  }
  if (provider === "bailian") {
    return chatWithBailianOpenAI(message);
  }
  if (provider === "deepseek") {
    return chatWithDeepSeek(message);
  }
  throw new Error(`不支持的LLM提供程序: ${provider}`);
}
