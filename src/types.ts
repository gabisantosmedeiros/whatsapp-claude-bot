// Tipagem simplificada do payload que a Meta envia no webhook do WhatsApp
// Cloud API. Cobre apenas os campos usados por este projeto — o payload
// real tem mais campos opcionais.

export interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppEntry[];
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppChange {
  field: string;
  value: {
    messaging_product: "whatsapp";
    metadata: {
      display_phone_number: string;
      phone_number_id: string;
    };
    contacts?: Array<{
      profile: { name: string };
      wa_id: string;
    }>;
    messages?: WhatsAppMessage[];
    statuses?: unknown[];
  };
}

export interface WhatsAppMessage {
  from: string; // número do usuário que enviou a mensagem
  id: string;
  timestamp: string;
  type: "text" | "image" | "audio" | "video" | "document" | "button" | string;
  text?: { body: string };
  button?: { text: string; payload: string };
}
