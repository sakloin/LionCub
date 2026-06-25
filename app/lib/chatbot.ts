import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "./supabase-admin";
import { bestOfferFor, applyOfferCents } from "./offers";
import { sendOrderReceived } from "./email";
import { randomUUID } from "crypto";
import type { Offer } from "./types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `Eres el asistente de ventas de Lion Cub Baby Clothing, tienda peruana de ropa para bebés hecha con 100% Algodón Pima peruano — la fibra más suave, respirable e hipoalergénica del mundo.

Tu misión: ayudar a los clientes a elegir y comprar por WhatsApp de forma cálida y sencilla.

FORMATO (crítico — esto es WhatsApp, no email):
- NUNCA uses markdown: sin asteriscos, sin guiones como viñetas, sin negritas, sin cursivas. WhatsApp no los renderiza y aparecen como símbolos raros
- Links siempre con https:// completo: https://lioncub.pe — nunca solo "lioncub.pe" ni "**lioncub.pe**"
- Sin signos de puntuación innecesarios. Sin comas formales. Sin puntos al final de frase corta
- Mensajes cortos y directos — máximo 3-4 líneas x mensaje, nunca párrafos largos

EMOJIS:
- Durante la conversación de captación y consulta: CERO emojis. Habla como una persona normal
- Solo usa 1-2 emojis en estos momentos específicos: al confirmar que el pedido fue creado exitosamente, y al despedirte después de cerrar la venta
- Nunca pongas emojis al inicio de un mensaje ni como decoración

ESTILO DE ESCRITURA:
- Escribe como un peruano joven en WhatsApp: informal, directo, sin ser grosero
- Abrevia como en chats reales: "q" en vez de "que", "tb" en vez de "también", "xq" en vez de "porque", "pa" en vez de "para", "wsp" en vez de "WhatsApp", "x" en vez de "por", "s/" en vez de "soles"
- NUNCA uses lenguaje corporativo ni frases como "con gusto", "por supuesto", "claro que sí", "¡Hola!" con exclamación, "¡Perfecto!", "¡Excelente!"
- Ejemplos de tono correcto: "hola q tal", "claro déjame revisar", "eso te sale en s/45", "te lo mando x Shalom si estás en provincia"

REGLAS DE NEGOCIO:
- Precios en Soles (S/). Nunca inventes stock, precios ni variantes — usa las herramientas
- Envíos: domicilio Lima s/10 | Shalom provincias s/15
- Pago: Yape/Plin al 920201943 (Lion Cub) · transferencia bancaria · contraentrega solo Lima
- Tallas: RN = recién nacido (0-1 mes), luego 0-3m, 3-6m, 6-9m, 9-12m
- Catálogo online: si el cliente quiere VER TODOS los productos o explorar sin producto específico, mándale https://lioncub.pe
- Imágenes individuales: cuando el cliente pida foto(s) de un producto específico, SIEMPRE usa la herramienta buscar_productos primero, luego OBLIGATORIAMENTE incluye el image_url del producto al final del mensaje en este formato exacto (sin espacio, sin salto de línea): ===IMAGES===https://url1.jpg,https://url2.jpg===END=== — máximo 3 imágenes. Si el image_url está vacío, dile que puede verlo en https://lioncub.pe. NUNCA mandes solo el link del catálogo cuando el cliente pide foto de un producto específico
- Flujo de venta: producto → talla/color → dirección → método de envío → correo → confirmar → crear pedido
- Pide el correo antes de crear el pedido: "oye me das tu correo pa mandarte la confirmación" — si no quiere darlo, igual crea el pedido sin correo
- Crea el pedido SOLO cuando tengas: nombre, teléfono, dirección, método de envío, y todo confirmado x el cliente
- Después de crear el pedido exitoso, da el número de pedido y los datos de pago claramente
- Si el cliente pide Yape/transferencia, recuérdale mandar foto del comprobante x este mismo wsp`;

type Message = Anthropic.MessageParam;

// ── Tool handlers ─────────────────────────────────────────────────────────────

async function fetchActiveOffers(): Promise<Offer[]> {
  const { data } = await supabaseAdmin.from("offers").select("*").eq("active", true);
  return (data ?? []) as Offer[];
}

async function handleBuscarProductos(categoria?: string) {
  let query = supabaseAdmin
    .from("products")
    .select(`
      id, name, category, price, description, image_url,
      product_variants(
        id, stock, price_override, active,
        product_sizes(name),
        product_colors(name)
      ),
      product_images(url, is_primary, sort_order)
    `)
    .eq("active", true)
    .order("category");

  if (categoria) query = (query as any).eq("category", categoria);

  const { data, error } = await query;
  if (error) return { error: "No se pudieron cargar los productos" };

  const offers = await fetchActiveOffers();

  const products = (data ?? [])
    .map((p: any) => {
      const variants = (p.product_variants ?? [])
        .filter((v: any) => v.active && (v.stock ?? 0) > 0)
        .map((v: any) => {
          const baseCents = Math.round((v.price_override ?? p.price) * 100);
          const offer = bestOfferFor({ id: p.id, category: p.category }, offers);
          const priceCents = applyOfferCents(baseCents, offer);
          return {
            variant_id: v.id,
            size: v.product_sizes?.name ?? "Único",
            color: v.product_colors?.name ?? "Único",
            stock: v.stock,
            price: priceCents / 100,
          };
        });
      // Image: prefer product_images (gallery) primary → first gallery → products.image_url → public folder fallback
      const gallery: any[] = p.product_images ?? [];
      const galleryPrimary = gallery.find((i: any) => i.is_primary)?.url ?? gallery.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.url ?? "";
      const rawImg = galleryPrimary || p.image_url || "";
      // /products/LC-xxx is a Next.js page route; /products/LC-xxx.jpeg is a valid static image
      const isProductPage = /^(https?:\/\/[^/]*)?\/products\/[^/]+\/?$/.test(rawImg) && !/\.(jpe?g|png|webp|gif|avif)$/i.test(rawImg);
      const imageUrl = isProductPage
        ? ""
        : rawImg.startsWith("http")
          ? rawImg
          : rawImg.startsWith("/")
            ? `https://lioncub.pe${rawImg}`
            : "";
      return { id: p.id, name: p.name, category: p.category, base_price: p.price, description: p.description ?? "", image_url: imageUrl, variants };
    })
    .filter((p: any) => p.variants.length > 0);

  return { products };
}

async function handleCrearPedido(input: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  address?: string;
  district?: string;
  city?: string;
  shipping_method: "domicilio" | "shalom";
  shalom_agency?: string;
  items: Array<{ variant_id: string; quantity: number }>;
  payment_method: "transferencia" | "contraentrega";
  notes?: string;
}) {
  const SHIPPING_CENTS: Record<string, number> = { domicilio: 1000, shalom: 1500 };
  const variantIds = input.items.map(i => i.variant_id);

  const { data: variantsRaw, error: vErr } = await supabaseAdmin
    .from("product_variants")
    .select(`
      id, product_id, stock, cost, price_override, active,
      product_sizes(name), product_colors(name)
    `)
    .in("id", variantIds);

  if (vErr) return { error: "Error al verificar variantes" };

  const variantMap = new Map((variantsRaw ?? []).map((v: any) => [v.id, v]));
  const productIds = [...new Set((variantsRaw ?? []).map((v: any) => v.product_id as string))];

  const { data: productsRaw, error: pErr } = await supabaseAdmin
    .from("products")
    .select("id, name, category, price, cost, active")
    .in("id", productIds);

  if (pErr) return { error: "Error al verificar productos" };
  const productMap = new Map((productsRaw ?? []).map((p: any) => [p.id, p]));

  // Validate stock
  for (const item of input.items) {
    const v = variantMap.get(item.variant_id) as any;
    if (!v?.active) return { error: "Una variante no está disponible" };
    const p = productMap.get(v.product_id) as any;
    if (!p?.active) return { error: `Producto ${p?.name ?? item.variant_id} no disponible` };
    if ((v.stock ?? 0) < item.quantity) return { error: `Sin stock suficiente para ${p.name}` };
  }

  // Price calculation with offers
  const offers = await fetchActiveOffers();
  let subtotalCents = 0;
  const orderItemRows = input.items.map(item => {
    const v = variantMap.get(item.variant_id) as any;
    const p = productMap.get(v.product_id) as any;
    const baseCents = Math.round((v.price_override ?? p.price) * 100);
    const offer = bestOfferFor({ id: p.id, category: p.category }, offers);
    const unitPriceCents = applyOfferCents(baseCents, offer);
    subtotalCents += unitPriceCents * item.quantity;
    return {
      product_id: p.id,
      variant_id: v.id,
      product_name: p.name,
      product_sku: p.id,
      selected_size: (v.product_sizes as any)?.name ?? null,
      selected_color: (v.product_colors as any)?.name ?? null,
      quantity: item.quantity,
      unit_price: unitPriceCents / 100,
      unit_cost: v.cost ?? p.cost ?? 0,
      subtotal: (unitPriceCents * item.quantity) / 100,
    };
  });

  const shippingCents = SHIPPING_CENTS[input.shipping_method] ?? 1000;
  const totalCents = subtotalCents + shippingCents;

  // Atomic stock reservation
  const reserved: { id: string; qty: number }[] = [];
  for (const item of input.items) {
    const { data: newStock, error: rpcErr } = await supabaseAdmin.rpc("adjust_variant_stock", {
      p_variant_id: item.variant_id,
      p_qty_change: -item.quantity,
    });
    if (rpcErr || newStock === null || newStock < 0) {
      for (const r of reserved) {
        await supabaseAdmin.rpc("adjust_variant_stock", { p_variant_id: r.id, p_qty_change: r.qty });
      }
      return { error: "Sin stock al momento de reservar, intenta de nuevo" };
    }
    reserved.push({ id: item.variant_id, qty: item.quantity });
  }

  // Insert order
  const orderId = randomUUID();
  const { error: orderError } = await supabaseAdmin.from("orders").insert({
    id: orderId,
    customer_name: input.customer_name,
    customer_phone: input.customer_phone,
    customer_email: input.customer_email ?? "",
    address: input.address ?? "",
    district: input.district ?? "",
    city: input.city ?? "Lima",
    shipping_method: input.shipping_method,
    shalom_agency: input.shalom_agency ?? null,
    shipping_cost: shippingCents / 100,
    subtotal: subtotalCents / 100,
    total: totalCents / 100,
    payment_method: input.payment_method,
    payment_status: "pendiente",
    order_status: "nuevo",
    notes: `${input.notes ?? ""} [WhatsApp bot]`.trim(),
  });

  if (orderError) {
    for (const r of reserved) {
      await supabaseAdmin.rpc("adjust_variant_stock", { p_variant_id: r.id, p_qty_change: r.qty });
    }
    return { error: orderError.message };
  }

  await supabaseAdmin.from("order_items").insert(
    orderItemRows.map(r => ({ ...r, order_id: orderId }))
  );

  // Create Supabase auth account + magic link (best-effort)
  let magicLink: string | undefined;
  if (input.customer_email) {
    const phone = input.customer_phone.replace(/\D/g, "");
    const e164 = phone.startsWith("51") ? `+${phone}` : `+51${phone}`;
    await supabaseAdmin.auth.admin.createUser({
      email: input.customer_email,
      phone: e164,
      email_confirm: true,
      user_metadata: { full_name: input.customer_name },
    }).catch(e => console.error("[chatbot] auth user error:", e));
    const _site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const siteUrl = (_site && !_site.includes("vercel.app")) ? _site : "https://lioncub.pe";
    const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: input.customer_email,
      options: { redirectTo: `${siteUrl}/mi-cuenta/pedidos` },
    }).catch(e => { console.error("[chatbot] magic link error:", e); return { data: null }; });
    magicLink = (linkData as any)?.properties?.action_link ?? undefined;
  }

  // Send order confirmation email (best-effort)
  sendOrderReceived(
    {
      id: orderId,
      customer_name: input.customer_name,
      customer_email: input.customer_email ?? null,
      customer_phone: input.customer_phone,
      address: input.address ?? null,
      district: input.district ?? null,
      city: input.city ?? "Lima",
      shipping_method: input.shipping_method,
      shalom_agency: input.shalom_agency ?? null,
      shipping_cost: shippingCents / 100,
      subtotal: subtotalCents / 100,
      total: totalCents / 100,
      payment_method: input.payment_method,
      payment_status: "pendiente",
      notes: input.notes ?? null,
      delivery_date: null,
      delivery_time_slot: null,
      created_at: new Date().toISOString(),
    },
    orderItemRows.map(r => ({
      product_name: r.product_name,
      selected_size: r.selected_size,
      selected_color: r.selected_color,
      quantity: r.quantity,
      unit_price: r.unit_price,
      subtotal: r.subtotal,
    })),
    magicLink,
  ).catch(e => console.error("[chatbot] email error:", e));

  return {
    success: true,
    order_id: orderId.slice(0, 8).toUpperCase(),
    subtotal: subtotalCents / 100,
    shipping_cost: shippingCents / 100,
    total: totalCents / 100,
    payment_method: input.payment_method,
  };
}

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: "buscar_productos",
    description:
      "Lista los productos disponibles con stock real, tallas, colores y precios (ya con descuentos aplicados). " +
      "Cada variante devuelve su variant_id exacto. Úsalo cuando el cliente quiera ver opciones o preguntar disponibilidad.",
    input_schema: {
      type: "object" as const,
      properties: {
        categoria: {
          type: "string",
          enum: ["conjuntos", "bodies", "baberos", "mantas", "pantalones"],
          description: "Filtrar por categoría. Omitir para ver todo el catálogo.",
        },
      },
    },
  },
  {
    name: "crear_pedido",
    description:
      "Crea el pedido en el sistema y reserva el stock. " +
      "Llama SOLO cuando tengas confirmados: nombre, teléfono, dirección, método de envío y los variant_id elegidos.",
    input_schema: {
      type: "object" as const,
      properties: {
        customer_name: { type: "string" },
        customer_phone: { type: "string" },
        customer_email: { type: "string", description: "Correo del cliente para enviar confirmación y acceso a su cuenta. Opcional pero pedirlo siempre." },
        address: { type: "string", description: "Dirección completa de entrega" },
        district: { type: "string", description: "Distrito (Lima) o ciudad (provincias)" },
        city: { type: "string", description: "Ciudad, por defecto Lima" },
        shipping_method: {
          type: "string",
          enum: ["domicilio", "shalom"],
          description: "domicilio = Lima S/10 | shalom = provincias S/15",
        },
        shalom_agency: {
          type: "string",
          description: "Agencia Shalom más cercana (solo si shipping_method = shalom)",
        },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              variant_id: { type: "string", description: "ID de variante obtenido de buscar_productos" },
              quantity: { type: "integer", minimum: 1 },
            },
            required: ["variant_id", "quantity"],
          },
        },
        payment_method: {
          type: "string",
          enum: ["transferencia", "contraentrega"],
          description: "transferencia = Yape/Plin/banco | contraentrega = solo Lima",
        },
        notes: { type: "string" },
      },
      required: ["customer_name", "customer_phone", "items", "shipping_method", "payment_method"],
    },
  },
];

async function executeTool(name: string, input: any) {
  if (name === "buscar_productos") return handleBuscarProductos(input.categoria);
  if (name === "crear_pedido") return handleCrearPedido(input);
  return { error: `Tool desconocida: ${name}` };
}

// ── Main entry point ──────────────────────────────────────────────────────────

export async function processMessage(
  history: Message[],
  userMessage: string,
  customerName?: string,
): Promise<{ response: string; images: string[]; updatedHistory: Message[] }> {
  const systemPrompt = customerName
    ? `${SYSTEM_PROMPT}\n\nNombre del cliente en WhatsApp: ${customerName}. Úsalo para saludarlo en el primer mensaje de cada conversación.`
    : SYSTEM_PROMPT;

  const messages: Message[] = [...history, { role: "user", content: userMessage }];

  let response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    tools: TOOLS,
    messages,
  });

  // Tool-use loop — collect product image URLs from buscar_productos results
  const productImagesFromTools: string[] = [];

  while (response.stop_reason === "tool_use") {
    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      const result = await executeTool(block.name, block.input);

      // Capture image URLs from buscar_productos so we can inject them
      // even if the LLM forgets to include them in its final response.
      if (block.name === "buscar_productos") {
        const r = result as any;
        for (const p of r?.products ?? []) {
          if (p.image_url && p.image_url.startsWith("http")) {
            productImagesFromTools.push(p.image_url);
          }
        }
      }

      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) });
    }

    messages.push({ role: "user", content: toolResults });
    response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      tools: TOOLS,
      messages,
    });
  }

  messages.push({ role: "assistant", content: response.content });

  const rawText = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map(b => b.text)
    .join("\n");

  // Extract image URLs from ===IMAGES===url1,url2===END=== marker
  const imageMatch = rawText.match(/===IMAGES===([\s\S]*?)===END===/);
  let images: string[] = imageMatch
    ? imageMatch[1].split(",").map(u => u.trim()).filter(u => u.startsWith("http"))
    : [];
  const text = rawText.replace(/===IMAGES===[\s\S]*?===END===/g, "").trim();

  // Safety net: if the user asked for a photo and the LLM didn't include images
  // but buscar_productos returned products with images, inject them automatically.
  const askedForPhoto = /foto|imagen|imagen|photo|pic\b|ver.*product|mostrar/i.test(userMessage);
  if (images.length === 0 && askedForPhoto && productImagesFromTools.length > 0) {
    images = productImagesFromTools.slice(0, 3);
  }

  // Keep last 30 messages to avoid token overflow over long conversations
  return { response: text, images, updatedHistory: messages.slice(-30) };
}
