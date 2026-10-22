// ─── Libro de Reclamaciones: utilidades SOLO de servidor ────────────────────
// Antispam (B1 de la revisión): token de carga firmado (mínimo 3 s entre que
// se abre el formulario y se envía) y hash de la IP con sal de servidor para
// limitar envíos por hora. La IP nunca se guarda en claro.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ESPERA_MINIMA_MS = 3_000;
export const VIGENCIA_TOKEN_MS = 24 * 60 * 60 * 1000;
export const LIMITE_POR_HORA = 3;

// Sal/clave de servidor. RECLAMOS_SAL si existe; si no, se deriva de la llave
// de servicio (ya es secreta y solo vive en el servidor). Sin ninguna, una sal
// aleatoria por proceso (solo desarrollo: los tokens no sobreviven reinicios).
let _sal: string | null = null;
function sal(): string {
  if (_sal) return _sal;
  const base = process.env.RECLAMOS_SAL || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  _sal = base
    ? createHmac("sha256", "lioncub-libro-reclamaciones").update(base).digest("hex")
    : randomBytes(32).toString("hex");
  return _sal;
}

function hmac(secreto: string, dato: string): string {
  return createHmac("sha256", secreto).update(dato).digest("hex");
}

/** Token `timestamp.firma` que el formulario pide al cargar. */
export function firmarCargaCon(secreto: string, ahora: number): string {
  const ts = String(ahora);
  return `${ts}.${hmac(secreto, `carga:${ts}`)}`;
}

export type EstadoToken = "ok" | "invalido" | "muy_rapido" | "vencido";

export function verificarCargaCon(secreto: string, token: unknown, ahora: number): EstadoToken {
  if (typeof token !== "string") return "invalido";
  const m = /^(\d{10,16})\.([0-9a-f]{64})$/.exec(token);
  if (!m) return "invalido";
  const esperado = Buffer.from(hmac(secreto, `carga:${m[1]}`), "hex");
  const recibido = Buffer.from(m[2], "hex");
  if (esperado.length !== recibido.length || !timingSafeEqual(esperado, recibido)) return "invalido";
  const edad = ahora - Number(m[1]);
  if (edad < ESPERA_MINIMA_MS) return "muy_rapido";
  if (edad > VIGENCIA_TOKEN_MS) return "vencido";
  return "ok";
}

export const firmarCarga = (ahora = Date.now()) => firmarCargaCon(sal(), ahora);
export const verificarCarga = (token: unknown, ahora = Date.now()) => verificarCargaCon(sal(), token, ahora);

/** sha256 con sal de servidor (HMAC). Nunca se guarda la IP en claro. */
export const hashIpCon = (secreto: string, ip: string) => hmac(secreto, `ip:${ip}`);
export const hashIp = (ip: string) => hashIpCon(sal(), ip);

/** IP del cliente según los encabezados del proxy (Vercel pone x-forwarded-for). */
export function ipDeEncabezados(h: Headers): string {
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip")?.trim() || "desconocida";
}
