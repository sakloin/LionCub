"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Comportamiento de diálogo accesible para modales y la bolsa:
 * - al abrir, enfoca el primer control del diálogo;
 * - Tab y Shift+Tab quedan dentro del diálogo (trampa de foco);
 * - Escape cierra (escuchado en document mientras está abierto, aunque el
 *   foco se haya ido fuera); con diálogos anidados solo cierra el de arriba;
 * - al cerrar, devuelve el foco a donde estaba.
 */
const pila: object[] = [];

export function useDialog<T extends HTMLElement>(
  ref: RefObject<T | null>,
  active: boolean,
  onClose: () => void,
) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;
    const previous = document.activeElement as HTMLElement | null;
    const yo = {};
    pila.push(yo);

    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    (focusables()[0] ?? node).focus();

    function onKey(e: KeyboardEvent) {
      if (pila[pila.length - 1] !== yo) return; // solo el diálogo de arriba
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      if (!node!.contains(document.activeElement)) {
        e.preventDefault();
        (focusables()[0] ?? node!).focus();
        return;
      }
      const list = focusables();
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      const i = pila.indexOf(yo);
      if (i >= 0) pila.splice(i, 1);
      previous?.focus?.();
    };
  }, [active, ref]);
}
