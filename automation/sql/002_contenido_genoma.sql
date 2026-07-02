-- ============================================================
-- 002_contenido_genoma.sql
-- "ADN" de cada post publicado: formato, hook, paleta, etc.
-- Cada fila = un post único (post_id = ID externo de plataforma).
-- Idempotente: IF NOT EXISTS / OR REPLACE.
-- ============================================================

CREATE TABLE IF NOT EXISTS contenido_genoma (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id             text        NOT NULL UNIQUE,  -- ID externo de la plataforma
  red                 text        NOT NULL,          -- 'instagram' | 'tiktok' | 'facebook' | 'youtube'
  formato             text        NOT NULL,          -- 'carrusel' | 'historia' | 'reel' | 'post'
  tipo_hook           text,                          -- 'pregunta' | 'dato' | 'historia' | 'beneficio'
  paleta              text,                          -- 'dorado' | 'blanco' | 'natural'
  recurso_visual      text,                          -- 'foto_producto' | 'lifestyle' | 'flat_lay'
  angulo_marca        text,                          -- 'beneficio' | 'confianza' | 'comunidad'
  producto_categoria  text,
  estilo_edicion      text,                          -- 'minimalista' | 'colorido' | 'editorial'
  producto            text,                          -- nombre o SKU
  fecha_publicacion   date,
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contenido_genoma ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_contenido_genoma_red ON contenido_genoma (red);
CREATE INDEX IF NOT EXISTS idx_contenido_genoma_fecha ON contenido_genoma (fecha_publicacion);
