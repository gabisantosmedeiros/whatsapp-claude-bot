import axios from "axios";
import { config } from "./config";
import { WhatsAppMessage, WhatsAppWebhookPayload } from "./types";

const GRAPH_URL = `https://graph.facebook.com/${config.whatsapp.apiVersion}/${config.whatsapp.phoneNumberId}/messages`;

/**
 * Envia uma mensagem de texto simples para um número via WhatsApp Cloud API.
 * `to` deve estar no formato internacional sem "+" (ex: 5511999999999).
 */
export async function sendWhatsAppText(to: string, body: string): Promise<void> {
  try {
    await axios.post(
      GRAPH_URL,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      },
      {
        headers: {
          Authorization: `Bearer ${config.whatsapp.token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Erro ao enviar mensagem para o WhatsApp:",
        error.response?.data ?? error.message
      );
    } else {
      console.error("Erro inesperado ao enviar mensagem para o WhatsApp:", error);
    }
    throw error;
  }
}

/**
 * Extrai a primeira mensagem de texto recebida em um payload de webhook,
 * caso exista. Retorna null se o payload não contiver uma mensagem de texto
 * (ex: é uma notificação de status "delivered"/"read").
 */
export function extractIncomingTextMessage(
  payload: WhatsAppWebhookPayload
): { from: string; text: string; messageId: string } | null {
  const change = payload.entry?.[0]?.changes?.[0];
  const message: WhatsAppMessage | undefined = change?.value?.messages?.[0];

  if (!message) return null;

  if (message.type === "text" && message.text?.body) {
    return { from: message.from, text: message.text.body, messageId: message.id };
  }

  if (message.type === "button" && message.button?.text) {
    return { from: message.from, text: message.button.text, messageId: message.id };
  }

  return null;
}
