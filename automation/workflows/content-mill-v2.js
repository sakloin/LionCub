// ============================================================
// content-mill-v2.js
// Content Mill SIN TikTok + notificaciones Telegram
// Reemplaza el workflow hnHKQwvGDftKuWQO
// ============================================================

const SUPABASE_URL     = "{{ $env.SUPABASE_URL }}";
const APP_URL          = "{{ $env.LIONCUB_APP_URL }}";
const IG_ACCOUNT_ID    = "{{ $env.INSTAGRAM_BUSINESS_ACCOUNT_ID }}";
const FB_PAGE_ID       = "{{ $env.FACEBOOK_PAGE_ID }}";
const ADMIN_CHAT_ID    = "7014852927";

const credSupabase  = newCredential("credSupabase",  "httpBearerAuth", {});
const credApp       = newCredential("credApp",       "httpBearerAuth", {});
const credAnthropic = newCredential("credAnthropic", "httpHeaderAuth", {});
const credMeta      = newCredential("credMeta",      "httpBearerAuth", {});
const credTelegram  = newCredential("credTelegram",  "telegramApi",    {});

// ═══════════════════════════════════════════════════════════
// FLUJO A — Generación de ideas (diario 9am Lima, lun-sáb)
// ═══════════════════════════════════════════════════════════
const schedTrigger = trigger("schedTrigger", "@n8n/n8n-nodes-base.scheduleTrigger", {
  parameters: {
    rule: { interval: [{ field: "cronExpression", expression: "0 14 * * 1-6" }] },
  },
});

const getProducts = node("getProducts", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credSupabase },
  parameters: {
    method: "GET",
    url: `${SUPABASE_URL}/rest/v1/products?select=id,name,description,category,price&is_active=eq.true&limit=20`,
    headers: { apikey: expr("{{ $credentials.token }}") },
  },
});

const loopProducts = splitInBatches("loopProducts", { batchSize: 3 });

const callAI = node("callAI", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpHeaderAuth: credAnthropic },
  parameters: {
    method: "POST",
    url: "https://api.anthropic.com/v1/messages",
    headers: { "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: expr(`{
      "model": "claude-haiku-4-5-20251001",
      "max_tokens": 1024,
      "messages": [{
        "role": "user",
        "content": "Eres un experto en marketing digital para marcas de ropa de bebés premium. Genera 3 ideas de contenido para Instagram y Facebook para estos productos: {{ JSON.stringify($json) }}. Responde SOLO con JSON: [{\"red_objetivo\":\"instagram\"|\"facebook\",\"tipo_pieza\":\"carrusel\"|\"historia\"|\"reel\"|\"post\",\"hook\":\"texto gancho\",\"idea_adaptacion\":\"descripción\",\"producto_categoria\":\"categoría\"}]"
      }]
    }`),
  },
});

const parseIdeas = node("parseIdeas", "@n8n/n8n-nodes-base.code", {
  parameters: {
    jsCode: `
const content = $input.first().json.content?.[0]?.text ?? "[]";
let ideas = [];
try {
  const match = content.match(/\\[.*\\]/s);
  ideas = JSON.parse(match ? match[0] : "[]");
} catch(e) { ideas = []; }
return ideas.map(idea => ({ json: {
  fuente: "ai",
  red_objetivo: idea.red_objetivo ?? "instagram",
  tipo_pieza: idea.tipo_pieza ?? "carrusel",
  formato: idea.tipo_pieza === "historia" ? "stories" : "feed",
  hook: idea.hook ?? "",
  idea_adaptacion: idea.idea_adaptacion ?? "",
  producto_categoria: idea.producto_categoria ?? "",
  estado: "nueva",
}}));
    `,
  },
});

const bulkInsertIdeas = node("bulkInsertIdeas", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credSupabase },
  parameters: {
    method: "POST",
    url: `${SUPABASE_URL}/rest/v1/contenido_ideas`,
    headers: {
      apikey: expr("{{ $credentials.token }}"),
      Prefer: "return=representation",
      "Content-Type": "application/json",
    },
    body: expr("{{ JSON.stringify($input.all().map(i => i.json)) }}"),
  },
});

// Notificación Telegram: nuevas ideas generadas
const notifyIdeas = node("notifyIdeas", "@n8n/n8n-nodes-base.telegram", {
  credentials: { telegramApi: credTelegram },
  parameters: {
    operation: "sendMessage",
    chatId: ADMIN_CHAT_ID,
    text: expr(`*Nuevas ideas generadas* 🦁\n\nSe crearon {{ $input.all().length }} ideas de contenido.\nUsa /ideas en el bot para verlas y aprobarlas.`),
    additionalFields: { parse_mode: "Markdown" },
  },
});

// ═══════════════════════════════════════════════════════════
// FLUJO B — Publicación via Webhook (Instagram + Facebook)
// ═══════════════════════════════════════════════════════════
const webhookTrigger = trigger("webhookTrigger", "@n8n/n8n-nodes-base.webhook", {
  parameters: {
    path: "content-mill-lioncub",
    httpMethod: "POST",
    responseMode: "lastNode",
  },
});

const getIdea = node("getIdea", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credSupabase },
  parameters: {
    method: "GET",
    url: expr(`${SUPABASE_URL}/rest/v1/contenido_ideas?id=eq.{{ $json.body.idea_id }}&limit=1`),
    headers: { apikey: expr("{{ $credentials.token }}") },
  },
});

const renderAsset = node("renderAsset", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credApp },
  parameters: {
    method: "POST",
    url: `${APP_URL}/api/asset/render`,
    headers: { "Content-Type": "application/json" },
    body: expr(`{
      "texto": "{{ $json[0].hook }}",
      "subtexto": "{{ $json[0].producto_categoria }}",
      "formato": "{{ $json[0].tipo_pieza === 'historia' ? 'historia' : 'carrusel' }}",
      "paleta": "dorado"
    }`),
  },
});

const saveAssetUrl = node("saveAssetUrl", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credSupabase },
  parameters: {
    method: "PATCH",
    url: expr(`${SUPABASE_URL}/rest/v1/contenido_ideas?id=eq.{{ $('webhookTrigger').first().json.body.idea_id }}`),
    headers: {
      apikey: expr("{{ $credentials.token }}"),
      Prefer: "return=representation",
      "Content-Type": "application/json",
    },
    body: expr(`{ "asset_url": "{{ $json.url }}" }`),
  },
});

// Switch: Instagram o Facebook (sin TikTok)
const routeRed = switchCase("routeRed", expr("{{ $('getIdea').first().json[0].red_objetivo }}"), [
  { value: "instagram", label: "Instagram" },
  { value: "facebook",  label: "Facebook"  },
]);

// ── Instagram ────────────────────────────────────────────────
const igCreateContainer = node("igCreateContainer", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credMeta },
  parameters: {
    method: "POST",
    url: expr(`https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media`),
    headers: { "Content-Type": "application/json" },
    body: expr(`{
      "image_url": "{{ $('saveAssetUrl').first().json[0].asset_url }}",
      "caption": "{{ $('getIdea').first().json[0].hook }}\\n\\n#lioncub #ropabebe #algodonpima #bebes #peru",
      "media_type": "IMAGE"
    }`),
  },
});

const igPublish = node("igPublish", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credMeta },
  parameters: {
    method: "POST",
    url: expr(`https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media_publish`),
    headers: { "Content-Type": "application/json" },
    body: expr(`{ "creation_id": "{{ $json.id }}" }`),
  },
});

const insertGenomaIG = node("insertGenomaIG", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credSupabase },
  parameters: {
    method: "POST",
    url: `${SUPABASE_URL}/rest/v1/contenido_genoma`,
    headers: {
      apikey: expr("{{ $credentials.token }}"),
      Prefer: "return=minimal",
      "Content-Type": "application/json",
    },
    body: expr(`{
      "post_id": "{{ $json.id }}",
      "red": "instagram",
      "formato": "{{ $('getIdea').first().json[0].tipo_pieza }}",
      "tipo_hook": "beneficio",
      "paleta": "dorado",
      "producto_categoria": "{{ $('getIdea').first().json[0].producto_categoria }}",
      "fecha_publicacion": "{{ new Date().toISOString().slice(0,10) }}"
    }`),
  },
});

// ── Facebook ─────────────────────────────────────────────────
const fbPublish = node("fbPublish", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credMeta },
  parameters: {
    method: "POST",
    url: expr(`https://graph.facebook.com/v21.0/${FB_PAGE_ID}/photos`),
    headers: { "Content-Type": "application/json" },
    body: expr(`{
      "url": "{{ $('saveAssetUrl').first().json[0].asset_url }}",
      "message": "{{ $('getIdea').first().json[0].hook }}\\n\\n#lioncub #ropabebe #algodonpima #bebes #peru"
    }`),
  },
});

const insertGenomaFB = node("insertGenomaFB", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credSupabase },
  parameters: {
    method: "POST",
    url: `${SUPABASE_URL}/rest/v1/contenido_genoma`,
    headers: {
      apikey: expr("{{ $credentials.token }}"),
      Prefer: "return=minimal",
      "Content-Type": "application/json",
    },
    body: expr(`{
      "post_id": "{{ $json.id }}",
      "red": "facebook",
      "formato": "{{ $('getIdea').first().json[0].tipo_pieza }}",
      "tipo_hook": "beneficio",
      "paleta": "dorado",
      "producto_categoria": "{{ $('getIdea').first().json[0].producto_categoria }}",
      "fecha_publicacion": "{{ new Date().toISOString().slice(0,10) }}"
    }`),
  },
});

const markPublished = node("markPublished", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credSupabase },
  parameters: {
    method: "PATCH",
    url: expr(`${SUPABASE_URL}/rest/v1/contenido_ideas?id=eq.{{ $('webhookTrigger').first().json.body.idea_id }}`),
    headers: {
      apikey: expr("{{ $credentials.token }}"),
      "Content-Type": "application/json",
    },
    body: `{ "estado": "publicada" }`,
  },
});

// Notificación Telegram: post publicado
const notifyPublished = node("notifyPublished", "@n8n/n8n-nodes-base.telegram", {
  credentials: { telegramApi: credTelegram },
  parameters: {
    operation: "sendMessage",
    chatId: ADMIN_CHAT_ID,
    text: expr(`*Post publicado* ✅\n\nRed: {{ $('getIdea').first().json[0].red_objetivo?.toUpperCase() }}\nHook: {{ $('getIdea').first().json[0].hook }}`),
    additionalFields: { parse_mode: "Markdown" },
  },
});

const respondWebhook = node("respondWebhook", "@n8n/n8n-nodes-base.respondToWebhook", {
  parameters: {
    respondWith: "json",
    responseBody: expr(`{ "ok": true, "idea_id": "{{ $('webhookTrigger').first().json.body.idea_id }}" }`),
  },
});

// ── Conexiones ────────────────────────────────────────────────
workflow("Content Mill LionCub v2")
  // Flujo A
  .connect(schedTrigger, getProducts)
  .connect(getProducts, loopProducts)
  .connect(loopProducts.onEachBatch(
    callAI, parseIdeas, bulkInsertIdeas, notifyIdeas
  ))
  // Flujo B
  .connect(webhookTrigger, getIdea)
  .connect(getIdea, renderAsset)
  .connect(renderAsset, saveAssetUrl)
  .connect(saveAssetUrl, routeRed)
  .connect(routeRed.onCase(0), igCreateContainer)
  .connect(igCreateContainer, igPublish)
  .connect(igPublish, insertGenomaIG)
  .connect(insertGenomaIG, markPublished)
  .connect(routeRed.onCase(1), fbPublish)
  .connect(fbPublish, insertGenomaFB)
  .connect(insertGenomaFB, markPublished)
  .connect(markPublished, notifyPublished)
  .connect(notifyPublished, respondWebhook);
