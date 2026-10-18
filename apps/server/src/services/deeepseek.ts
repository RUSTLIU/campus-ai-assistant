import type { ChatMessage } from "@campus-ai/shared-types";
import OpenAI from "openai";

export async function chatWithDeepSeek(messages: ChatMessage[]): Promise<string> {
  // DeepSeek 专属的环境变量
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseURL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1";
  // 默认模型通常用 deepseek-chat (代表 V3 或最新版通用模型)
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

  // 关键知识点1：真实Key只能从后端.env读取，不能硬编码或发送到前端。
  if (!apiKey) {
    throw new Error("未配置 DeepSeek 的 DEEPSEEK_API_KEY");
  }

  // 关键知识点2：DeepSeek 兼容 OpenAI 协议，只需替换 Key、Base URL 和模型名称。
  const client = new OpenAI({
    apiKey,
    baseURL,
    timeout: 120_000,
  });

  try {
    const completion = await client.chat.completions.create({
      model,
      // 关键知识点3：传入全部 messages，模型才能理解本轮对话的上下文。
      messages: messages.map(({ role, content }) => ({ role, content })),
      stream: false,
      temperature: 0.7,
    });

    // 关键知识点4：OpenAI兼容响应的正文位于 choices[0].message.content。
    const content = completion.choices[0]?.message.content?.trim();

    if (!content) {
      throw new Error("DeepSeek 没有返回有效内容");
    }

    return content;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "未知错误";
    // 修改 2：修改报错前缀，方便排查
    throw new Error(`DeepSeek 调用失败：${message}`, { cause: error });
  }
}