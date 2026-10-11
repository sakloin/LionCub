# Deuda técnica — Lion Cub

> Los atajos van aquí. No bloquean el lanzamiento salvo que se indique.

| ID | Descripción | Módulo | Urgencia | Anotado |
|---|---|---|---|---|
| DT-01 | `whatsapp/route.ts` ignora `result.images` — fotos nunca se envían por WA directo | `app/api/chat/whatsapp/route.ts` | alta | 2026-10-11 |
| DT-02 | Meta Graph API v20.0 en `whatsapp.ts` — actualizar a v21.0 | `app/lib/whatsapp.ts` | media | 2026-10-11 |
| DT-03 | Errores de tipos pre-existentes en admin/catalogo (react-pdf, lucide-react) | `app/admin/catalogo/**` | baja | 2026-10-11 |
| DT-04 | Skill `auditoria-diseno` no instalada en Claude Code | `.claude/` | baja | 2026-10-11 |
| DT-05 | Foto real en testimonios pendiente — usar avatares de iniciales hasta que Heber provea fotos en `/public/testimonios/` | `app/components/Testimonials.tsx` | baja | 2026-10-11 |
| DT-06 | Selector de idioma EN/ES visible — decisión pendiente de Heber (ocultar o mantener para lanzamiento) | `app/components/LanguageSwitcher.tsx` | baja | 2026-10-11 |
