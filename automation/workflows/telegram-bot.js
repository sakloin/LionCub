// ============================================================
// telegram-bot.js
// Bot de Telegram para administrar el sistema de contenido
// Comandos: /start /ideas /publicar /generar /metricas
// Aplica via n8n MCP: create_workflow_from_code
// ============================================================

const ADMIN_CHAT_ID = "7014852927";
const SUPABASE_URL  = "{{ $env.SUPABASE_URL }}";
const WEBHOOK_PUBLISH = "{{ $env.N8N_WEBHOOK_CONTENT_MILL }}";

const credTelegram = newCredential("credTelegram", "telegramApi", {
  accessToken: "{{ $credentials.TELEGRAM_BOT_TOKEN }}",
});

const credSupabase = newCredential("credSupabase", "httpBearerAuth", {
  token: "{{ $credentials.SUPABASE_SERVICE_ROLE_KEY }}",
});

// ── Trigger ──────────────────────────────────────────────────
const tgTrigger = trigger("tgTrigger", "@n8n/n8n-nodes-base.telegramTrigger", {
  credentials: { telegramApi: credTelegram },
  parameters: {
    updates: ["message"],
  },
});

// ── Extraer comando ──────────────────────────────────────────
const extractCmd = node("extractCmd", "@n8n/n8n-nodes-base.code", {
  parameters: {
    jsCode: `
const msg = $input.first().json.message;
const text = (msg?.text ?? "").trim();
const chatId = msg?.chat?.id?.toString();
const parts = text.split(" ");
const command = parts[0].toLowerCase();
const args = parts.slice(1).join(" ");
return [{ json: { command, args, chatId, text } }];
    `,
  },
});

// ── Router de comandos ────────────────────────────────────────
const routeCmd = switchCase("routeCmd", expr("{{ $json.command }}"), [
  { value: "/start",    label: "start"    },
  { value: "/ideas",    label: "ideas"    },
  { value: "/publicar", label: "publicar" },
  { value: "/generar",  label: "generar"  },
  { value: "/metricas", label: "metricas" },
]);

// ── /start ────────────────────────────────────────────────────
const sendWelcome = node("sendWelcome", "@n8n/n8n-nodes-base.telegram", {
  credentials: { telegramApi: credTelegram },
  parameters: {
    operation: "sendMessage",
    chatId: expr("{{ $json.chatId }}"),
    text: `*LionCub Admin Bot* 🦁\n\nComandos disponibles:\n\n/ideas — Ver ideas pendientes de aprobación\n/publicar [id] — Publicar una idea por su ID\n/generar — Forzar generación de nuevas ideas ahora\n/metricas — Resumen de métricas recientes`,
    additionalFields: { parse_mode: "Markdown" },
  },
});

// ── /ideas → Supabase ─────────────────────────────────────────
const queryIdeas = node("queryIdeas", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credSupabase },
  parameters: {
    method: "GET",
    url: `${SUPABASE_URL}/rest/v1/contenido_ideas?estado=eq.nueva&order=created_at.desc&limit=5`,
    headers: {
      apikey: expr("{{ $credentials.SUPABASE_SERVICE_ROLE_KEY }}"),
    },
  },
});

const formatIdeas = node("formatIdeas", "@n8n/n8n-nodes-base.code", {
  parameters: {
    jsCode: `
const ideas = $input.all().map(i => i.json);
const chatId = $('extractCmd').first().json.chatId;
if (!ideas.length) {
  return [{ json: { chatId, text: "No hay ideas pendientes. Usa /generar para crear nuevas." } }];
}
const lines = ideas.map((idea, i) =>
  \`*\${i+1}. \${idea.red_objetivo?.toUpperCase()} — \${idea.tipo_pieza}*\n\${idea.hook ?? ""}\n\`+
  \`ID: \`+\`\\\`\${idea.id.slice(0,8)}\\\`\`
);
return [{ json: { chatId, text: \`*Ideas pendientes:*\n\n\${lines.join("\n")}\n\nUsa /publicar [ID] para publicar una.\` } }];
    `,
  },
});

const sendIdeas = node("sendIdeas", "@n8n/n8n-nodes-base.telegram", {
  credentials: { telegramApi: credTelegram },
  parameters: {
    operation: "sendMessage",
    chatId: expr("{{ $json.chatId }}"),
    text: expr("{{ $json.text }}"),
    additionalFields: { parse_mode: "Markdown" },
  },
});

// ── /publicar [id] ────────────────────────────────────────────
const triggerPublish = node("triggerPublish", "@n8n/n8n-nodes-base.httpRequest", {
  parameters: {
    method: "POST",
    url: WEBHOOK_PUBLISH,
    body: expr(`{ "idea_id": "{{ $('extractCmd').first().json.args }}" }`),
    headers: { "Content-Type": "application/json" },
  },
});

const sendPublishOk = node("sendPublishOk", "@n8n/n8n-nodes-base.telegram", {
  credentials: { telegramApi: credTelegram },
  parameters: {
    operation: "sendMessage",
    chatId: ADMIN_CHAT_ID,
    text: expr("Publicando idea `{{ $('extractCmd').first().json.args }}` en proceso..."),
    additionalFields: { parse_mode: "Markdown" },
  },
});

// ── /generar ──────────────────────────────────────────────────
const triggerGenerate = node("triggerGenerate", "@n8n/n8n-nodes-base.httpRequest", {
  parameters: {
    method: "POST",
    url: `${SUPABASE_URL}/rest/v1/rpc/trigger_content_generation`,
    headers: { "Content-Type": "application/json" },
    body: "{}",
  },
});

const sendGenerateOk = node("sendGenerateOk", "@n8n/n8n-nodes-base.telegram", {
  credentials: { telegramApi: credTelegram },
  parameters: {
    operation: "sendMessage",
    chatId: ADMIN_CHAT_ID,
    text: "Generando nuevas ideas de contenido... Te avisaré cuando estén listas.",
  },
});

// ── /metricas ─────────────────────────────────────────────────
const queryMetricas = node("queryMetricas", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credSupabase },
  parameters: {
    method: "GET",
    url: `${SUPABASE_URL}/rest/v1/contenido_dashboard?order=collected_at.desc&limit=10`,
    headers: {
      apikey: expr("{{ $credentials.SUPABASE_SERVICE_ROLE_KEY }}"),
    },
  },
});

const formatMetricas = node("formatMetricas", "@n8n/n8n-nodes-base.code", {
  parameters: {
    jsCode: `
const rows = $input.all().map(i => i.json);
const chatId = $('extractCmd').first().json.chatId;
if (!rows.length) {
  return [{ json: { chatId, text: "No hay métricas disponibles aún." } }];
}
const lines = rows.slice(0, 5).map(r =>
  \`*\${r.red?.toUpperCase()} | \${r.formato}*\n\` +
  \`Engagement: \${r.engagement_rate ?? "—"} | Views: \${r.views ?? "—"} | Saves: \${r.saves ?? "—"}\`
);
return [{ json: { chatId, text: \`*Métricas recientes:*\n\n\${lines.join("\n\n")}\` } }];
    `,
  },
});

const sendMetricas = node("sendMetricas", "@n8n/n8n-nodes-base.telegram", {
  credentials: { telegramApi: credTelegram },
  parameters: {
    operation: "sendMessage",
    chatId: expr("{{ $json.chatId }}"),
    text: expr("{{ $json.text }}"),
    additionalFields: { parse_mode: "Markdown" },
  },
});

// ── Conexiones ───────────────────────────────────────────────
workflow("LionCub Telegram Bot")
  .connect(tgTrigger, extractCmd)
  .connect(extractCmd, routeCmd)
  .connect(routeCmd.onCase(0), sendWelcome)
  .connect(routeCmd.onCase(1), queryIdeas)
  .connect(queryIdeas, formatIdeas)
  .connect(formatIdeas, sendIdeas)
  .connect(routeCmd.onCase(2), triggerPublish)
  .connect(triggerPublish, sendPublishOk)
  .connect(routeCmd.onCase(3), sendGenerateOk)
  .connect(routeCmd.onCase(4), queryMetricas)
  .connect(queryMetricas, formatMetricas)
  .connect(formatMetricas, sendMetricas);
