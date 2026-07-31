import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config";

const anthropic = new Anthropic({ apiKey: config.claude.apiKey });

/**
 * Envia o texto do usuário para a API do Claude e retorna a resposta em
 * texto pronta para ser enviada de volta pelo WhatsApp.
 *
 * Esta versão é "stateless" (sem memória entre mensagens). Veja o README
 * para instruções de como adicionar histórico de conversa por usuário.
 */
export async function askClaude(userMessage: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: config.claude.model,
    max_tokens: 1024,
    system: config.claude.systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock && textBlock.type === "text"
    ? textBlock.text
    : "Desculpe, não consegui gerar uma resposta agora.";
}
