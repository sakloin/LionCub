-- ============================================================
-- 004_contenido_dashboard.sql
-- Vista que une genoma + métricas más recientes por snapshot.
-- Usada por /api/admin/contenido y el panel /admin/contenido.
-- OR REPLACE = idempotente.
-- ============================================================

CREATE OR REPLACE VIEW contenido_dashboard AS
SELECT
  g.post_id,
  g.red,
  g.formato,
  g.tipo_hook,
  g.paleta,
  g.recurso_visual,
  g.angulo_marca,
  g.producto_categoria,
  g.estilo_edicion,
  g.producto,
  g.fecha_publicacion,        -- campo requerido por el LineChart del dashboard
  m.snapshot,
  m.engagement_rate,
  m.metrica_primaria_valor,
  m.views,
  m.saves,
  m.shares,
  m.likes,
  m.comments,
  m.seguidores_ganados,
  m.collected_at
FROM contenido_genoma g
LEFT JOIN LATERAL (
  -- Para cada post, trae solo la fila más reciente por snapshot
  SELECT *
  FROM contenido_metricas mm
  WHERE mm.post_id = g.post_id
  ORDER BY mm.collected_at DESC
  LIMIT 1
) m ON true;

-- Nota: la vista no lleva RLS propia; hereda el acceso del cliente.
-- El servicio de admin la consulta con service-role, que bypasea RLS.
