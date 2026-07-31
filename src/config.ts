import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${name}. Confira seu arquivo .env`
    );
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),

  whatsapp: {
    token: required("WHATSAPP_TOKEN"),
    phoneNumberId: required("WHATSAPP_PHONE_NUMBER_ID"),
    verifyToken: required("WHATSAPP_VERIFY_TOKEN"),
    apiVersion: "v21.0",
  },

  claude: {
    apiKey: required("ANTHROPIC_API_KEY"),
    model: process.env.CLAUDE_MODEL ?? "claude-sonnet-5",
    systemPrompt:
      process.env.CLAUDE_SYSTEM_PROMPT ??
      "Você é um assistente útil que responde de forma clara e objetiva via WhatsApp.",
  },
};
