const GRAPH_URL = "https://graph.facebook.com/v20.0";

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;

  if (!phoneId || !token) {
    console.warn("[whatsapp] WHATSAPP_PHONE_ID o WHATSAPP_TOKEN no configurados");
    return;
  }

  const res = await fetch(`${GRAPH_URL}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[whatsapp] error al enviar:", err);
  }
}
