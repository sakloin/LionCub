// Pruebas del normalizador de reportes CSP y del armado de la CSP (node:test). Datos ficticios.
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizarReportes, limpiarUri, MAX_REPORTES, MAX_SAMPLE } from "../app/lib/csp-report";
import { armarCspReportOnly } from "../app/lib/csp";

test("quita query y fragmento de la URI bloqueada y del documento", () => {
  const r = normalizarReportes(JSON.stringify({
    "csp-report": {
      "effective-directive": "script-src-elem",
      "blocked-uri": "https://ejemplo.test/a/b.js?token=secreto#x",
      "document-uri": "https://www.lioncub.pe/checkout?email=a@b.c",
      disposition: "report",
    },
  }));
  assert.equal(r.length, 1);
  assert.equal(r[0].bloqueado, "https://ejemplo.test/a/b.js");
  assert.equal(r[0].documento, "https://www.lioncub.pe/checkout");
  assert.equal(r[0].directiva, "script-src-elem");
});

test("inline y eval pasan tal cual; sample se recorta", () => {
  assert.equal(limpiarUri("inline"), "inline");
  assert.equal(limpiarUri("eval"), "eval");
  const r = normalizarReportes(JSON.stringify([{ type: "csp-violation", body: { effectiveDirective: "script-src", blockedURL: "inline", sample: "x".repeat(200) } }]));
  assert.equal(r[0].sample.length, MAX_SAMPLE);
  assert.equal(r[0].bloqueado, "inline");
});

test("tolera JSON roto y formas raras", () => {
  assert.deepEqual(normalizarReportes("{no es json"), []);
  assert.deepEqual(normalizarReportes("null"), []);
  assert.deepEqual(normalizarReportes("[1,\"a\",null]"), []);
});

test("respeta el tope de reportes", () => {
  const uno = { type: "csp-violation", body: { effectiveDirective: "img-src", blockedURL: "https://x.test/i.png" } };
  assert.equal(normalizarReportes(JSON.stringify(Array(50).fill(uno))).length, MAX_REPORTES);
});

test("la CSP incluye las directivas clave", () => {
  const csp = armarCspReportOnly(false);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /report-to csp/);
  assert.match(csp, /https:\/\/js\.culqi\.com/);
  assert.ok(!csp.includes("unsafe-eval"));
  assert.ok(armarCspReportOnly(true).includes("'unsafe-eval'"));
});
