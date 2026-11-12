// Pruebas de la ruta POST /api/csp-report (node:test). Datos ficticios.
import { test } from "node:test";
import assert from "node:assert/strict";
import { POST } from "../app/api/csp-report/route";
import { enmascararRuta, limpiarUri } from "../app/lib/csp-report";

const URL_RUTA = "http://localhost/api/csp-report";
const valido = JSON.stringify({
  "csp-report": { "effective-directive": "img-src", "blocked-uri": "https://x.test/i.png?a=1", "document-uri": "https://www.lioncub.pe/checkout?e=1" },
});

function peticion(cuerpo: BodyInit | null, tipo = "application/csp-report", extra: Record<string, string> = {}) {
  return new Request(URL_RUTA, { method: "POST", headers: { "content-type": tipo, ...extra }, body: cuerpo, duplex: "half" } as RequestInit);
}

function conRegistros<T>(fn: () => Promise<T>) {
  const originales = console.warn;
  const lineas: string[] = [];
  console.warn = (...a: unknown[]) => { lineas.push(a.join(" ")); };
  return fn().then((r) => { console.warn = originales; return { r, lineas }; }, (e) => { console.warn = originales; throw e; });
}

test("415 con tipo no aceptado y sin leer el cuerpo", async () => {
  const req = peticion("x", "text/plain");
  assert.equal((await POST(req)).status, 415);
  assert.equal(req.bodyUsed, false);
});

test("413 por Content-Length sin leer el cuerpo", async () => {
  const req = peticion(valido, "application/csp-report", { "content-length": "20000" });
  assert.equal((await POST(req)).status, 413);
  assert.equal(req.bodyUsed, false);
});

test("413 sin Content-Length cuando el stream pasa de 16 KB, y lo cancela", async () => {
  let cancelado = false;
  let enviados = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(c) { enviados++; c.enqueue(new Uint8Array(4096)); },
    cancel() { cancelado = true; },
  });
  assert.equal((await POST(peticion(stream))).status, 413);
  assert.equal(cancelado, true);
  assert.ok(enviados < 10);
});

test("204 válido: una línea sin query", async () => {
  const { r, lineas } = await conRegistros(() => POST(peticion(valido)));
  assert.equal(r.status, 204);
  assert.equal(lineas.length, 1);
  assert.ok(!lineas[0].includes("?"));
});

test("204 con JSON roto, sin registrar", async () => {
  const { r, lineas } = await conRegistros(() => POST(peticion("{roto")));
  assert.equal(r.status, 204);
  assert.equal(lineas.length, 0);
});

test("400 cuando el stream falla, sin registrar la traza", async () => {
  const stream = new ReadableStream<Uint8Array>({ pull(c) { c.error(new Error("falla-secreta")); } });
  const { r, lineas } = await conRegistros(() => POST(peticion(stream)));
  assert.equal(r.status, 400);
  assert.equal(lineas.length, 0);
});

test("enmascara UUID y tokens largos en la ruta", () => {
  assert.equal(enmascararRuta("/mi-pedido/123e4567-e89b-42d3-a456-426614174000"), "/mi-pedido/:token");
  assert.equal(enmascararRuta("/mi-pedido/abcdefghijklmnopqrstuvwxyz123456"), "/mi-pedido/:token");
  assert.equal(enmascararRuta("/checkout"), "/checkout");
  assert.equal(limpiarUri("https://www.lioncub.pe/mi-pedido/123e4567-e89b-42d3-a456-426614174000?x=1"), "https://www.lioncub.pe/mi-pedido/:token");
});

test("valores con esquema sin :// guardan solo el esquema", () => {
  assert.equal(limpiarUri("data:image/png;base64,AAAA"), "data:");
  assert.equal(limpiarUri("blob:https://x.test/uuid"), "blob:");
  assert.equal(limpiarUri("inline"), "inline");
});
