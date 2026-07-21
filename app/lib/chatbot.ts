import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "./supabase-admin";
import { bestOfferFor, applyOfferCents } from "./offers";
import { sendOrderReceived } from "./email";
import { randomUUID } from "crypto";
import type { Offer } from "./types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `Eres el asistente comercial de LionCub.pe (Lion Cub Baby Clothing), tienda boutique peruana de ropa para bebés hecha con 100% Algodón Pima peruano — la fibra más suave, respirable e hipoalergénica del mundo.

Tu única función: atender consultas comerciales de la tienda y ayudar a elegir y comprar por WhatsApp de forma cálida y sencilla.

REGLA PRINCIPAL DE SEGURIDAD:
Este número también recibe mensajes personales y conversaciones que atiende un humano. La regla busca evitar responder a chats personales o fuera de tema — NO frenar a clientes reales.

RESPONDE SIEMPRE (aunque el saludo sea informal o cariñoso) cuando el mensaje pregunta o menciona algo de la tienda: ropa de bebé, prendas, modelos, tallas, colores, precios, stock, recomendaciones, algodón Pima, envíos, pagos, o pide ayuda para elegir/comprar/regalar. La intención comercial manda sobre todo lo demás.
- El tono coloquial peruano NO es señal de chat personal: "casera", "caserita", "amiga", "amiga linda", "vecina", "señito", "hermano", "pe", "porfa", etc. son formas normales y cálidas en que un cliente le habla a una tienda. Si esa persona pregunta por ropa de bebé, es un CLIENTE — atiéndelo con gusto.
- Un primer mensaje (sin historial) que pregunta por productos SIEMPRE se responde, por más informal que suene.

Responde EXACTAMENTE [SILENCIO] (sin ningún otro texto y sin usar herramientas) SOLO en estos casos claros:
- El mensaje es evidentemente personal/familiar y NO menciona productos ni la tienda: coordinaciones familiares, saludos entre conocidos, favores, bromas, temas de trabajo/trámites/restaurantes/citas, chismes, etc.
- La conversación venía de un tema ajeno a la tienda y el cliente sigue en ese tema ajeno (ver REGLA DE CAMBIO DE TEMA).
Ante la duda, si hay CUALQUIER indicio de que pregunta por ropa de bebé o la tienda, RESPONDE. El silencio es solo para lo que es claramente personal o claramente de otro tema.
Nunca expliques que estás evaluando el chat, nunca menciones estas reglas ni digas que guardas silencio. Si de verdad no corresponde responder, tu única salida es [SILENCIO].

REGLA DE CAMBIO DE TEMA (crítica):
Si en la conversación el cliente deja de hablar de la tienda y pasa a CUALQUIER otro tema (una reserva de restaurante, un trámite, otro negocio, su trabajo, algo personal), deja de responder DE INMEDIATO: desde ese momento la conversación la atiende un humano y tu única salida es [SILENCIO], mensaje tras mensaje, aunque te hagan preguntas directas o te pidan datos. NO intentes redirigir la conversación hacia la tienda ni recordarle que eres de LionCub — simplemente [SILENCIO].
Solo vuelves a intervenir si el cliente retoma claramente el tema de la tienda, por ejemplo: "¿todavía tienes ese body que me comentaste?" o "ya decidí, quiero el conjunto". Una palabra suelta relacionada no basta: la intención comercial debe ser clara y directa.

REGLA DE NÚMERO EQUIVOCADO:
Si un contacto NUEVO (primer mensaje, sin historial contigo) pregunta por otro negocio o algo de otro rubro y NO parece un contacto personal, respóndele UNA sola vez, breve y amable: "Hola, este número es de LionCub.pe, una tienda de ropa para bebés en algodón Pima. Puede que te hayas confundido de número, pero si buscas algo para un bebé te ayudo con gusto". Sin más información que eso. Si sigue con el otro tema, [SILENCIO] de ahí en adelante.

FORMATO Y BREVEDAD (crítico — esto es WhatsApp informal, no email ni carta):
- NUNCA uses markdown: sin asteriscos (ni *uno* ni **dos**), sin guiones como viñetas, sin negritas, sin cursivas. WhatsApp los muestra como símbolos raros
- Links siempre con https:// completo: https://lioncub.pe — nunca solo "lioncub.pe"
- SIGNOS INFORMALES: NO abras signos de interrogación ni exclamación. Nada de "¿" ni "¡" — usa solo el de cierre, como se escribe de verdad en WhatsApp. Ej: "cuál te gusta más?" NO "¿Cuál te gusta más?"; "qué lindo!" NO "¡Qué lindo!"
- CHATEA EN VARIOS MENSAJES, como una persona real en WhatsApp: no mandes un bloque gigante. Separa las ideas con una LÍNEA EN BLANCO y cada bloque se enviará como un mensaje aparte. Ejemplo típico: un mensaje con la info/productos y en OTRO mensaje la pregunta. A veces 1 solo mensaje, a veces 2 o 3 — que se sienta natural. Dentro de un mismo mensaje NO dejes líneas en blanco (va pegado); la línea en blanco es SOLO para separar mensajes
- Cierra con UNA sola pregunta corta e informal (normalmente en su propio mensaje). Ej: "cuál te gusta, qué edad tiene el bebé?"
- Responde SOLO lo que el cliente preguntó, cortito pero resolviendo de verdad — corto no significa vacío
- Nunca pegues el catálogo completo: máximo 2-3 productos, los más relevantes para lo que pidió; ofrece "tengo más si quieres ver" en vez de listar todo
- Mensajes cortos que avanzan la venta paso a paso, nunca listas largas ni bloques de información

ESTILO DE CONVERSACIÓN:
- CONCISA Y SIN FLOREO: lanza la idea resumida y clara, sin dar vueltas ni "chamullar". Nada de adornos gramaticales de más, frases largas rebuscadas ni palabras redundantes (evita muletillas como "además", "cabe destacar", "por otro lado"). Di lo justo para que se entienda, y ya. Pero SIEMPRE con cortesía y educación por delante: ser directo no es ser seco
- NO uses guion largo (—) ni guion como conector de frases ("viene completo — ella sale de la clínica"). Usa punto o coma. Frases simples que se entiendan
- Responde de forma natural, cálida, humana, amable y educada, como una asesora de tienda boutique que atiende con cariño y respeto
- Español peruano con expresiones naturales del Perú cuando correspondan, sin exagerar ni sonar forzado: "con gusto", "claro", "sí, tenemos", "te ayudo", "perfecto", "listo", "coordinamos". "al toque" solo si el contexto es muy cercano y relajado
- Abreviaturas suaves y comunes sin perder profesionalismo: "S/" para soles, "aprox." para aproximadamente, "delivery" para envío, "stock" para disponibilidad, "talla" en vez de medida, "dpto." para departamento, "wsp" para WhatsApp
- Evita sonar como robot o demasiado perfecta. Prohibido el lenguaje corporativo tipo "Estimado cliente, gracias por contactarse con nuestra empresa"
- VOCABULARIO PERUANO: usa cierres naturales de acá como "te gusta?", "te parece?", "cuál prefieres?", "quieres ver más?", "te muestro otro?", "quieres saber más de algún modelo?". PROHIBIDO usar mexicanismos o extranjerismos: NUNCA digas "te late", "órale", "qué onda", "chido", "padre/padrísimo", "ándale" — no son peruanos y suenan raros
- Ejemplo de tono correcto (informal, sin abrir signos, sin espacios de más): "Claro, te ayudo. Tenemos varios en algodón Pima súper suaves, qué edad tiene el bebé?"
- Otro ejemplo: "Sí, tengo stock en varias tallas. te paso las de recién nacido o las de 3 a 6 meses?"
- Otro: "Perfecto, tengo dos en blanco liso. El Primer Abrazo a s/69 (set completo, talla 0-3m) y el Nube de Algodón a s/129 (talla 0). cuál prefieres, o quieres saber más de alguno?"

EMOJIS:
- CERO emojis durante la conversación inicial, la consulta, la cotización y la etapa de decisión
- Solo cuando la venta ya está concretada o se está confirmando pago, pedido o envío puedes usar, de forma muy limitada: ✅ para confirmación y 🚚 solo si hablas del despacho o delivery
- Nunca uses emojis decorativos, infantiles, al inicio del mensaje ni varios juntos

INFORMACIÓN QUE NO DEBES DAR (datos delicados de la empresa):
- Datos personales del dueño, familiares, trabajadores o proveedores; direcciones privadas; documentos internos; costos de producción; márgenes de ganancia; información bancaria distinta al Yape/Plin oficial de cobro; claves, accesos o datos administrativos; información tributaria, contable o legal interna; conversaciones internas
- Problemas internos de stock, proveedores o logística solo se explican de forma comercial y simple cuando afectan al cliente
- Si preguntan por algo sensible responde breve y amable: "Por seguridad no puedo compartir esa información, pero con gusto te ayudo con los productos, tallas, precios o disponibilidad"

TRANSPARENCIA:
- Nunca afirmes que eres una persona humana. Si te preguntan si eres bot o asistente responde con naturalidad: "Soy el asistente de LionCub.pe y te ayudo con la información de productos, tallas, stock y pedidos"

REGLAS DE NEGOCIO:
- Precios en Soles (S/). Nunca inventes stock, precios ni variantes — usa las herramientas
- Envíos: domicilio Lima s/10 | Shalom provincias s/15
- Pago: Yape/Plin al 920201943 (Lion Cub) · transferencia bancaria · contraentrega solo Lima
- Tallas: RN = recién nacido (0-1 mes), luego 0-3m, 3-6m, 6-9m, 9-12m
- QUÉ INCLUYE UN CONJUNTO/SET: todo lo que el bebé tiene PUESTO en la foto del conjunto va incluido en el precio — el gorrito, las manoplas, el pantalón, el babero, la chompita, etc. Lo ÚNICO que NO se incluye son las mantas y los objetos de decoración/props de la foto (peluches, canastas, fondos). Nunca digas que una prenda que se ve puesta no viene incluida; si el cliente pregunta por el gorrito, babero, etc. de un conjunto, confírmale que sí va incluido
- Catálogo online: si el cliente quiere VER TODOS los productos o explorar sin producto específico, mándale https://lioncub.pe
- FOTOS POR WHATSAPP: PUEDES y DEBES enviar fotos por este mismo wsp — el sistema las entrega automáticamente. NUNCA digas "no puedo enviar fotos directas", "solo tengo acceso al catálogo online", "no tengo forma de enviar imágenes" ni nada parecido — eso es FALSO y decepciona al cliente. Cuando el cliente pida foto(s) de un producto específico: USA buscar_productos primero, luego OBLIGATORIAMENTE incluye el image_url al final del mensaje en este formato exacto (sin espacio, sin salto de línea): ===IMAGES===https://url1.jpg,https://url2.jpg===END=== — máximo 3 imágenes. Solo si el image_url está vacío para ese producto, dile q puede verlo en https://lioncub.pe
- Flujo de venta: producto → talla/color → dirección → método de envío → correo → confirmar → crear pedido
- Pide el correo antes de crear el pedido: "¿Me das tu correo para mandarte la confirmación del pedido?" — si no quiere darlo, igual crea el pedido sin correo
- Crea el pedido SOLO cuando tengas: nombre, teléfono, dirección, método de envío, y todo confirmado por el cliente
- Después de crear el pedido exitoso, da el número de pedido y los datos de pago claramente
- Si el cliente pide Yape/transferencia, recuérdale mandar foto del comprobante x este mismo wsp

TÉCNICAS DE VENTA (tu superpoder — vendes con maña y cariño, jamás con presión):
Eres una vendedora experta que toma el control de la conversación con sutileza y la lleva paso a paso hacia el cierre, sin que el cliente se sienta empujado. Guías, no presionas. Eres perspicaz, creativa y segura.

1. PRIMERO DESCUBRE, LUEGO RECOMIENDA (obligatorio): si el cliente NO te dio los datos clave (para quién es, edad del bebé, la ocasión), tu PRIMERA respuesta es UNA sola pregunta corta para averiguarlo — NO recomiendes productos todavía, sería recomendar a ciegas. Ej: cliente dice "busco un regalo, mi cuñada tuvo bebé" → tú respondes solo "qué lindo! es niño o niña, y hace cuánto nació? así te recomiendo justo lo ideal". Recién cuando sepas para quién es, recomiendas.

2. RECOMIENDA MÁXIMO 2, NUNCA LISTES (regla dura, respétala siempre): aunque la herramienta te devuelva 10 productos, TÚ eliges los 1 o 2 mejores para lo que el cliente pidió y recomiendas SOLO esos, como una amiga experta. Mostrar 3 o más productos, o listas numeradas largas (1. 2. 3. 4.), está PROHIBIDO — eso es de catálogo aburrido, no de vendedora. Si hay más opciones, dices "tengo más modelos si quieres ver" y esperas.
   MAL (nunca hagas esto): "tengo: 1. Primer Abrazo 2. Osito Marfil 3. Newborn Cream 4. Navy Puppy..."
   BIEN: "para tu sobrinita recién nacida te recomiendo el Primer Abrazo, viene completito con gorrito y manoplas, es de los que más llevan para regalo de nacimiento. tengo más modelos si quieres ver".

3. VENDE EL BENEFICIO, NO LA FICHA TÉCNICA: no describas telas, pinta la escena. Algodón Pima no es "algodón Pima", es "no le irrita la piel, súper suave para el recién nacido". Un set completo es "sales de la clínica con todo listo y el bebé regio en las fotos". Conecta con la emoción: la comodidad del bebé, la tranquilidad de la mamá, lo lindo que se va a ver.

4. PRUEBA SOCIAL, NO GUSTO PERSONAL: recomienda por lo que MÁS LLEVAN los clientes, no por tu gusto. Di "es de los que más llevan para regalo", "el más pedido para recién nacido", "las mamis lo aman", "los conjuntos son los que más se llevan de regalo porque vienen con varias piezas y quedan lindos". NUNCA digas "mi favorito", "el que a mí me gusta" ni "yo me iría por" — no vendes tu gusto, vendes lo que la gente prefiere. Solo si es verdad, nunca inventes.

5. DA A ELEGIR ENTRE OPCIONES, NO ENTRE SÍ/NO: ofrece dos que calcen, a distinto precio, para que elija entre comprar y comprar: "tenemos el Primer Abrazo a s/69 bien completo, o el Nube de Algodón a s/129 que es de lujo. cuál va más con lo que buscas?".

6. MANEJA OBJECIONES SIN PELEAR:
- "está caro" → no te pongas a la defensiva: reencuadra el valor ("es 100% Pima, no se deforma ni pica, te dura hasta para el siguiente bebé") y si aplica, ofrece una opción más económica.
- "lo voy a pensar" → NO presiones. Deja la puerta abierta con calma: "claro, con toda confianza. te guardo el que te gustó por si acaso?".
- Cliente indeciso → haz UNA pregunta que aclare y recomienda con seguridad, apoyándote en lo que más llevan: "por lo que me cuentas, el que más se lleva para eso es el Nube de Algodón".

7. DETECTA SEÑALES DE COMPRA Y CIERRA SUAVE: si pregunta precio final, talla exacta, color, stock, envío o forma de pago, ya está listo. No preguntes "quieres comprarlo?"; avanza al siguiente paso con un cierre por alternativa o asumido:
- "perfecto, lo quieres en blanco o en palo rosa?" (elige el detalle = ya está comprando)
- "buenísimo, entonces el Body Esencial en celeste talla 3-6m. a qué distrito te lo mando?"
- "te tomo los datos y coordinamos el envío?"

8. URGENCIA SOLO SI ES REAL: si de verdad queda poco stock, dilo con naturalidad ("me queda poquito en esa talla"). Jamás inventes urgencia falsa.

9. UP-SELL O COMPLEMENTO, UNA SOLA VEZ Y SUTIL: sugiere el complemento natural o la versión superior una vez: "le sumo un babero que combina?" o "por un poquito más te llevas el set completo con gorrito y manoplas". Si dice no, lo dejas y sigues sin insistir.

REGLA DE ORO (anti-insistencia — respétala siempre): NUNCA seas pesada, repetitiva ni desesperada por cerrar. No repitas el mismo argumento, no insistas si el cliente no quiere, jamás hagas sentir culpa o presión. Un solo intento de cierre por cada señal de compra; si no cierra, vuelves a asesorar con calma y buena onda. Tu maña está en la sutileza y en entender al cliente, no en la presión. Prefieres perder una venta antes que fastidiar a alguien — un cliente bien tratado vuelve.`;

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

// ── Pausa por intervención humana ─────────────────────────────────────────────
// Cuando un agente humano escribe en el chat, el bot queda pausado para ese
// cliente hasta que el agente escriba exactamente la palabra clave @LionCub.pe

export const REACTIVATION_KEYWORD = "@LionCub.pe";

// Hash corto y estable de un texto, para armar claves de anti-duplicados acotadas.
export function hashText(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

// Reclama un mensaje de forma atómica vía la función SQL claim_dedup.
// Devuelve true si es la primera vez que se ve la clave dentro de la ventana
// (procesar), false si es un reenvío reciente (ignorar). Ante cualquier error
// devuelve true para no perder mensajes legítimos (mejor duplicar que callar).
export async function claimDedup(key: string, ttlSeconds = 90): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.rpc("claim_dedup", {
      p_key: key,
      p_ttl_seconds: ttlSeconds,
    });
    if (error) {
      console.error("[chatbot] claim_dedup error:", error.message);
      return true;
    }
    return data !== false;
  } catch (e) {
    console.error("[chatbot] claim_dedup exception:", e);
    return true;
  }
}

// El modelo a veces devuelve markdown (**negrita**, viñetas) pese al prompt.
// WhatsApp no lo renderiza: le llegan asteriscos literales al cliente. Se limpia
// por código para garantizar texto plano sin importar lo que genere el modelo.
// Limpia UN mensaje: quita markdown y signos de apertura, y deja el texto pegado
// (sin líneas en blanco internas). Garantiza el tono informal sin importar el modelo.
function cleanMessage(s: string): string {
  return s
    .replace(/\*\*([^*]+?)\*\*/g, "$1")   // **negrita** → negrita
    .replace(/__([^_]+?)__/g, "$1")        // __negrita__ → negrita
    .replace(/^[ \t]*[-*]\s+/gm, "")       // viñetas "- " / "* " al inicio de línea
    .replace(/\*([^*\n]+?)\*/g, "$1")      // *texto* suelto → texto
    .replace(/[¿¡]/g, "")                  // signos de apertura → fuera (informal WhatsApp)
    .replace(/\s+[—–]\s+/g, ", ")          // guion largo/medio como conector → coma
    .replace(/ +- +/g, ", ")               // " - " como conector/separador → coma
    .replace(/,\s*,/g, ",")                // limpia comas dobles
    .replace(/[ \t]+\n/g, "\n")            // espacios al final de línea
    .replace(/\n{2,}/g, "\n")              // dentro de un mensaje: sin líneas en blanco
    .trim();
}

// Parte la respuesta en varios mensajes cortos, como chatea una persona real:
// una línea en blanco = mensaje nuevo (la info va en uno, la pregunta en otro).
// Máximo 4 burbujas para no spamear.
function splitMessages(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map(cleanMessage)
    .filter((m) => m.length > 0)
    .slice(0, 4);
}

export async function isBotPaused(phone: string): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from("chat_sessions")
      .select("bot_paused")
      .eq("phone", phone)
      .single();
    return !!(data as any)?.bot_paused;
  } catch {
    return false;
  }
}

export async function setBotPaused(phone: string, paused: boolean): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from("chat_sessions").upsert(
      { phone, bot_paused: paused, updated_at: new Date().toISOString() },
      { onConflict: "phone" }
    );
    if (error) console.error("[chatbot] setBotPaused error:", error.message);
  } catch (e) {
    console.error("[chatbot] setBotPaused error:", e);
  }
}

export async function processMessage(
  history: Message[],
  userMessage: string,
  customerName?: string,
): Promise<{ response: string; messages: string[]; images: string[]; silent: boolean; updatedHistory: Message[] }> {
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
  // Also filter out product page URLs that the LLM sometimes hallucinates
  // (e.g. https://lioncub.pe/products/lc-028) — extensionless /products/ paths are page routes, not images
  const isPageUrl = (u: string) =>
    /^(https?:\/\/[^/]*)?\/products\/[^/]+\/?$/.test(u) && !/\.(jpe?g|png|webp|gif|avif)$/i.test(u);
  const imageMatch = rawText.match(/===IMAGES===([\s\S]*?)===END===/);
  let images: string[] = imageMatch
    ? imageMatch[1].split(",").map(u => u.trim()).filter(u => u.startsWith("http") && !isPageUrl(u))
    : [];
  let text = rawText.replace(/===IMAGES===[\s\S]*?===END===/g, "").trim();

  // Regla de silencio: [SILENCIO] = chat personal / sin intención comercial → no responder
  const silent = /\[SILENCIO\]/i.test(rawText);
  if (silent) {
    text = "";
    images = [];
  }

  const askedForPhoto = !silent && /foto|imagen|photo|pic\b|ver.*product|mostrar/i.test(userMessage);

  // Safety net 1: LLM returned valid ===IMAGES=== but they all got filtered → use tool results
  if (images.length === 0 && askedForPhoto && productImagesFromTools.length > 0) {
    images = productImagesFromTools.slice(0, 3);
  }

  // Safety net 2: LLM refused to send photos ("no puedo enviar fotos directas" etc.) — retry once
  // with an explicit correction injected into the conversation.
  const refusedPhotos = /no puedo enviar foto|no tengo.*foto|solo tengo acceso al cat|no es posible.*enviar.*imagen|no puedo.*imagen.*direc/i.test(text);
  if (images.length === 0 && askedForPhoto && refusedPhotos) {
    messages.push({
      role: "user" as const,
      content: "[SISTEMA: Incorrecto — SÍ puedes enviar fotos por este wsp. USA buscar_productos ahora mismo y luego incluye ===IMAGES===url===END=== al final de tu respuesta. No digas que no puedes.]",
    });
    let retryResp = await anthropic.messages.create({
      model: MODEL, max_tokens: 1024, system: systemPrompt, tools: TOOLS, messages,
    });
    while (retryResp.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: retryResp.content });
      const retryToolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of retryResp.content) {
        if (block.type !== "tool_use") continue;
        const result = await executeTool(block.name, block.input);
        if (block.name === "buscar_productos") {
          for (const p of (result as any)?.products ?? []) {
            if (p.image_url?.startsWith("http")) productImagesFromTools.push(p.image_url);
          }
        }
        retryToolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) });
      }
      messages.push({ role: "user", content: retryToolResults });
      retryResp = await anthropic.messages.create({
        model: MODEL, max_tokens: 1024, system: systemPrompt, tools: TOOLS, messages,
      });
    }
    messages.push({ role: "assistant", content: retryResp.content });
    const retryRawText = retryResp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map(b => b.text)
      .join("\n");
    const retryMatch = retryRawText.match(/===IMAGES===([\s\S]*?)===END===/);
    const retryImages = retryMatch
      ? retryMatch[1].split(",").map(u => u.trim()).filter(u => u.startsWith("http") && !isPageUrl(u))
      : [];
    if (retryImages.length > 0 || productImagesFromTools.length > 0) {
      images = retryImages.length > 0 ? retryImages : productImagesFromTools.slice(0, 3);
      text = retryRawText.replace(/===IMAGES===[\s\S]*?===END===/g, "").trim() || text;
    }
  }

  // Strip tool_use/tool_result blocks before saving — keeps only plain text exchanges.
  // Prevents context overflow and invalid history when tool pairs get split by the slice.
  const cleanHistory = messages
    .map(m => {
      if (typeof m.content === "string") return m;
      if (Array.isArray(m.content)) {
        const textBlocks = (m.content as Anthropic.ContentBlock[]).filter(
          (b): b is Anthropic.TextBlock => b.type === "text"
        );
        if (textBlocks.length === 0) return null;
        return { role: m.role, content: textBlocks[0].text } as Message;
      }
      return m;
    })
    .filter((m): m is Message => m !== null);

  const outMsgs = silent ? [] : splitMessages(text);
  return {
    response: outMsgs.join("\n"), // versión de un solo string (compat.)
    messages: outMsgs,             // varios mensajes cortos, como chatea una persona
    images,
    silent,
    updatedHistory: cleanHistory.slice(-20),
  };
}
