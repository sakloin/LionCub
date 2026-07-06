const GRAPH_URL = "https://graph.facebook.com/v21.0";

async function sendPayload(payload: Record<string, unknown>): Promise<void> {
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
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[whatsapp] error al enviar:", err);
  }
}

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  await sendPayload({ to, type: "text", text: { body } });
}

export async function sendWhatsAppImage(to: string, imageUrl: string, caption?: string): Promise<void> {
  await sendPayload({ to, type: "image", image: caption ? { link: imageUrl, caption } : { link: imageUrl } });
}

// Descarga un archivo multimedia recibido (notas de voz, imágenes) usando su media ID.
// Flujo Cloud API: GET /{mediaId} devuelve una URL temporal que exige el mismo Bearer.
export async function fetchWhatsAppMedia(
  mediaId: string,
): Promise<{ data: Uint8Array; mimeType: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  if (!token) throw new Error("WHATSAPP_TOKEN no configurado");

  const metaRes = await fetch(`${GRAPH_URL}/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!metaRes.ok) throw new Error(`media meta ${metaRes.status}: ${await metaRes.text()}`);
  const meta = (await metaRes.json()) as { url?: string; mime_type?: string };
  if (!meta.url) throw new Error("media sin url");

  const fileRes = await fetch(meta.url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!fileRes.ok) throw new Error(`media download ${fileRes.status}`);

  return {
    data: new Uint8Array(await fileRes.arrayBuffer()),
    mimeType: meta.mime_type ?? fileRes.headers.get("content-type") ?? "audio/ogg",
  };
}
