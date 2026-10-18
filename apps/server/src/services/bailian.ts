import type { ChatMessage } from "@campus-ai/shared-types";
import OpenAI from "openai";
export async function chatWithBailianOpenAI(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const baseURL =
    process.env.DASHSCOPE_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1";
  const model = process.env.DASHSCOPE_MODEL ?? "glm-5.1";

  // 关键知识点1：真实Key只能从后端.env读取，不能硬编码或发送到前端。
  if (!apiKey) {
    throw new Error("未配置阿里百炼DASHSCOPE_API_KEY");
  }

  // 关键知识点2：百炼兼容OpenAI协议，只需替换Key、Base URL和模型名称。
  const client = new OpenAI({
    apiKey,
    baseURL,
    timeout: 120_000,
  });

  try {
    const completion = await client.chat.completions.create({
      model,
      // 关键知识点3：传入全部messages，模型才能理解本轮对话的上下文。
      messages: messages.map(({ role, content }) => ({ role, content })),
      stream: false,
      temperature: 0.7,
    });

    // 关键知识点4：OpenAI兼容响应的正文位于choices[0].message.content。
    const content = completion.choices[0]?.message.content?.trim();

    if (!content) {
      throw new Error("阿里百炼没有返回有效内容");
    }

    return content;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "未知错误";
    throw new Error(`阿里百炼调用失败：${message}`, { cause: error });
  }
}
