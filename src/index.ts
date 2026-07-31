import express, { Request, Response } from "express";
import { config } from "./config";
import { askClaude } from "./claude";
import { extractIncomingTextMessage, sendWhatsAppText } from "./whatsapp";
import { WhatsAppWebhookPayload } from "./types";

const app = express();
app.use(express.json());

/**
 * GET /webhook
 * Endpoint de verificação exigido pela Meta ao configurar o webhook.
 * A Meta chama essa rota uma única vez, enviando hub.mode, hub.verify_token
 * e hub.challenge. Se o token bater com o nosso, devolvemos o challenge.
 */
app.get("/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.whatsapp.verifyToken) {
    console.log("Webhook verificado com sucesso.");
    res.status(200).send(challenge);
  } else {
    console.warn("Falha na verificação do webhook (token inválido).");
    res.sendStatus(403);
  }
});

/**
 * POST /webhook
 * Recebe as notificações de mensagens do WhatsApp Cloud API.
 * Responde 200 imediatamente (a Meta espera resposta rápida e reenvia o
 * evento se não receber 2xx em poucos segundos) e processa a mensagem
 * de forma assíncrona.
 */
app.post("/webhook", (req: Request, res: Response) => {
  res.sendStatus(200);

  const payload = req.body as WhatsAppWebhookPayload;
  handleIncomingPayload(payload).catch((error) => {
    console.error("Erro ao processar mensagem recebida:", error);
  });
});

async function handleIncomingPayload(payload: WhatsAppWebhookPayload): Promise<void> {
  const incoming = extractIncomingTextMessage(payload);
  if (!incoming) return; // ignora status de entrega/leitura, mídia não suportada, etc.

  console.log(`Mensagem recebida de ${incoming.from}: ${incoming.text}`);

  try {
    const reply = await askClaude(incoming.text);
    await sendWhatsAppText(incoming.from, reply);
    console.log(`Resposta enviada para ${incoming.from}`);
  } catch (error) {
    console.error("Falha ao gerar/enviar resposta:", error);
    await sendWhatsAppText(
      incoming.from,
      "Desculpe, tive um problema ao processar sua mensagem. Tente novamente em instantes."
    ).catch(() => {
      /* evita erro não tratado se o envio de fallback também falhar */
    });
  }
}

app.get("/", (_req: Request, res: Response) => {
  res.send("WhatsApp + Claude bot está no ar.");
});

app.listen(config.port, () => {
  console.log(`Servidor rodando em http://localhost:${config.port}`);
});
