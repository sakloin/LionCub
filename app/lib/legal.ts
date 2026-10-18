// ─── Datos legales del proveedor (un solo archivo) ──────────────────────────
// Los usa el pie de página, Términos, Privacidad y el Libro de Reclamaciones.
//
// PENDIENTE_HEBER: estos datos no están en el vault ni en el repo. No se
// inventan. Mientras valgan `null`, la web NO los muestra (se omite la línea).
// Cuando Heber los confirme, se reemplaza `PENDIENTE_HEBER` por el texto real:
//   - razonSocial: razón social exacta según la ficha RUC (SUNAT).
//   - ruc: 11 dígitos.
//   - domicilio: dirección comercial o fiscal (si es un domicilio personal,
//     Heber decide si se publica; la ley pide un domicilio para notificaciones).
export const PENDIENTE_HEBER = null;

type DatoLegal = string | null;

export const DATOS_LEGALES: {
  nombreComercial: string;
  razonSocial: DatoLegal;
  ruc: DatoLegal;
  domicilio: DatoLegal;
  correo: string;
  whatsapp: string;
  whatsappUrl: string;
} = {
  nombreComercial: "Lion Cub Baby Clothing",
  razonSocial: PENDIENTE_HEBER,
  ruc: PENDIENTE_HEBER,
  domicilio: PENDIENTE_HEBER,
  correo: "hola@lioncub.pe",
  whatsapp: "+51 920 201 943",
  whatsappUrl: "https://wa.me/51920201943",
};

/** Plazo legal de respuesta del Libro de Reclamaciones (D.S. 011-2011-PCM, modificado por el D.S. 101-2022-PCM). */
export const PLAZO_RESPUESTA_DIAS_HABILES = 15;

/** Enlaces legales que deben estar visibles en toda la tienda. */
export const ENLACES_LEGALES = [
  { href: "/terminos", es: "Términos y condiciones", en: "Terms & conditions" },
  { href: "/privacidad", es: "Política de privacidad", en: "Privacy policy" },
  { href: "/libro-reclamaciones", es: "Libro de Reclamaciones", en: "Libro de Reclamaciones" },
] as const;
