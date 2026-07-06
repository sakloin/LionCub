// ============================================================
// metricas-collector-v2.js
// Métricas Collector SIN TikTok (Instagram + Facebook)
// Reemplaza el workflow 38kkLrKDISzmHMEU
// ============================================================

const SUPABASE_URL  = "{{ $env.SUPABASE_URL }}";
const IG_ACCOUNT_ID = "{{ $env.INSTAGRAM_BUSINESS_ACCOUNT_ID }}";
const FB_PAGE_ID    = "{{ $env.FACEBOOK_PAGE_ID }}";

const credSupabase = newCredential("credSupabase", "httpBearerAuth", {});
const credMeta     = newCredential("credMeta",     "httpBearerAuth", {});

// Corre cada 8 horas: 00:00, 08:00, 16:00 Lima (UTC-5 → 05, 13, 21 UTC)
const sched8h = trigger("sched8h", "@n8n/n8n-nodes-base.scheduleTrigger", {
  parameters: {
    rule: { interval: [{ field: "cronExpression", expression: "0 5,13,21 * * *" }] },
  },
});

// Trae posts publicados (genoma) solo de instagram y facebook
const getPosts = node("getPosts", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credSupabase },
  parameters: {
    method: "GET",
    url: `${SUPABASE_URL}/rest/v1/contenido_genoma?red=in.(instagram,facebook)&select=post_id,red,formato&order=fecha_publicacion.desc&limit=50`,
    headers: { apikey: expr("{{ $credentials.token }}") },
  },
});

const loopPosts = splitInBatches("loopPosts", { batchSize: 5 });

// Calcula snapshot según antigüedad del post
const calcSnapshot = node("calcSnapshot", "@n8n/n8n-nodes-base.code", {
  parameters: {
    jsCode: `
const posts = $input.all().map(i => i.json);
return posts.map(post => {
  const now = Date.now();
  const pubDate = post.fecha_publicacion ? new Date(post.fecha_publicacion).getTime() : now;
  const diffH = (now - pubDate) / 3600000;
  const snapshot = diffH < 30 ? "24h" : diffH < 200 ? "7d" : "30d";
  return { json: { ...post, snapshot } };
});
    `,
  },
});

// Router Instagram / Facebook (sin TikTok)
const switchRed = switchCase("switchRed", expr("{{ $json.red }}"), [
  { value: "instagram", label: "Instagram" },
  { value: "facebook",  label: "Facebook"  },
]);

// ── Instagram Insights ────────────────────────────────────────
const igInsights = node("igInsights", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credMeta },
  parameters: {
    method: "GET",
    url: expr(`https://graph.facebook.com/v21.0/{{ $json.post_id }}/insights?metric=impressions,reach,saved,shares,likes,comments&period=lifetime`),
  },
});

const parseIG = node("parseIG", "@n8n/n8n-nodes-base.code", {
  parameters: {
    jsCode: `
const data = $input.first().json?.data ?? [];
const post = $('calcSnapshot').first().json;
const get = (name) => data.find(d => d.name === name)?.values?.[0]?.value ?? 0;
return [{ json: {
  post_id:                post.post_id,
  red:                    "instagram",
  snapshot:               post.snapshot,
  views:                  get("impressions"),
  saves:                  get("saved"),
  shares:                 get("shares"),
  likes:                  get("likes"),
  comments:               get("comments"),
  metrica_primaria_valor: get("reach"),
  engagement_rate:        get("reach") > 0
    ? ((get("likes") + get("comments") + get("saves")) / get("reach") * 100).toFixed(4)
    : 0,
}}];
    `,
  },
});

// ── Facebook Insights ─────────────────────────────────────────
const fbInsights = node("fbInsights", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credMeta },
  parameters: {
    method: "GET",
    url: expr(`https://graph.facebook.com/v21.0/{{ $json.post_id }}/insights?metric=post_impressions,post_reactions_by_type_total,post_clicks&period=lifetime`),
  },
});

const parseFB = node("parseFB", "@n8n/n8n-nodes-base.code", {
  parameters: {
    jsCode: `
const data = $input.first().json?.data ?? [];
const post = $('calcSnapshot').first().json;
const get = (name) => data.find(d => d.name === name)?.values?.[0]?.value ?? 0;
const reactions = get("post_reactions_by_type_total");
const likes = typeof reactions === "object" ? Object.values(reactions).reduce((a,b) => a+b, 0) : 0;
const impressions = get("post_impressions");
return [{ json: {
  post_id:                post.post_id,
  red:                    "facebook",
  snapshot:               post.snapshot,
  views:                  impressions,
  likes,
  metrica_primaria_valor: impressions,
  engagement_rate:        impressions > 0 ? (likes / impressions * 100).toFixed(4) : 0,
}}];
    `,
  },
});

// ── Insert métricas (fan-in: IG y FB llegan aquí) ─────────────
const insertMetrics = node("insertMetrics", "@n8n/n8n-nodes-base.httpRequest", {
  credentials: { httpBearerAuth: credSupabase },
  parameters: {
    method: "POST",
    url: `${SUPABASE_URL}/rest/v1/contenido_metricas`,
    headers: {
      apikey: expr("{{ $credentials.token }}"),
      Prefer: "return=minimal",
      "Content-Type": "application/json",
    },
    body: expr(`{
      "post_id":                "{{ $json.post_id }}",
      "red":                    "{{ $json.red }}",
      "snapshot":               "{{ $json.snapshot }}",
      "views":                  {{ $json.views ?? 0 }},
      "saves":                  {{ $json.saves ?? 0 }},
      "shares":                 {{ $json.shares ?? 0 }},
      "likes":                  {{ $json.likes ?? 0 }},
      "comments":               {{ $json.comments ?? 0 }},
      "metrica_primaria_valor": {{ $json.metrica_primaria_valor ?? 0 }},
      "engagement_rate":        {{ $json.engagement_rate ?? 0 }}
    }`),
  },
});

// ── Conexiones ─────────────────────────────────────────────────
workflow("Métricas Collector LionCub v2")
  .connect(sched8h, getPosts)
  .connect(getPosts, loopPosts)
  .connect(loopPosts.onEachBatch(
    calcSnapshot,
    switchRed
      .onCase(0, igInsights, parseIG, insertMetrics)
      .onCase(1, fbInsights, parseFB, insertMetrics),
  ));
