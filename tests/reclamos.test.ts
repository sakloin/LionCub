// Pruebas unitarias del Libro de Reclamaciones (node:test, sin dependencias nuevas).
// Correr: npm test   (compila con tsc a .test-build/ y ejecuta node --test)
// Datos 100% ficticios.
import { test } from "node:test";
import assert from "node:assert/strict";
import { validarReclamo, codigoHoja, esTablaInexistente, type ReclamoEntrada } from "../app/lib/reclamos";
import { firmarCargaCon, verificarCargaCon, hashIpCon } from "../app/lib/reclamos-servidor";

const base: ReclamoEntrada = {
  tipo: "reclamo",
  consumidor_nombre: "Persona Ficticia",
  consumidor_tipo_documento: "DNI",
  consumidor_numero_documento: "12345678",
  consumidor_domicilio: "Calle Ficticia 123, Lima",
  consumidor_telefono: "999 000 111",
  consumidor_email: "Ficticia@Example.com",
  menor_de_edad: false,
  apoderado_nombre: "",
  bien_tipo: "producto",
  bien_descripcion: "Body talla 3M",
  monto_reclamado: "",
  numero_pedido: "",
  detalle: "Llegó con una costura abierta.",
  pedido_consumidor: "Cambio de prenda",
  acepta_politica: true,
};

test("hoja válida: normaliza correo y no exige apoderado", () => {
  const r = validarReclamo(base);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.fila.consumidor_email, "ficticia@example.com");
    assert.equal(r.fila.apoderado_nombre, null);
    assert.equal(r.fila.monto_reclamado, null);
    assert.equal(r.fila.acepta_politica, true);
  }
});

test("monto: acepta hasta 2 decimales y coma decimal", () => {
  for (const [txt, esperado] of [["89", 89], ["89.9", 89.9], ["89,50", 89.5], ["0.01", 0.01]] as const) {
    const r = validarReclamo({ ...base, monto_reclamado: txt });
    assert.equal(r.ok, true, txt);
    if (r.ok) assert.equal(r.fila.monto_reclamado, esperado);
  }
});

test("monto: rechaza negativos, exponentes, 3 decimales y texto", () => {
  for (const txt of ["-5", "1e3", "10.123", "abc", "1.000,00", "100001"]) {
    const r = validarReclamo({ ...base, monto_reclamado: txt });
    assert.equal(r.ok, false, txt);
    if (!r.ok) assert.ok(r.errores.monto_reclamado, txt);
  }
});

test("documento: DNI de 8 dígitos y RUC de 11", () => {
  assert.equal(validarReclamo({ ...base, consumidor_numero_documento: "1234567" }).ok, false);
  assert.equal(validarReclamo({ ...base, consumidor_tipo_documento: "RUC", consumidor_numero_documento: "12345678" }).ok, false);
  assert.equal(validarReclamo({ ...base, consumidor_tipo_documento: "RUC", consumidor_numero_documento: "20123456789" }).ok, true);
  assert.equal(validarReclamo({ ...base, consumidor_tipo_documento: "OTRO" }).ok, false);
});

test("menor de edad exige apoderado", () => {
  const r = validarReclamo({ ...base, menor_de_edad: true });
  assert.equal(r.ok, false);
  if (!r.ok) assert.ok(r.errores.apoderado_nombre);
  const r2 = validarReclamo({ ...base, menor_de_edad: true, apoderado_nombre: "Madre Ficticia" });
  assert.equal(r2.ok, true);
});

test("campos obligatorios, tipo y aceptación", () => {
  const r = validarReclamo({ tipo: "x" });
  assert.equal(r.ok, false);
  if (!r.ok) {
    for (const k of ["tipo", "consumidor_nombre", "consumidor_email", "bien_tipo", "detalle", "pedido_consumidor", "acepta_politica"]) {
      assert.ok(k in r.errores, k);
    }
  }
});

test("codigoHoja: 9 dígitos + año", () => {
  assert.equal(codigoHoja(1, 2026), "000000001-2026");
  assert.equal(codigoHoja(123456789, 2027), "123456789-2027");
});

test("esTablaInexistente reconoce 42P01 y PGRST205", () => {
  assert.equal(esTablaInexistente({ code: "42P01" }), true);
  assert.equal(esTablaInexistente({ code: "PGRST205" }), true);
  assert.equal(esTablaInexistente({ code: "23505" }), false);
  assert.equal(esTablaInexistente(null), false);
});

test("token de carga: válido tras 3 s, rechaza antes, vencido o alterado", () => {
  const sal = "sal-de-prueba";
  const t0 = 1_760_000_000_000;
  const token = firmarCargaCon(sal, t0);
  assert.equal(verificarCargaCon(sal, token, t0 + 1_000), "muy_rapido");
  assert.equal(verificarCargaCon(sal, token, t0 + 3_000), "ok");
  assert.equal(verificarCargaCon(sal, token, t0 + 25 * 3600 * 1000), "vencido");
  assert.equal(verificarCargaCon("otra-sal", token, t0 + 5_000), "invalido");
  assert.equal(verificarCargaCon(sal, `${t0 - 10_000}.${token.split(".")[1]}`, t0 + 5_000), "invalido");
  assert.equal(verificarCargaCon(sal, undefined, t0), "invalido");
});

test("hash de IP: estable, depende de la sal y no contiene la IP", () => {
  const a = hashIpCon("s1", "203.0.113.7");
  assert.equal(a, hashIpCon("s1", "203.0.113.7"));
  assert.notEqual(a, hashIpCon("s2", "203.0.113.7"));
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.ok(!a.includes("203.0.113.7"));
});
