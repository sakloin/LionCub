"use client";

import { useState } from "react";
import Link from "next/link";
import { TIPOS_DOCUMENTO, type ReclamoEntrada } from "../lib/reclamos";
import { DATOS_LEGALES } from "../lib/legal";

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
  const [hecho, setHecho] = useState<{ codigo: string; fecha: string } | null>(null);

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
        body: JSON.stringify({ ...f, sitio_web: trampa }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.codigo) {
        setHecho({ codigo: data.codigo, fecha: data.fecha });
        return;
      }
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
    return (
      <div role="status" className="border border-rule bg-bg-card p-6 flex flex-col gap-3">
        <p className="lc-eyebrow">Hoja registrada</p>
        <p className="lc-display text-3xl text-ink leading-tight">N.° {hecho.codigo}</p>
        <p className="text-base text-ink-soft leading-relaxed">
          Registramos tu {f.tipo === "reclamo" ? "reclamo" : "queja"} el{" "}
          {new Date(hecho.fecha).toLocaleString("es-PE", { timeZone: "America/Lima" })}. Te enviamos una
          copia a <strong className="text-ink">{f.consumidor_email}</strong>. Guarda este número.
        </p>
      </div>
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
              className="lc-input"
            >
              {TIPOS_DOCUMENTO.map((d) => (
                <option key={d} value={d}>{d === "CE" ? "Carné de extranjería" : d === "PASAPORTE" ? "Pasaporte" : d}</option>
              ))}
            </select>
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
        <div role="radiogroup" aria-label="Tipo de bien" className="grid sm:grid-cols-2 gap-3">
          {opcion("bien_tipo", "producto", f.bien_tipo, () => set("bien_tipo", "producto"), "Producto", "Una prenda u otro artículo")}
          {opcion("bien_tipo", "servicio", f.bien_tipo, () => set("bien_tipo", "servicio"), "Servicio", "Envío, atención, cambio…")}
        </div>
        {input("bien_descripcion", "Descripción del producto o servicio *", { required: true, maxLength: 500 })}
        <div className="grid sm:grid-cols-2 gap-5">
          {input("monto_reclamado", "Monto reclamado (S/)", { inputMode: "decimal", maxLength: 12 })}
          {input("numero_pedido", "N.° de pedido (si lo tienes)", { maxLength: 40 })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className={legendCls}>3. Detalle y pedido</legend>
        <div role="radiogroup" aria-label="Tipo de hoja" className="grid sm:grid-cols-2 gap-3">
          {opcion("tipo", "reclamo", f.tipo, () => set("tipo", "reclamo"), "Reclamo", "Disconformidad con el producto o servicio")}
          {opcion("tipo", "queja", f.tipo, () => set("tipo", "queja"), "Queja", "Disconformidad con la atención")}
        </div>
        {errores.tipo && <p className={errCls}>{errores.tipo}</p>}
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
        <div role="alert" className="border border-red-300 bg-red-50 p-4 text-sm text-red-800 leading-relaxed">
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

      <button type="submit" disabled={enviando || !f.acepta_politica} className="lc-btn lc-btn-primary w-full disabled:opacity-60">
        {enviando ? "Enviando…" : `Registrar ${f.tipo === "reclamo" ? "reclamo" : "queja"}`}
      </button>
    </form>
  );
}
