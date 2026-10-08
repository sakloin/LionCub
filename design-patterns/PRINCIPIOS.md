# PRINCIPIOS — reglas de diseño (criterios Apple, medibles)

> Iguales para todos los proyectos de Heber. Apple pone los **criterios**; la marca pone su **identidad** (ver `IDENTIDAD.md`). Fuente: vault `Estandar-Diseno-Apple-Identidad`.

| Tema | Regla medible |
|---|---|
| **Jerarquía** | Una sola idea y **un solo CTA primario** por pantalla/sección. Orden: título → apoyo → acción. |
| **Tipografía** | Máx. 2 familias (+ la mono de etiquetas). Escala fija (12/14/17/22/28/40/56). Cuerpo ≥ 16 px, interlínea 1.4–1.6, líneas de 45–75 caracteres. |
| **Espacio** | Rejilla de 8 px. Más aire **entre** secciones (96–160 px desktop) que dentro. El espacio en blanco es contenido. |
| **Color** | Neutros dominan; acento (oro) ≤ 10% de la superficie; rojo **solo** errores/alertas. Contraste AA (4.5:1 texto, 3:1 gráficos). |
| **Botones** | Objetivo táctil ≥ 44×44 px. Primario relleno, secundario contorno/texto. Verbos claros ("Agregar a la bolsa"). |
| **Interacción** | Respuesta visual < 100 ms; animación 200–400 ms con easing suave; nada se mueve sin propósito; respetar `prefers-reduced-motion`. |
| **Contenido** | Cada beneficio **una sola vez**, en el lugar donde ayuda a decidir. Prueba (foto, certificado, reseña) **junto a** cada afirmación. |
| **Imágenes** | Fotografía real y consistente; producto protagonista; peso < 200 KB (WebP/AVIF); `alt` descriptivo siempre; sin duplicados. |
| **Accesibilidad** | Navegable con teclado, foco visible, etiquetas en formularios, tamaños dinámicos. |
| **Vidrio/desenfoque** | Solo en capas flotantes (barra, modal, drawer); nunca sobre texto largo. |

## Proceso de auditoría
1. Capturar cada pantalla en **móvil y desktop**.
2. Listar hallazgos con **gravedad** (crítico / alto / medio / bajo), **regla violada** y **archivo:línea**.
3. Heber prioriza.
4. Aplicar por fases en `plan.md`; el auditor verifica que no se tocó `IDENTIDAD.md`.
5. Re-auditar y comparar antes/después con capturas.
