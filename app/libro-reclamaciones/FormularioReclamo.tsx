"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TIPOS_DOCUMENTO, type ReclamoEntrada } from "../lib/reclamos";
import { DATOS_LEGALES, PLAZO_RESPUESTA_DIAS_HABILES } from "../lib/legal";
import { formatSoles } from "../lib/money";

type Errores = Partial<Record<keyof ReclamoEntrada, string>>;

const VACIO: ReclamoEntrada = {
  tipo: "reclamo",
  consumidor_nombre: "",
  consumidor_tipo_documento: "DNI",
  consumidor_numero_documento: "",
  consumidor_domicilio: "",
  consumidor_telefono: "",
  consumidor_email: "",
  menor_de_edad: false,
  apoderado_nombre: "",
  bien_tipo: "producto",
  bien_descripcion: "",
  monto_reclamado: "",
  numero_pedido: "",
  detalle: "",
  pedido_consumidor: "",
  acepta_politica: false,
};

const labelCls = "block lc-mono uppercase text-[12px] tracking-[0.18em] text-ink-soft mb-1";
const errCls = "text-[13px] text-red-700 mt-1";
const legendCls = "lc-display text-2xl text-ink mb-4";

export default function FormularioReclamo() {
  const [f, setF] = useState<ReclamoEntrada>(VACIO);
  const [trampa, setTrampa] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [canalAlterno, setCanalAlterno] = useState(false);
  const [hecho, setHecho] = useState<{ codigo: string; fecha: string; copiaEnviada: boolean; datos: ReclamoEntrada } | null>(null);
  const [tokenCarga, setTokenCarga] = useState("");

  // Token de carga firmado por el servidor: el envío se rechaza si llega en
  // menos de 3 s o sin token (antispam).
  async function pedirToken() {
    try {
      const res = await fetch("/api/reclamos", { cache: "no-store" });
      const data = await res.json();
      if (typeof data.token === "string") setTokenCarga(data.token);
    } catch {
      /* sin token el servidor responde con un aviso para recargar */
    }
  }
  useEffect(() => {
    void pedirToken();
  }, []);

  function set<K extends keyof ReclamoEntrada>(k: K, v: ReclamoEntrada[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErrorGeneral(null);
    setCanalAlterno(false);
    setErrores({});
    try {
      const res = await fetch("/api/reclamos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, sitio_web: trampa, token_carga: tokenCarga }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.codigo) {
        setHecho({ codigo: data.codigo, fecha: data.fecha, copiaEnviada: data.copia_enviada === true, datos: f });
        return;
      }
      if (data.recargar) void pedirToken();
      if (data.errores) setErrores(data.errores);
      setCanalAlterno(!!data.canal_alterno);
      setErrorGeneral(data.error ?? "No pudimos registrar tu hoja. Intenta de nuevo.");
    } catch {
      setCanalAlterno(true);
      setErrorGeneral("No pudimos conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  }

  if (hecho) {
    const d = hecho.datos;
    const fila = (k: string, v: string | null | undefined) =>
      v ? (
        <div className="grid grid-cols-[minmax(8rem,40%)_1fr] gap-3 py-2 border-b border-rule">
          <dt className="text-sm text-ink-soft">{k}</dt>
          <dd className="text-base text-ink whitespace-pre-wrap break-words">{v}</dd>
        </div>
      ) : null;
    return (
      <section role="status" aria-labelledby="hoja-titulo" className="border border-rule bg-bg-card p-6 flex flex-col gap-5">
        <div>
          <p className="lc-eyebrow">Hoja de reclamación registrada</p>
          <h2 id="hoja-titulo" className="lc-display text-3xl text-ink leading-tight mt-1">N.° {hecho.codigo}</h2>
          <p className="text-sm text-ink-soft mt-1">
            {new Date(hecho.fecha).toLocaleString("es-PE", { timeZone: "America/Lima" })} ·{" "}
            {[DATOS_LEGALES.razonSocial ?? DATOS_LEGALES.nombreComercial, DATOS_LEGALES.ruc ? `RUC ${DATOS_LEGALES.ruc}` : null].filter(Boolean).join(" · ")}
          </p>
        </div>
        <dl>
          {fila("Tipo", d.tipo === "reclamo" ? "Reclamo (disconformidad con el producto o servicio)" : "Queja (disconformidad con la atención)")}
          {fila("Consumidor", d.consumidor_nombre)}
          {fila("Documento", `${d.consumidor_tipo_documento} ${d.consumidor_numero_documento}`)}
          {fila("Domicilio", d.consumidor_domicilio)}
          {fila("Teléfono", d.consumidor_telefono)}
          {fila("Correo", d.consumidor_email)}
          {d.menor_de_edad ? fila("Padre, madre o apoderado", d.apoderado_nombre) : null}
          {fila("Bien contratado", `${d.bien_tipo === "producto" ? "Producto" : "Servicio"}: ${d.bien_descripcion}`)}
          {d.monto_reclamado ? fila("Monto reclamado", formatSoles(Number(d.monto_reclamado.replace(",", ".")))) : null}
          {fila("N.° de pedido", d.numero_pedido)}
          {fila("Detalle", d.detalle)}
          {fila("Pedido del consumidor", d.pedido_consumidor)}
        </dl>
        <p className="text-base text-ink-soft leading-relaxed">
          {hecho.copiaEnviada ? (
            <>Te enviamos una copia de esta hoja a <strong className="text-ink">{d.consumidor_email}</strong>. </>
          ) : (
            <>
              <strong className="text-ink">No pudimos enviarte la copia por correo.</strong> Guarda esta hoja con el botón
              de abajo (imprimir o guardar como PDF); tu reclamo ya quedó registrado.{" "}
            </>
          )}
          Responderemos en un plazo máximo de {PLAZO_RESPUESTA_DIAS_HABILES} días hábiles.
        </p>
        <button type="button" onClick={() => window.print()} className="lc-btn lc-btn-outline w-full print:hidden">
          Imprimir / guardar PDF
        </button>
      </section>
    );
  }

  const input = (
    k: keyof ReclamoEntrada,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div>
      <label htmlFor={`lr-${k}`} className={labelCls}>{label}</label>
      <input
        id={`lr-${k}`}
        name={k}
        value={f[k] as string}
        onChange={(e) => set(k, e.target.value as never)}
        aria-invalid={!!errores[k]}
        aria-describedby={errores[k] ? `lr-${k}-err` : undefined}
        className="lc-input"
        {...props}
      />
      {errores[k] && <p id={`lr-${k}-err`} className={errCls}>{errores[k]}</p>}
    </div>
  );

  const textarea = (k: "detalle" | "pedido_consumidor", label: string, maxLength: number) => (
    <div>
      <label htmlFor={`lr-${k}`} className={labelCls}>{label}</label>
      <textarea
        id={`lr-${k}`}
        name={k}
        rows={5}
        required
        maxLength={maxLength}
        value={f[k]}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={!!errores[k]}
        aria-describedby={errores[k] ? `lr-${k}-err` : undefined}
        className="w-full bg-transparent border border-rule px-4 py-3 text-base text-ink focus:border-ink transition-colors"
      />
      {errores[k] && <p id={`lr-${k}-err`} className={errCls}>{errores[k]}</p>}
    </div>
  );

  const opcion = (name: string, value: string, actual: string, onSel: () => void, titulo: string, desc: string) => (
    <label
      className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
        actual === value ? "border-ink bg-bg-warm" : "border-rule hover:border-ink"
      }`}
    >
      <input type="radio" name={name} value={value} checked={actual === value} onChange={onSel}
        className="mt-1 w-5 h-5 shrink-0 accent-[var(--color-ink)]" />
      <span>
        <span className="lc-display text-lg text-ink block">{titulo}</span>
        <span className="text-sm text-ink-soft">{desc}</span>
      </span>
    </label>
  );

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-10">
      {/* Campo trampa para bots (oculto a personas y lectores de pantalla) */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="lr-sitio_web">No llenar</label>
        <input id="lr-sitio_web" tabIndex={-1} autoComplete="off" value={trampa} onChange={(e) => setTrampa(e.target.value)} />
      </div>

      <fieldset className="flex flex-col gap-5">
        <legend className={legendCls}>1. Tus datos</legend>
        {input("consumidor_nombre", "Nombres y apellidos *", { autoComplete: "name", required: true, maxLength: 150 })}
        <div className="grid sm:grid-cols-[10rem_1fr] gap-5">
          <div>
            <label htmlFor="lr-consumidor_tipo_documento" className={labelCls}>Documento *</label>
            <select
              id="lr-consumidor_tipo_documento"
              value={f.consumidor_tipo_documento}
              onChange={(e) => set("consumidor_tipo_documento", e.target.value)}
              aria-invalid={!!errores.consumidor_tipo_documento}
              aria-describedby={errores.consumidor_tipo_documento ? "lr-consumidor_tipo_documento-err" : undefined}
              className="lc-input"
            >
              {TIPOS_DOCUMENTO.map((d) => (
                <option key={d} value={d}>{d === "CE" ? "Carné de extranjería" : d === "PASAPORTE" ? "Pasaporte" : d}</option>
              ))}
            </select>
            {errores.consumidor_tipo_documento && (
              <p id="lr-consumidor_tipo_documento-err" className={errCls}>{errores.consumidor_tipo_documento}</p>
            )}
          </div>
          {input("consumidor_numero_documento", "Número de documento *", { required: true, maxLength: 15, inputMode: f.consumidor_tipo_documento === "DNI" || f.consumidor_tipo_documento === "RUC" ? "numeric" : "text" })}
        </div>
        {input("consumidor_domicilio", "Domicilio *", { autoComplete: "street-address", required: true, maxLength: 250 })}
        <div className="grid sm:grid-cols-2 gap-5">
          {input("consumidor_telefono", "Teléfono *", { type: "tel", autoComplete: "tel", inputMode: "tel", required: true, maxLength: 20 })}
          {input("consumidor_email", "Correo electrónico *", { type: "email", autoComplete: "email", inputMode: "email", required: true, maxLength: 150 })}
        </div>
        <label htmlFor="lr-menor" className="flex items-center gap-3 text-base text-ink-soft min-h-11 cursor-pointer">
          <input id="lr-menor" type="checkbox" checked={f.menor_de_edad}
            onChange={(e) => set("menor_de_edad", e.target.checked)}
            className="w-5 h-5 accent-[var(--color-ink)]" />
          Soy menor de edad
        </label>
        {f.menor_de_edad && input("apoderado_nombre", "Nombre del padre, madre o apoderado *", { required: true, maxLength: 150 })}
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className={legendCls}>2. Bien contratado</legend>
        <fieldset aria-describedby={errores.bien_tipo ? "lr-bien_tipo-err" : undefined}>
          <legend className={labelCls}>Tipo de bien *</legend>
          <div className="grid sm:grid-cols-2 gap-3">
            {opcion("bien_tipo", "producto", f.bien_tipo, () => set("bien_tipo", "producto"), "Producto", "Una prenda u otro artículo")}
            {opcion("bien_tipo", "servicio", f.bien_tipo, () => set("bien_tipo", "servicio"), "Servicio", "Envío, atención, cambio…")}
          </div>
          {errores.bien_tipo && <p id="lr-bien_tipo-err" className={errCls}>{errores.bien_tipo}</p>}
        </fieldset>
        {input("bien_descripcion", "Descripción del producto o servicio *", { required: true, maxLength: 500 })}
        <div className="grid sm:grid-cols-2 gap-5">
          {input("monto_reclamado", "Monto reclamado (S/)", { inputMode: "decimal", maxLength: 12 })}
          {input("numero_pedido", "N.° de pedido (si lo tienes)", { maxLength: 40 })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className={legendCls}>3. Detalle y pedido</legend>
        <fieldset aria-describedby={errores.tipo ? "lr-tipo-err" : undefined}>
          <legend className={labelCls}>Tipo de hoja *</legend>
          <div className="grid sm:grid-cols-2 gap-3">
            {opcion("tipo", "reclamo", f.tipo, () => set("tipo", "reclamo"), "Reclamo", "Disconformidad con el producto o servicio")}
            {opcion("tipo", "queja", f.tipo, () => set("tipo", "queja"), "Queja", "Disconformidad con la atención")}
          </div>
          {errores.tipo && <p id="lr-tipo-err" className={errCls}>{errores.tipo}</p>}
        </fieldset>
        {textarea("detalle", "Detalle (qué pasó) *", 3000)}
        {textarea("pedido_consumidor", "Pedido (qué solicitas) *", 2000)}
      </fieldset>

      <div className="flex flex-col gap-3">
        <label htmlFor="lr-acepta" className="flex items-start gap-3 text-sm text-ink-soft leading-relaxed min-h-11 cursor-pointer">
          <input id="lr-acepta" type="checkbox" checked={f.acepta_politica}
            onChange={(e) => set("acepta_politica", e.target.checked)}
            aria-describedby={errores.acepta_politica ? "lr-acepta-err" : undefined}
            className="mt-0.5 w-5 h-5 shrink-0 accent-[var(--color-ink)]" />
          <span>
            Declaro que los datos son verdaderos y acepto que se usen para atender esta hoja, según la{" "}
            <Link href="/privacidad" target="_blank" className="underline text-ink">Política de privacidad</Link>.
          </span>
        </label>
        {errores.acepta_politica && <p id="lr-acepta-err" className={errCls}>{errores.acepta_politica}</p>}
      </div>

      {errorGeneral && (
        <div id="lr-error-general" role="alert" className="border border-red-300 bg-red-50 p-4 text-sm text-red-800 leading-relaxed">
          <p>{errorGeneral}</p>
          {canalAlterno && (
            <p className="mt-2">
              <a href={DATOS_LEGALES.whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                Escribir por WhatsApp
              </a>{" · "}
              <a href={`mailto:${DATOS_LEGALES.correo}?subject=${encodeURIComponent("Libro de Reclamaciones")}`} className="underline font-semibold">
                Enviar correo
              </a>
            </p>
          )}
        </div>
      )}

      <button type="submit" disabled={enviando || !f.acepta_politica}
        aria-describedby={errorGeneral ? "lr-error-general" : undefined} className="lc-btn lc-btn-primary w-full disabled:opacity-60">
        {enviando ? "Enviando…" : `Registrar ${f.tipo === "reclamo" ? "reclamo" : "queja"}`}
      </button>
    </form>
  );
}
