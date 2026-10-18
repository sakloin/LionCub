// ─── Libro de Reclamaciones virtual: reglas puras ───────────────────────────
// Campos de la Hoja de Reclamación (Anexo I del Reglamento del Libro de
// Reclamaciones, D.S. 011-2011-PCM, modificado por el D.S. 101-2022-PCM).
// La tabla `libro_reclamaciones` se propone en docs/decisiones/0002-libro-de-reclamaciones.md.
// Este archivo no toca la base: valida y da formato. Lo usan la página y la API.

import { toCents, fromCents } from "./money";

export type TipoReclamo = "reclamo" | "queja";
export type TipoDocumento = "DNI" | "CE" | "PASAPORTE" | "RUC";
export type TipoBien = "producto" | "servicio";

export const TIPOS_DOCUMENTO: TipoDocumento[] = ["DNI", "CE", "PASAPORTE", "RUC"];

/** Datos que el consumidor envía (todo llega como texto desde el formulario). */
export interface ReclamoEntrada {
  tipo: string;
  consumidor_nombre: string;
  consumidor_tipo_documento: string;
  consumidor_numero_documento: string;
  consumidor_domicilio: string;
  consumidor_telefono: string;
  consumidor_email: string;
  menor_de_edad: boolean;
  apoderado_nombre: string;
  bien_tipo: string;
  bien_descripcion: string;
  monto_reclamado: string;
  numero_pedido: string;
  detalle: string;
  pedido_consumidor: string;
  acepta_politica: boolean;
}

/** Fila que se inserta: solo columnas permitidas al público (ver ADR 0002). */
export interface ReclamoFila {
  tipo: TipoReclamo;
  consumidor_nombre: string;
  consumidor_tipo_documento: TipoDocumento;
  consumidor_numero_documento: string;
  consumidor_domicilio: string;
  consumidor_telefono: string;
  consumidor_email: string;
  menor_de_edad: boolean;
  apoderado_nombre: string | null;
  bien_tipo: TipoBien;
  bien_descripcion: string;
  monto_reclamado: number | null;
  numero_pedido: string | null;
  detalle: string;
  pedido_consumidor: string;
  acepta_politica: true;
}

export type ResultadoValidacion =
  | { ok: true; fila: ReclamoFila }
  | { ok: false; errores: Partial<Record<keyof ReclamoEntrada, string>> };

const LIMITES = {
  consumidor_nombre: [3, 150],
  consumidor_numero_documento: [6, 15],
  consumidor_domicilio: [5, 250],
  consumidor_telefono: [6, 20],
  consumidor_email: [5, 150],
  apoderado_nombre: [3, 150],
  bien_descripcion: [3, 500],
  numero_pedido: [0, 40],
  detalle: [10, 3000],
  pedido_consumidor: [5, 2000],
} as const;

function limpio(v: unknown): string {
  return typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "";
}
function limpioMultilinea(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function validarReclamo(e: Partial<ReclamoEntrada>): ResultadoValidacion {
  const errores: Partial<Record<keyof ReclamoEntrada, string>> = {};

  const tipo = limpio(e.tipo);
  if (tipo !== "reclamo" && tipo !== "queja") errores.tipo = "Elige reclamo o queja.";

  const texto = (k: keyof typeof LIMITES, valor: string, msg: string) => {
    const [min, max] = LIMITES[k];
    if (valor.length < min || valor.length > max) errores[k] = msg;
  };

  const nombre = limpio(e.consumidor_nombre);
  texto("consumidor_nombre", nombre, "Escribe tu nombre completo.");

  const tipoDoc = limpio(e.consumidor_tipo_documento).toUpperCase();
  if (!(TIPOS_DOCUMENTO as string[]).includes(tipoDoc)) errores.consumidor_tipo_documento = "Elige el tipo de documento.";

  const numDoc = limpio(e.consumidor_numero_documento).replace(/\s/g, "");
  texto("consumidor_numero_documento", numDoc, "Revisa el número de documento.");
  if (!errores.consumidor_numero_documento) {
    if (!/^[A-Za-z0-9-]+$/.test(numDoc)) errores.consumidor_numero_documento = "Usa solo letras y números.";
    else if (tipoDoc === "DNI" && !/^\d{8}$/.test(numDoc)) errores.consumidor_numero_documento = "El DNI tiene 8 dígitos.";
    else if (tipoDoc === "RUC" && !/^\d{11}$/.test(numDoc)) errores.consumidor_numero_documento = "El RUC tiene 11 dígitos.";
  }

  const domicilio = limpio(e.consumidor_domicilio);
  texto("consumidor_domicilio", domicilio, "Escribe tu domicilio.");

  const telefono = limpio(e.consumidor_telefono);
  texto("consumidor_telefono", telefono, "Escribe un teléfono de contacto.");
  if (!errores.consumidor_telefono && !/^[+\d\s()-]+$/.test(telefono)) errores.consumidor_telefono = "Usa solo números.";

  const email = limpio(e.consumidor_email).toLowerCase();
  texto("consumidor_email", email, "Escribe tu correo.");
  if (!errores.consumidor_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errores.consumidor_email = "El correo no tiene un formato válido.";

  const menor = e.menor_de_edad === true;
  const apoderado = limpio(e.apoderado_nombre);
  if (menor) texto("apoderado_nombre", apoderado, "Si eres menor de edad, escribe el nombre de tu padre, madre o apoderado.");

  const bienTipo = limpio(e.bien_tipo);
  if (bienTipo !== "producto" && bienTipo !== "servicio") errores.bien_tipo = "Elige producto o servicio.";

  const bienDesc = limpio(e.bien_descripcion);
  texto("bien_descripcion", bienDesc, "Describe el producto o servicio.");

  let monto: number | null = null;
  const montoTxt = limpio(e.monto_reclamado).replace(",", ".");
  if (montoTxt) {
    const n = Number(montoTxt);
    if (!Number.isFinite(n) || n < 0 || n > 100000) errores.monto_reclamado = "Escribe un monto válido en soles.";
    else monto = fromCents(toCents(n));
  }

  const pedido = limpio(e.numero_pedido);
  texto("numero_pedido", pedido, "El número de pedido es muy largo.");

  const detalle = limpioMultilinea(e.detalle);
  texto("detalle", detalle, "Cuéntanos qué pasó (mínimo 10 caracteres).");

  const pedidoConsumidor = limpioMultilinea(e.pedido_consumidor);
  texto("pedido_consumidor", pedidoConsumidor, "Cuéntanos qué solicitas.");

  if (e.acepta_politica !== true) errores.acepta_politica = "Debes aceptar la Política de privacidad.";

  if (Object.keys(errores).length > 0) return { ok: false, errores };

  return {
    ok: true,
    fila: {
      tipo: tipo as TipoReclamo,
      consumidor_nombre: nombre,
      consumidor_tipo_documento: tipoDoc as TipoDocumento,
      consumidor_numero_documento: numDoc,
      consumidor_domicilio: domicilio,
      consumidor_telefono: telefono,
      consumidor_email: email,
      menor_de_edad: menor,
      apoderado_nombre: menor ? apoderado : null,
      bien_tipo: bienTipo as TipoBien,
      bien_descripcion: bienDesc,
      monto_reclamado: monto,
      numero_pedido: pedido || null,
      detalle,
      pedido_consumidor: pedidoConsumidor,
      acepta_politica: true,
    },
  };
}

/** Código visible de la hoja: correlativo de 9 dígitos + año (p. ej. 000000001-2026). */
export function codigoHoja(numero: number, anio: number): string {
  return `${String(numero).padStart(9, "0")}-${anio}`;
}

/**
 * Error de Supabase/PostgREST que significa "la tabla aún no existe"
 * (42P01 en Postgres, PGRST205 en PostgREST cuando no está en la caché del esquema).
 */
export function esTablaInexistente(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  return err.code === "42P01" || err.code === "PGRST205" || /does not exist|could not find the table/i.test(err.message ?? "");
}
