-- ============================================================
-- 003_contenido_metricas.sql
-- Snapshot de métricas por post (recolectado cada 8h).
-- Un post puede tener múltiples filas con distintos snapshots.
-- Idempotente: IF NOT EXISTS.
-- ============================================================

CREATE TABLE IF NOT EXISTS contenido_metricas (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id                 text        NOT NULL,    -- referencia a contenido_genoma.post_id
  red                     text        NOT NULL,
  snapshot                text        NOT NULL,    -- '24h' | '7d' | '30d'
  engagement_rate         numeric(8,4),
  metrica_primaria_valor  numeric,                 -- valor de la métrica principal (impresiones, views, etc.)
  views                   bigint,
  saves                   bigint,
  shares                  bigint,
  likes                   bigint,
  comments                bigint,
  seguidores_ganados      int,
  collected_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_post_id FOREIGN KEY (post_id)
    REFERENCES contenido_genoma (post_id)
    ON DELETE CASCADE
);

ALTER TABLE contenido_metricas ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_contenido_metricas_post ON contenido_metricas (post_id);
CREATE INDEX IF NOT EXISTS idx_contenido_metricas_snapshot ON contenido_metricas (snapshot);
CREATE INDEX IF NOT EXISTS idx_contenido_metricas_collected ON contenido_metricas (collected_at DESC);
