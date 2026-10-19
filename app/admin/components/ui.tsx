"use client";

/*
 * Piezas de interfaz compartidas del panel admin.
 * Solo usan tokens de app/globals.css (IDENTIDAD.md §2): tinta, crema, hairline,
 * oro champagne como acento y pasteles para estados. El rojo de Tailwind solo
 * para errores/acciones destructivas (pendiente token --color-danger, ver spec).
 */

import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle, BadgeCheck, CheckCircle2, Clock, PackageOpen, Sparkles, Truck, XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ── Botones (objetivo táctil ≥ 44 px, foco visible) ─────────────────────── */
const btnBase =
  "inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl text-sm font-semibold transition-colors duration-200 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep disabled:opacity-50 disabled:cursor-not-allowed";
export const btn = {
  primary:   `${btnBase} bg-ink text-bg hover:bg-black`,
  secondary: `${btnBase} bg-bg-card text-ink border border-rule hover:border-ink-soft`,
  ghost:     `${btnBase} text-ink-soft hover:bg-bg-warm hover:text-ink`,
  danger:    `${btnBase} bg-bg-card text-red-700 border border-red-200 hover:bg-red-50`,
  dangerSolid: `${btnBase} bg-red-700 text-white hover:bg-red-800`,
  icon:
    "inline-flex items-center justify-center w-11 h-11 rounded-xl text-ink-soft hover:bg-bg-warm hover:text-ink transition-colors " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep disabled:opacity-40",
};

export const card = "bg-bg-card rounded-2xl border border-rule";
export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep";

/* ── Encabezado de página ────────────────────────────────────────────────── */
export function PageHeader({
  eyebrow, title, subtitle, actions,
}: { eyebrow?: string; title: string; subtitle?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="lc-eyebrow mb-1">{eyebrow}</p>}
        <h1 className="lc-display text-[34px] leading-tight text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-ink-soft mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/* ── Estados: color + ícono + texto ──────────────────────────────────────── */
export interface StatusMeta { label: string; icon: LucideIcon; cls: string }

export const ORDER_STATUS: Record<string, StatusMeta> = {
  nuevo:      { label: "Nuevo",      icon: Sparkles,     cls: "bg-blue-soft text-ink border-blue" },
  procesando: { label: "Procesando", icon: PackageOpen,  cls: "bg-gold-pale/60 text-ink border-gold-pale" },
  enviado:    { label: "Enviado",    icon: Truck,        cls: "bg-lav/60 text-ink border-lav" },
  entregado:  { label: "Entregado",  icon: CheckCircle2, cls: "bg-mint-soft text-ink border-mint" },
  cancelado:  { label: "Cancelado",  icon: XCircle,      cls: "bg-red-50 text-red-800 border-red-200" },
};
export const ORDER_STATUS_ORDER = ["nuevo", "procesando", "enviado", "entregado", "cancelado"] as const;

export const PAY_STATUS: Record<string, StatusMeta> = {
  pendiente: { label: "Pago pendiente", icon: Clock,       cls: "bg-gold-pale/60 text-ink border-gold-pale" },
  pagado:    { label: "Pagado",         icon: BadgeCheck,  cls: "bg-mint-soft text-ink border-mint" },
  fallido:   { label: "Pago fallido",   icon: AlertCircle, cls: "bg-red-50 text-red-800 border-red-200" },
};

export function StatusBadge({ meta, size = "md" }: { meta?: StatusMeta; size?: "sm" | "md" }) {
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span className={cx(
      "inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap",
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
      meta.cls,
    )}>
      <Icon size={13} aria-hidden />
      {meta.label}
    </span>
  );
}

/* ── Chip de filtro con conteo ───────────────────────────────────────────── */
export function FilterChip({
  active, onClick, children, count, icon: Icon,
}: { active: boolean; onClick: () => void; children: React.ReactNode; count?: number; icon?: LucideIcon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "inline-flex items-center gap-2 min-h-11 px-4 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap",
        focusRing,
        active ? "bg-ink text-bg border-ink" : "bg-bg-card text-ink-soft border-rule hover:border-ink-soft hover:text-ink",
      )}
    >
      {Icon && <Icon size={15} aria-hidden />}
      {children}
      {count !== undefined && (
        <span className={cx(
          "min-w-6 px-1.5 py-0.5 rounded-full text-xs tabular-nums text-center",
          active ? "bg-bg/20 text-bg" : "bg-bg-warm text-ink",
        )}>{count}</span>
      )}
    </button>
  );
}

/* ── Skeleton (sin spinners que bloqueen) ────────────────────────────────── */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cx("rounded-xl bg-bg-warm motion-safe:animate-pulse", className)} />;
}

export function ListSkeleton({ rows = 4, label = "Cargando…" }: { rows?: number; label?: string }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={cx(card, "p-5 flex items-center gap-4")}>
          <Skeleton className="w-12 h-12 flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}

/* ── Vacío útil ──────────────────────────────────────────────────────────── */
export function EmptyState({
  icon: Icon, title, description, action,
}: { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className={cx(card, "px-6 py-12 flex flex-col items-center text-center gap-3")}>
      <span className="w-12 h-12 rounded-full bg-bg-warm text-gold-deep flex items-center justify-center">
        <Icon size={22} aria-hidden />
      </span>
      <p className="lc-display text-2xl text-ink">{title}</p>
      {description && <p className="text-sm text-ink-soft max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

/* ── Error con reintento ─────────────────────────────────────────────────── */
export function ErrorState({ title, detail, onRetry }: { title: string; detail?: string | null; onRetry?: () => void }) {
  return (
    <div role="alert" className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 flex flex-col gap-2">
      <p className="font-semibold">{title}</p>
      {detail && <p className="text-sm font-mono break-all">{detail}</p>}
      {onRetry && <button onClick={onRetry} className={cx(btn.danger, "self-start mt-1")}>Reintentar</button>}
    </div>
  );
}

/* ── Diálogo de confirmación accesible ───────────────────────────────────── */
export function ConfirmDialog({
  open, title, description, confirmLabel, cancelLabel = "Cancelar", tone = "default", busy, onConfirm, onCancel,
}: {
  open: boolean; title: string; description?: React.ReactNode; confirmLabel: string; cancelLabel?: string;
  tone?: "default" | "danger"; busy?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    // En acciones destructivas el foco inicial va a «Cancelar».
    (tone === "danger" ? cancelRef : confirmRef).current?.focus();
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onCancel(); }
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); prev?.focus?.(); };
  }, [open, tone, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onCancel} aria-hidden />
      <div
        role="dialog" aria-modal="true" aria-labelledby={titleId}
        className="relative bg-bg-card rounded-2xl shadow-[var(--lc-shadow-3)] w-full max-w-sm p-6 flex flex-col gap-4 lc-admin-pop"
      >
        <h2 id={titleId} className="lc-display text-2xl text-ink">{title}</h2>
        {description && <div className="text-sm text-ink-soft leading-relaxed">{description}</div>}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
          <button ref={cancelRef} onClick={onCancel} className={btn.secondary} disabled={busy}>{cancelLabel}</button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={busy}
            className={tone === "danger" ? btn.dangerSolid : btn.primary}
          >
            {busy ? "Un momento…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Notificaciones del admin (Toaster propio, id "admin") ───────────────── */
export const ADMIN_TOASTER = "admin";
export const notify = {
  ok(message: string, opts?: { description?: string; undo?: () => void }) {
    toast.success(message, {
      toasterId: ADMIN_TOASTER,
      description: opts?.description,
      duration: opts?.undo ? 8000 : 3500,
      action: opts?.undo ? { label: "Deshacer", onClick: opts.undo } : undefined,
    });
  },
  error(message: string, description?: string) {
    toast.error(message, { toasterId: ADMIN_TOASTER, description, duration: 6000 });
  },
};

/* ── Contador que sube al cargar (respeta prefers-reduced-motion) ────────── */
export function useCountUp(target: number, duration = 600): number {
  // progreso 0→1; arranca en 1 para que el HTML del servidor ya traiga la cifra real.
  const [progress, setProgress] = useState(1);
  useEffect(() => {
    if (!Number.isFinite(target) || target === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      setProgress(t);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  const eased = 1 - Math.pow(1 - progress, 3);
  return target * eased;
}

/* ── Fechas relativas en español ─────────────────────────────────────────── */
const rtf = typeof Intl !== "undefined" ? new Intl.RelativeTimeFormat("es-PE", { numeric: "auto" }) : null;
export function timeAgo(iso: string, now = Date.now()): string {
  const diff = (new Date(iso).getTime() - now) / 1000;
  const abs = Math.abs(diff);
  if (!rtf) return "";
  if (abs < 60) return "hace un momento";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 7) return rtf.format(Math.round(diff / 86400), "day");
  return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
}
