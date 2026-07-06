// Transcripción de audios con OpenAI Whisper.
// Requiere OPENAI_API_KEY en el entorno (Vercel → Settings → Environment Variables).

const EXT_BY_MIME: Record<string, string> = {
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/aac": "m4a",
  "audio/amr": "amr",
  "audio/wav": "wav",
  "audio/webm": "webm",
};

export async function transcribeAudio(audio: Uint8Array, mimeType: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY no configurada — no se puede transcribir audio");
  }

  const baseMime = mimeType.split(";")[0].trim().toLowerCase();
  const ext = EXT_BY_MIME[baseMime] ?? "ogg";

  // Copia a un Uint8Array con backing ArrayBuffer (no ArrayBufferLike) para satisfacer BlobPart
  const bytes = new Uint8Array(audio);
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: baseMime }), `audio.${ext}`);
  form.append("model", "whisper-1");
  form.append("language", "es");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Whisper ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as { text?: string };
  return (data.text ?? "").trim();
}
