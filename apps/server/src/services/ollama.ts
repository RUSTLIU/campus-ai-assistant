import type { ChatMessage } from "@campus-ai/shared-types";

interface OllamaResponse {
  message?: {
    content?: string;
  };
  error?: string;
}

/**
 * 与 Ollama 大语言模型进行对话
 *
 * @param message - 聊天消息数组，包含角色和内容
 * @returns 模型生成的回复内容
 * @throws 连接超时（5分钟）、无法连接服务、请求失败或响应为空时抛出错误
 */
export async function chatWithOllama(message: ChatMessage[]): Promise<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434".replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL ?? "qwen3:8b";

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: message.map((m) => ({ role: m.role, content: m.content })),
        stream: false,
        options: {
          temperature: 0.5,
        },
        think: false,
      }),
      signal: AbortSignal.timeout(300_1000),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error("Ollama timeout", { cause: error });
    }
    throw new Error("无法连接Ollama服务", { cause: error });
  }
  const result = (await response.json()) as OllamaResponse;
  if (!response.ok) {
    throw new Error(result.error ?? "Ollama请求失败", { cause: response });
  }
  const content = result.message?.content?.trim();
  if (!content) {
    throw new Error("Ollama 响应内容为空", { cause: response });
  }
  return content;
}
