# LionCub Radar — Panel de estado del lanzamiento

Lee `docs/estado.json` y renderiza el panel de control del proyecto en el chat.

## Instrucciones

1. Lee el archivo `docs/estado.json`.
2. Calcula `diasAlLanzamiento` como la diferencia entre `lanzamiento` y la fecha de hoy.
3. Muestra el panel con el siguiente formato exacto (markdown):

---

**🦁 LionCub Radar** · Lanzamiento: `{lanzamiento}` · **{diasAlLanzamiento} días**

**Progreso general: {progresoGeneral}%**
`{barra de progreso con █ y ░, 20 chars}`

**Fases**

| # | Fase | Estado | % |
|---|------|--------|---|
| 0 | {nombre} | {emoji_estado} | {porcentaje}% |
| 1 | ... | ... | ... |
| ... | ... | ... | ... |

Emojis de estado: `completo` → ✅ · `en_curso` → 🔵 · `en_revision` → 🟣 · `pendiente` → ⬜

**Hallazgos abiertos**

- 🔴 Crítico: {lista ids+descripción de hallazgos criticos abiertos}
- 🟠 Alto: {lista ids+descripción de hallazgos alto abiertos}
- 🟡 Medio: {lista ids+descripción de hallazgos medio abiertos}
- 🔵 Bajo / pendiente decisión: {lista ids+descripción de hallazgos bajo}

Si una categoría no tiene hallazgos abiertos, omítela.

**🧑 Pendiente Heber**

Lista numerada de `tareasPendientesHeber` del JSON.

**Freeze:** {freezeDate} — solo bugs desde esa fecha.
`{nota del JSON}`

---

4. Si hay `bloqueadores` no vacíos, añade una sección **🚨 Bloqueadores** encima de hallazgos.
5. No añadas comentarios ni texto extra fuera del panel.
