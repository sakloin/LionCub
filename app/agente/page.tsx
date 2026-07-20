"use client";

import { useEffect, useRef, useState } from "react";

type Turn = {
  role: "user" | "assistant";
  text: string;
  images?: string[];
  silent?: boolean;
  voice?: boolean;
};

// Historial en formato Anthropic que se manda al endpoint /api/chat/demo
type ApiMsg = { role: "user" | "assistant"; content: string };

const SUGERENCIAS = [
  "hola, tienes bodys para bebé de 3 meses?",
  "cuánto cuesta y de qué material son?",
  "me mandas fotos?",
  "hacen envíos a provincia?",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function AgenteDemoPage() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [history, setHistory] = useState<ApiMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, loading]);

  // Muestra la respuesta del agente como VARIOS mensajes cortos, con un pequeño
  // delay entre burbujas para que se sienta como una persona escribiendo.
  async function showAssistant(data: any) {
    if (data.error && !data.transcript) {
      setTurns((t) => [...t, { role: "assistant", text: "No pude escuchar bien el audio, ¿me lo escribes?" }]);
      return;
    }
    const msgs: string[] = Array.isArray(data.messages) ? data.messages : [];
    if (data.silent || msgs.length === 0) {
      setTurns((t) => [...t, { role: "assistant", text: "", silent: true }]);
      return;
    }
    for (let i = 0; i < msgs.length; i++) {
      await sleep(i === 0 ? 350 : 800);
      const isLast = i === msgs.length - 1;
      setTurns((t) => [
        ...t,
        { role: "assistant", text: msgs[i], images: isLast ? (data.images ?? []) : [] },
      ]);
    }
    if (Array.isArray(data.history)) setHistory(data.history);
  }

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput("");
    setTurns((t) => [...t, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, message: msg }),
      });
      const data = await res.json();
      await showAssistant(data);
    } catch {
      setTurns((t) => [...t, { role: "assistant", text: "Ups, hubo un problema de conexión. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  }

  async function sendAudio(blob: Blob) {
    if (loading) return;
    setLoading(true);
    setTurns((t) => [...t, { role: "user", text: "🎤 nota de voz…", voice: true }]);
    try {
      const form = new FormData();
      form.append("audio", blob, "nota.webm");
      form.append("history", JSON.stringify(history));
      const res = await fetch("/api/chat/demo", { method: "POST", body: form });
      const data = await res.json();
      // MODO ENTRENAMIENTO: muestra la transcripción para diagnosticar.
      setTurns((t) => {
        const userText = data.transcript?.trim()
          ? `🎤 ${data.transcript}`
          : "🎤 (no se entendió el audio)";
        return [...t.slice(0, -1), { role: "user", text: userText, voice: true }];
      });
      await showAssistant(data);
    } catch {
      setTurns((t) => [...t.slice(0, -1), { role: "assistant", text: "Ups, problema al enviar el audio." }]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleRecording() {
    setMicError("");
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        setRecording(false);
        if (blob.size > 800) sendAudio(blob);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      setMicError("No pude acceder al micrófono. Revisa los permisos del navegador.");
    }
  }

  function reset() {
    setTurns([]);
    setHistory([]);
    setInput("");
  }

  return (
    <main className="min-h-screen bg-[#ece5dd] flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col h-screen bg-[#efeae2] shadow-xl">
        <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#c9a94f] flex items-center justify-center text-lg">🦁</div>
          <div className="flex-1">
            <div className="font-semibold leading-tight">LionCub · Asistente</div>
            <div className="text-xs text-white/70">demo — texto y voz</div>
          </div>
          <button onClick={reset} className="text-xs bg-white/15 hover:bg-white/25 rounded px-2 py-1 transition">
            Reiniciar
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><circle cx=%2220%22 cy=%2220%22 r=%221%22 fill=%22%23d9d0c5%22/></svg>')",
          }}
        >
          {turns.length === 0 && (
            <div className="text-center text-gray-500 text-sm mt-8 space-y-4">
              <p>Escríbele o mándale un audio 🎤 como si fueras cliente</p>
              <div className="flex flex-col gap-2 items-center">
                {SUGERENCIAS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-sm bg-white/80 hover:bg-white rounded-2xl px-3 py-2 shadow-sm text-gray-700 max-w-[85%]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {turns.map((t, i) =>
            t.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="bg-[#d9fdd3] rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%] text-[15px] text-gray-800 whitespace-pre-wrap shadow-sm">
                  {t.text}
                </div>
              </div>
            ) : t.silent ? (
              <div key={i} className="flex justify-center py-1">
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-full px-3 py-1">
                  El agente guardó silencio (mensaje fuera de contexto comercial)
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-start flex-col items-start gap-1">
                {t.text && (
                  <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%] text-[15px] text-gray-800 whitespace-pre-wrap shadow-sm">
                    {t.text}
                  </div>
                )}
                {t.images?.slice(0, 3).map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt="producto"
                    className="rounded-2xl max-w-[70%] shadow-sm border border-black/5"
                  />
                ))}
              </div>
            )
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                </span>
              </div>
            </div>
          )}
        </div>

        {micError && (
          <div className="bg-red-50 text-red-600 text-xs px-4 py-1 text-center shrink-0">{micError}</div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="bg-[#f0f0f0] px-3 py-2 flex items-center gap-2 shrink-0"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={recording ? "Grabando…" : "Escribe un mensaje…"}
            disabled={recording}
            className="flex-1 rounded-full bg-white px-4 py-2 text-[15px] outline-none border border-black/5 disabled:bg-gray-100"
          />
          {input.trim() ? (
            <button
              type="submit"
              disabled={loading}
              className="w-10 h-10 rounded-full bg-[#075e54] text-white flex items-center justify-center disabled:opacity-40 transition"
              aria-label="Enviar"
            >
              ➤
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleRecording}
              disabled={loading}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition disabled:opacity-40 ${
                recording ? "bg-red-500 animate-pulse" : "bg-[#075e54]"
              }`}
              aria-label={recording ? "Detener grabación" : "Grabar audio"}
            >
              {recording ? "■" : "🎤"}
            </button>
          )}
        </form>
      </div>
    </main>
  );
}
